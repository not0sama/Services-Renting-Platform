"""
Booking lifecycle service (FR-28-31, FR-63-65).
Enforces valid state transitions (NFR-8) and cancellation policy (business-rules.md).
"""
from datetime import datetime, timedelta, timezone
from typing import List, Optional

from fastapi import status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.core.config import settings
from app.core.exceptions import AppException
from app.models.booking import Booking, BookingStatus, BookingType, VALID_TRANSITIONS
from app.models.job import JobRequest, Offer, JobStatus, OfferStatus
from app.models.service import Service
from app.models.payment import Payment, PaymentStatus
from app.models.provider import ProviderProfile
from app.models.user import User
from app.schemas.booking import InstantBookCreate, CancelBooking, RescheduleBooking
from app.services import notification_service
from app.services.provider_service import get_profile_by_user_id

# Business rules
CANCELLATION_FREE_HOURS = 24   # cancel within this window = full refund
CANCELLATION_FEE_PCT = 10.0    # fee if cancelling late


async def get_booking(db: AsyncSession, booking_id: int) -> Booking:
    b = await db.get(Booking, booking_id)
    if not b:
        raise AppException(status.HTTP_404_NOT_FOUND, "BOOKING_NOT_FOUND", "Booking not found.")
    return b


async def list_bookings(
    db: AsyncSession,
    user_id: int,
    role: str,
    booking_status: Optional[BookingStatus] = None,
    page: int = 1,
    limit: int = 20,
) -> List[Booking]:
    if role == "customer":
        stmt = select(Booking).where(Booking.customer_id == user_id)
    elif role == "provider":
        profile_result = await db.execute(select(ProviderProfile.id).where(ProviderProfile.user_id == user_id))
        profile_id = profile_result.scalar_one_or_none()
        if not profile_id:
            return []
        stmt = select(Booking).where(Booking.provider_id == profile_id)
    else:
        stmt = select(Booking)

    if booking_status:
        stmt = stmt.where(Booking.status == booking_status)

    stmt = stmt.order_by(Booking.created_at.desc()).offset((page - 1) * limit).limit(limit)
    result = await db.execute(stmt)
    return list(result.scalars().all())


# -- Instant Book (FR-23) -------------------------------------------------------

async def instant_book(
    db: AsyncSession,
    customer_id: int,
    data: InstantBookCreate,
) -> Booking:
    svc = await db.get(Service, data.service_id)
    if not svc or not svc.is_active:
        raise AppException(status.HTTP_404_NOT_FOUND, "SERVICE_NOT_FOUND", "Service not found or inactive.")

    # Double-booking guard: check if slot is still free (FR-24)
    end_dt = data.scheduled_datetime + timedelta(minutes=svc.duration_minutes)
    conflict = await db.execute(
        select(Booking).where(
            Booking.provider_id == svc.provider_id,
            Booking.status.in_([BookingStatus.confirmed, BookingStatus.en_route, BookingStatus.in_progress]),
            Booking.scheduled_datetime < end_dt,
            Booking.scheduled_datetime >= data.scheduled_datetime,
        )
    )
    if conflict.scalar_one_or_none():
        raise AppException(status.HTTP_409_CONFLICT, "SLOT_TAKEN", "This time slot is no longer available. Please choose another.")

    # Resolve provider_user_id
    provider_profile = await db.get(ProviderProfile, svc.provider_id)
    provider_user_id = provider_profile.user_id if provider_profile else None

    booking = Booking(
        customer_id=customer_id,
        provider_id=svc.provider_id,
        provider_user_id=provider_user_id,
        category_id=svc.category_id,
        service_id=svc.id,
        title=svc.title,
        description=svc.description,
        scheduled_datetime=data.scheduled_datetime,
        duration_minutes=svc.duration_minutes,
        price=svc.price,
        status=BookingStatus.pending,
        booking_type=BookingType.instant,
    )
    db.add(booking)

    # Notifications
    if provider_user_id:
        await notification_service.booking_confirmed(db, customer_id, provider_user_id, 0, svc.title)

    await db.commit()
    await db.refresh(booking)
    return booking


# -- Accept Offer -> Booking (FR-19) --------------------------------------------

