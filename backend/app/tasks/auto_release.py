"""Auto-release scheduler (FR-64/65) — polls every N seconds and releases held payments."""
from __future__ import annotations

import asyncio
import logging
from datetime import datetime, timezone

from sqlmodel import select

from app.core.config import settings
from app.db.session import get_session
from app.models.booking import Booking, BookingStatus
from app.models.payment import Payment, PaymentStatus

logger = logging.getLogger(__name__)


async def _release_overdue_payments() -> None:
    """Find payments past auto_release_at and release them if booking is completed and no dispute."""
    async for db in get_session():
        try:
            # Use naive UTC datetime to match PostgreSQL TIMESTAMP WITHOUT TIME ZONE
            now = datetime.utcnow()
            stmt = (
                select(Payment)
                .where(
                    Payment.status == PaymentStatus.held,
                    Payment.auto_release_at <= now,
                )
            )
            result = await db.execute(stmt)
            payments = result.scalars().all()

            for payment in payments:
                # Verify booking is still completed (not disputed/revised)
                b_result = await db.execute(select(Booking).where(Booking.id == payment.booking_id))
                booking = b_result.scalar_one_or_none()
                if booking and booking.status == BookingStatus.completed:
                    payment.status = PaymentStatus.auto_released
                    payment.released_at = datetime.utcnow()
                    db.add(payment)
                    logger.info("Auto-released payment %s for booking %s", payment.id, booking.id)

                    # Notify customer and provider
                    from app.services.notification_service import emit
                    from app.models.notification import NotificationType
                    await emit(db, booking.customer_id, NotificationType.escrow_auto_released,
                               "Payment Auto-Released",
                               f"Payment for booking #{booking.id} was automatically released to the provider.")
                    await emit(db, booking.provider_user_id or booking.provider_id, NotificationType.escrow_auto_released,
                               "Payment Released",
                               f"Your payment for booking #{booking.id} has been released.")

            if payments:
                await db.commit()
        except Exception as exc:
            logger.error("Auto-release error: %s", exc)
            await db.rollback()
        break  # get_session is a generator, only need one session


async def auto_release_loop() -> None:
    """Background loop that polls every SCHEDULER_POLL_SECONDS."""
    poll_seconds = getattr(settings, "SCHEDULER_POLL_SECONDS", 300)
    logger.info("Auto-release scheduler started (poll every %ds)", poll_seconds)
    while True:
        try:
            await _release_overdue_payments()
        except Exception as exc:
            logger.error("Scheduler iteration error: %s", exc)
        await asyncio.sleep(poll_seconds)
