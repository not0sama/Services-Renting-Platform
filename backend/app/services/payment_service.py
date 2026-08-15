"""
Payment service — simulated escrow (FR-35-39, business-rules.md).
No real payment gateway. Funds move through status states only.
"""
from datetime import datetime, timedelta, timezone
from typing import List, Optional

from fastapi import status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.core.config import settings
from app.core.exceptions import AppException
from app.models.booking import Booking, BookingStatus
from app.models.payment import Payment, PaymentStatus
from app.models.provider import ProviderProfile
from app.models.user import User
from app.schemas.payment import CheckoutCreate, PaymentOut, InvoiceOut, EarningOut
from app.models.audit import AuditLog

# Business rules
AUTO_RELEASE_HOURS = 72  # Phase 2 uses this; set here for completeness


def _resolve_commission_pct(gross_amount: float, category) -> float:
    """
    Resolve commission percentage using tiered brackets if available, else flat rate.
    Tier format: [{"min": 0, "max": 500, "rate": 20}, ...]
    Falls back to category.commission_rate, then settings.FLAT_COMMISSION_RATE.
    """
    if category and getattr(category, "commission_tiers", None):
        tiers = category.commission_tiers
        if isinstance(tiers, list):
            for tier in sorted(tiers, key=lambda t: t.get("min", 0)):
                t_min = float(tier.get("min", 0))
                t_max = float(tier.get("max", float("inf")))
                rate = float(tier.get("rate", 15))
                if t_min <= gross_amount <= t_max:
                    return rate

    # Fallback: flat category rate, then global setting
    if category:
        return float(category.commission_rate)
    return float(getattr(settings, "FLAT_COMMISSION_RATE", 15)) * 100


async def checkout(db: AsyncSession, customer_id: int, data: CheckoutCreate) -> Payment:
    """Create an escrow payment for a confirmed booking (FR-35, FR-36)."""
    booking = await db.get(Booking, data.booking_id)
    if not booking:
        raise AppException(status.HTTP_404_NOT_FOUND, "BOOKING_NOT_FOUND", "Booking not found.")
    if booking.customer_id != customer_id:
        raise AppException(status.HTTP_403_FORBIDDEN, "FORBIDDEN", "This is not your booking.")
    if booking.status not in [BookingStatus.pending, BookingStatus.confirmed]:
        raise AppException(status.HTTP_409_CONFLICT, "BAD_STATUS", "Booking must be pending or confirmed to pay.")

    # Check for existing payment
    existing = await db.execute(select(Payment).where(Payment.booking_id == data.booking_id))
    if existing.scalar_one_or_none():
        raise AppException(status.HTTP_409_CONFLICT, "ALREADY_PAID", "This booking has already been paid.")

    # Get category — use tiered commission if available, else flat rate
    from app.models.category import Category
    category = await db.get(Category, booking.category_id)
    commission_pct = _resolve_commission_pct(booking.price, category)

    gross = booking.price
    commission_amount = round(gross * commission_pct / 100, 2)
    net_amount = round(gross - commission_amount, 2)

    pay_method = data.payment_method or booking.payment_method or "card"
    payment = Payment(
        booking_id=booking.id,
        customer_id=customer_id,
        provider_id=booking.provider_id,
        gross_amount=gross,
        commission_pct=commission_pct,
        commission_amount=commission_amount,
        net_amount=net_amount,
        status=PaymentStatus.held,
        payment_method=pay_method,
    )
    db.add(payment)

    booking.payment_method = pay_method
    if booking.status == BookingStatus.pending:
        booking.status = BookingStatus.confirmed
        booking.updated_at = datetime.utcnow()
        db.add(booking)

    # Audit log (NFR-13)
    db.add(AuditLog(
        actor_id=customer_id,
        action="payment.checkout",
        entity_type="payment",
        extra_data={"booking_id": booking.id, "gross": gross},
    ))

    await db.commit()
    await db.refresh(payment)
    return payment


async def release_payment(db: AsyncSession, booking_id: int, customer_id: int) -> Payment:
    """Customer accepts work — release escrow to provider (FR-63)."""
    pay_result = await db.execute(select(Payment).where(Payment.booking_id == booking_id))
    payment = pay_result.scalar_one_or_none()
    if not payment:
        raise AppException(status.HTTP_404_NOT_FOUND, "PAYMENT_NOT_FOUND", "Payment not found.")
    if payment.customer_id != customer_id:
        raise AppException(status.HTTP_403_FORBIDDEN, "FORBIDDEN", "Not your payment.")
    if payment.status != PaymentStatus.held:
        raise AppException(status.HTTP_409_CONFLICT, "NOT_HELD", "Payment is not in escrow.")

    payment.status = PaymentStatus.released
    payment.released_at = datetime.utcnow()
    payment.updated_at = datetime.utcnow()
    db.add(payment)

    db.add(AuditLog(
        actor_id=customer_id,
        action="payment.release",
        entity_type="payment",
        entity_id=payment.id,
    ))

    await db.commit()
    await db.refresh(payment)
    return payment


async def get_invoice(db: AsyncSession, booking_id: int, user_id: int) -> InvoiceOut:
    """Return invoice data for a booking (FR-38)."""
    pay_result = await db.execute(select(Payment).where(Payment.booking_id == booking_id))
    payment = pay_result.scalar_one_or_none()
    if not payment:
        raise AppException(status.HTTP_404_NOT_FOUND, "PAYMENT_NOT_FOUND", "Invoice not found.")

    booking = await db.get(Booking, booking_id)
    customer = await db.get(User, booking.customer_id)
    provider_profile = await db.get(ProviderProfile, booking.provider_id)
    provider_user = await db.get(User, provider_profile.user_id) if provider_profile else None

    return InvoiceOut(
        invoice_number=payment.invoice_number,
        booking_id=booking_id,
        customer_name=customer.name if customer else "Customer",
        provider_name=provider_user.name if provider_user else "Provider",
        service_title=booking.title,
        gross_amount=payment.gross_amount,
        commission_amount=payment.commission_amount,
        net_amount=payment.net_amount,
        status=payment.status,
        created_at=payment.created_at,
    )


async def get_provider_earnings(db: AsyncSession, user_id: int) -> List[EarningOut]:
    """Provider's payment history (FR-39)."""
    profile_result = await db.execute(
        select(ProviderProfile.id).where(ProviderProfile.user_id == user_id)
    )
    profile_id = profile_result.scalar_one_or_none()
    if not profile_id:
        return []

    result = await db.execute(
        select(Payment)
        .where(Payment.provider_id == profile_id)
        .order_by(Payment.created_at.desc())
    )
    payments = list(result.scalars().all())

    earnings = []
    for pay in payments:
        booking = await db.get(Booking, pay.booking_id)
        customer = await db.get(User, pay.customer_id)
        earnings.append(EarningOut(
            invoice_number=pay.invoice_number,
            booking_id=pay.booking_id,
            customer_name=customer.name if customer else "Customer",
            service_title=booking.title if booking else "Service",
            gross_amount=pay.gross_amount,
            commission_amount=pay.commission_amount,
            net_amount=pay.net_amount,
            status=pay.status,
            released_at=pay.released_at,
            created_at=pay.created_at,
        ))
    return earnings