async def accept_offer_create_booking(
    db: AsyncSession,
    customer_id: int,
    job_id: int,
    offer_id: int,
) -> Booking:
    from app.models.job import JobRequest, Offer, OfferStatus, JobStatus
    job = await db.get(JobRequest, job_id)
    offer = await db.get(Offer, offer_id)

    if not job or not offer:
        raise AppException(status.HTTP_404_NOT_FOUND, "NOT_FOUND", "Job or offer not found.")
    if job.customer_id != customer_id:
        raise AppException(status.HTTP_403_FORBIDDEN, "FORBIDDEN", "This is not your job.")
    if offer.job_id != job_id:
        raise AppException(status.HTTP_400_BAD_REQUEST, "BAD_REQUEST", "Offer does not belong to this job.")
    if offer.status != OfferStatus.pending:
        raise AppException(status.HTTP_409_CONFLICT, "OFFER_NOT_AVAILABLE", "This offer is no longer available.")

    # Resolve provider_user_id
    provider_profile = await db.get(ProviderProfile, offer.provider_id)
    provider_user_id = provider_profile.user_id if provider_profile else None

    # Compute final price with urgent surcharge if applicable
    final_price = offer.price
    if job.is_urgent and offer.urgent_surcharge_pct:
        surcharge = offer.price * (offer.urgent_surcharge_pct / 100.0)
        final_price = round(offer.price + surcharge, 2)

    # Create booking
    booking = Booking(
        customer_id=customer_id,
        provider_id=offer.provider_id,
        provider_user_id=provider_user_id,
        category_id=job.category_id,
        job_offer_id=offer.id,
        title=job.title,
        description=job.description,
        scheduled_datetime=job.scheduled_date,
        duration_minutes=offer.duration_minutes,
        price=final_price,
        status=BookingStatus.confirmed,
        booking_type=BookingType.quote,
    )
    db.add(booking)

    # Accept this offer
    offer.status = OfferStatus.accepted
    offer.updated_at = datetime.now(timezone.utc)
    db.add(offer)

    # Decline all other pending offers on this job
    others = await db.execute(
        select(Offer).where(
            Offer.job_id == job_id,
            Offer.id != offer_id,
            Offer.status == OfferStatus.pending,
        )
    )
    for o in others.scalars().all():
        o.status = OfferStatus.declined
        o.updated_at = datetime.now(timezone.utc)
        db.add(o)
        provider = await db.get(ProviderProfile, o.provider_id)
        if provider:
            await notification_service.offer_decision(db, provider.user_id, o.id, accepted=False)

    # Close the job
    job.status = JobStatus.accepted
    job.updated_at = datetime.now(timezone.utc)
    db.add(job)

    # Notify accepted provider
    if provider_user_id:
        await notification_service.offer_decision(db, provider_user_id, offer.id, accepted=True)

    await db.commit()
    await db.refresh(booking)
    return booking


# -- Status Transitions (FR-29) -------------------------------------------------

async def update_status(
    db: AsyncSession,
    booking_id: int,
    actor_user_id: int,
    actor_role: str,
    new_status: BookingStatus,
) -> Booking:
    booking = await get_booking(db, booking_id)

    # Authorisation check
    if actor_role == "provider":
        profile_result = await db.execute(select(ProviderProfile.id).where(ProviderProfile.user_id == actor_user_id))
        provider_id = profile_result.scalar_one_or_none()
        if booking.provider_id != provider_id:
            raise AppException(status.HTTP_403_FORBIDDEN, "FORBIDDEN", "This is not your booking.")
    elif actor_role == "customer":
        if booking.customer_id != actor_user_id:
            raise AppException(status.HTTP_403_FORBIDDEN, "FORBIDDEN", "This is not your booking.")

    # Enforce valid transitions
    allowed = VALID_TRANSITIONS.get(booking.status, [])
    if new_status not in allowed:
        raise AppException(
            status.HTTP_409_CONFLICT,
            "INVALID_TRANSITION",
            f"Cannot transition from '{booking.status}' to '{new_status}'.",
        )

    booking.status = new_status
    booking.updated_at = datetime.now(timezone.utc)

    # On completion: set auto_release_at timer (FR-64)
    if new_status == BookingStatus.completed:
        hours = getattr(settings, "AUTO_RELEASE_HOURS", 72)
        booking.auto_release_at = datetime.now(timezone.utc) + timedelta(hours=hours)

        # Update provider completion metrics
        await _increment_completion_metrics(db, booking.provider_id)

        # Update trust score
        from app.services.reputation import update_provider_reputation
        await update_provider_reputation(booking.provider_id, db)

    db.add(booking)

    # Notify customer of status changes
    await notification_service.booking_status_changed(
        db, booking.customer_id, booking_id, new_status.value, booking.title
    )

    await db.commit()
    await db.refresh(booking)
    return booking


