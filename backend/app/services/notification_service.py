"""
Notification service — emits in-app notifications on platform events (FR-41).
All emit_* functions are fire-and-forget (called without await in service layer).
"""
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.models.notification import Notification, NotificationType


async def emit(
    db: AsyncSession,
    user_id: int,
    type: NotificationType,
    title: str,
    body: str,
    data: Optional[dict] = None,
) -> Notification:
    n = Notification(
        user_id=user_id,
        type=type,
        title=title,
        body=body,
        data=data or {},
        created_at=datetime.now(timezone.utc),
    )
    db.add(n)
    await db.flush()
    return n


# ── Convenience wrappers ──────────────────────────────────────────────────────

async def booking_confirmed(db: AsyncSession, customer_id: int, provider_id: int, booking_id: int, service_title: str):
    await emit(db, customer_id, NotificationType.booking_confirmed,
               "Booking Confirmed 🎉", f"Your booking for '{service_title}' has been confirmed.",
               {"booking_id": booking_id})
    await emit(db, provider_id, NotificationType.booking_confirmed,
               "New Booking 📋", f"You have a new confirmed booking: '{service_title}'.",
               {"booking_id": booking_id})


async def booking_status_changed(db: AsyncSession, customer_id: int, booking_id: int, new_status: str, service_title: str):
    status_messages = {
        "en_route": "Your provider is on the way! 🚗",
        "in_progress": "Your service has started 🔧",
        "completed": "Service marked as complete. Review your work and release payment.",
        "cancelled": f"Your booking for '{service_title}' was cancelled.",
    }
    msg = status_messages.get(new_status, f"Booking status updated to: {new_status}")
    await emit(db, customer_id, NotificationType.booking_status_changed,
               "Booking Update", msg, {"booking_id": booking_id})


async def offer_received(db: AsyncSession, customer_id: int, job_id: int, provider_name: str):
    await emit(db, customer_id, NotificationType.offer_received,
               "New Offer Received 💼", f"{provider_name} submitted an offer on your job.",
               {"job_id": job_id})


async def offer_decision(db: AsyncSession, provider_id: int, offer_id: int, accepted: bool):
    title = "Offer Accepted! 🎉" if accepted else "Offer Declined"
    body = "Your offer was accepted. Proceed to the booking." if accepted else "Your offer was not selected."
    await emit(db, provider_id,
               NotificationType.offer_accepted if accepted else NotificationType.offer_declined,
               title, body, {"offer_id": offer_id})


async def review_received(db: AsyncSession, provider_id: int, booking_id: int, rating: int):
    stars = "⭐" * rating
    await emit(db, provider_id, NotificationType.review_received,
               "New Review Received", f"You received a {rating}-star review {stars}",
               {"booking_id": booking_id})


async def verification_decision(db: AsyncSession, provider_user_id: int, approved: bool, notes: Optional[str]):
    if approved:
        await emit(db, provider_user_id, NotificationType.verification_approved,
                   "Account Verified ✅", "Your provider account has been approved. You can now receive bookings!")
    else:
        await emit(db, provider_user_id, NotificationType.verification_rejected,
                   "Verification Not Approved", f"Your account verification was rejected. Reason: {notes or 'No reason provided.'}")