async def _increment_completion_metrics(db: AsyncSession, provider_id: int) -> None:
    """Increment completed_jobs_count and recalculate completion_rate on booking complete."""
    profile = await db.get(ProviderProfile, provider_id)
    if not profile:
        return
    profile.completed_jobs_count += 1
    profile.total_jobs_accepted = max(profile.total_jobs_accepted, profile.completed_jobs_count)
    if profile.total_jobs_accepted > 0:
        profile.completion_rate = round(
            profile.completed_jobs_count / profile.total_jobs_accepted, 4
        )
    profile.updated_at = datetime.now(timezone.utc)
    db.add(profile)


# -- Escrow: Request Revision (FR-65) ------------------------------------------

async def request_revision(
    db: AsyncSession,
    booking_id: int,
    customer_id: int,
    notes: str,
) -> Booking:
    """Customer requests revision after provider marks complete. Pauses auto-release timer."""
    booking = await get_booking(db, booking_id)

    if booking.customer_id != customer_id:
        raise AppException(status.HTTP_403_FORBIDDEN, "FORBIDDEN", "Not your booking.")
    if booking.status != BookingStatus.completed:
        raise AppException(
            status.HTTP_409_CONFLICT,
            "INVALID_STATUS",
            "Revision can only be requested when booking is completed.",
        )

    booking.status = BookingStatus.revision_requested
    booking.revision_notes = notes
    booking.revision_count += 1
    booking.auto_release_at = None  # Pause auto-release timer while under revision
    booking.updated_at = datetime.now(timezone.utc)
    db.add(booking)

    # Update payment to pause auto-release
    pay_result = await db.execute(select(Payment).where(Payment.booking_id == booking_id))
    payment = pay_result.scalar_one_or_none()
    if payment:
        payment.auto_release_at = None
        db.add(payment)

    # Notify provider
    if booking.provider_user_id:
        from app.models.notification import NotificationType
        from app.services.notification_service import emit
        await emit(
            db, booking.provider_user_id or booking.provider_id, NotificationType.revision_requested,
            "Revision Requested",
            f"Customer requested a revision for booking #{booking_id}: {notes[:100]}",
        )

    await db.commit()
    await db.refresh(booking)
    return booking


# -- Escrow: Resubmit as Complete (FR-65) ---------------------------------------

async def resubmit_complete(
    db: AsyncSession,
    booking_id: int,
    provider_user_id: int,
) -> Booking:
    """Provider resubmits after revision. Resets auto_release_at timer."""
    booking = await get_booking(db, booking_id)

    # Verify provider ownership
    profile_result = await db.execute(
        select(ProviderProfile.id).where(ProviderProfile.user_id == provider_user_id)
    )
    profile_id = profile_result.scalar_one_or_none()
    if booking.provider_id != profile_id:
        raise AppException(status.HTTP_403_FORBIDDEN, "FORBIDDEN", "Not your booking.")

    if booking.status != BookingStatus.revision_requested:
        raise AppException(
            status.HTTP_409_CONFLICT,
            "INVALID_STATUS",
            "Can only resubmit when revision is requested.",
        )

    hours = getattr(settings, "AUTO_RELEASE_HOURS", 72)
    new_release_at = datetime.now(timezone.utc) + timedelta(hours=hours)

    booking.status = BookingStatus.completed
    booking.auto_release_at = new_release_at
    booking.updated_at = datetime.now(timezone.utc)
    db.add(booking)

    # Reset payment auto_release_at
    pay_result = await db.execute(select(Payment).where(Payment.booking_id == booking_id))
    payment = pay_result.scalar_one_or_none()
    if payment:
        payment.auto_release_at = new_release_at
        db.add(payment)

    # Notify customer
    from app.models.notification import NotificationType
    from app.services.notification_service import emit
    await emit(
        db, booking.customer_id, NotificationType.booking_status_changed,
        "Work Resubmitted",
        f"The provider has resubmitted the completed work for booking #{booking_id}. Please review.",
    )

    await db.commit()
    await db.refresh(booking)
    return booking


# -- Cancellation (FR-30) -------------------------------------------------------

async def cancel_booking(
    db: AsyncSession,
    booking_id: int,
    actor_user_id: int,
    actor_role: str,
    data: CancelBooking,
) -> Booking:
    booking = await get_booking(db, booking_id)

    if booking.status not in [BookingStatus.pending, BookingStatus.confirmed, BookingStatus.en_route, BookingStatus.in_progress]:
        raise AppException(status.HTTP_409_CONFLICT, "CANNOT_CANCEL", "This booking cannot be cancelled.")

    # Authorisation
    if actor_role == "customer" and booking.customer_id != actor_user_id:
        raise AppException(status.HTTP_403_FORBIDDEN, "FORBIDDEN", "Not your booking.")
    if actor_role == "provider":
        profile_result = await db.execute(select(ProviderProfile.id).where(ProviderProfile.user_id == actor_user_id))
        provider_id = profile_result.scalar_one_or_none()
        if booking.provider_id != provider_id:
            raise AppException(status.HTTP_403_FORBIDDEN, "FORBIDDEN", "Not your booking.")

    # Cancellation fee check
    refund_full = True
    if booking.scheduled_datetime:
        hours_until = (booking.scheduled_datetime - datetime.now(timezone.utc)).total_seconds() / 3600
        refund_full = hours_until >= CANCELLATION_FREE_HOURS

    # Update payment if exists
    pay_result = await db.execute(select(Payment).where(Payment.booking_id == booking_id))
    payment = pay_result.scalar_one_or_none()
    if payment and payment.status == PaymentStatus.held:
        payment.status = PaymentStatus.refunded
        payment.released_at = datetime.now(timezone.utc)
        payment.updated_at = datetime.now(timezone.utc)
        db.add(payment)

    # Track cancellation metric
    if actor_role == "provider":
        await _increment_cancellation_metrics(db, booking.provider_id)

    booking.status = BookingStatus.cancelled
    booking.cancellation_reason = data.reason
    booking.cancelled_by_role = actor_role
    booking.updated_at = datetime.now(timezone.utc)
    db.add(booking)

    await db.commit()
    await db.refresh(booking)
    return booking


async def _increment_cancellation_metrics(db: AsyncSession, provider_id: int) -> None:
    """Track provider cancellation rate when provider cancels a booking."""
    profile = await db.get(ProviderProfile, provider_id)
    if not profile:
        return
    profile.total_jobs_cancelled += 1
    if profile.total_jobs_accepted > 0:
        profile.cancellation_rate = round(
            profile.total_jobs_cancelled / profile.total_jobs_accepted, 4
        )
    profile.updated_at = datetime.now(timezone.utc)
    db.add(profile)


# -- Reschedule (FR-31) ---------------------------------------------------------

async def reschedule_booking(
    db: AsyncSession,
    booking_id: int,
    customer_id: int,
    data: RescheduleBooking,
) -> Booking:
    booking = await get_booking(db, booking_id)
    if booking.customer_id != customer_id:
        raise AppException(status.HTTP_403_FORBIDDEN, "FORBIDDEN", "Not your booking.")
    if booking.status not in [BookingStatus.pending, BookingStatus.confirmed]:
        raise AppException(status.HTTP_409_CONFLICT, "CANNOT_RESCHEDULE", "Booking cannot be rescheduled at this stage.")

    booking.scheduled_datetime = data.new_datetime
    booking.updated_at = datetime.now(timezone.utc)
    # Reset to pending so provider re-confirms
    booking.status = BookingStatus.pending
    db.add(booking)
    await db.commit()
    await db.refresh(booking)
    return booking
