"""
Review service (FR-43, FR-44, FR-45, NFR-15).
"""
from datetime import datetime, timezone
from typing import List

from fastapi import status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, func

from app.core.exceptions import AppException
from app.models.booking import Booking, BookingStatus
from app.models.review import Review
from app.models.provider import ProviderProfile
from app.schemas.misc import ReviewCreate, ReviewOut
from app.services import notification_service


async def create_review(db: AsyncSession, reviewer_id: int, data: ReviewCreate) -> Review:
    """Only allowed when booking is completed (NFR-15)."""
    booking = await db.get(Booking, data.booking_id)
    if not booking:
        raise AppException(status.HTTP_404_NOT_FOUND, "BOOKING_NOT_FOUND", "Booking not found.")
    if booking.customer_id != reviewer_id:
        raise AppException(status.HTTP_403_FORBIDDEN, "FORBIDDEN", "You can only review your own bookings.")
    if booking.status != BookingStatus.completed:
        raise AppException(status.HTTP_409_CONFLICT, "BOOKING_NOT_COMPLETED", "You can only review completed bookings.")

    # Check for duplicate review
    existing = await db.execute(
        select(Review).where(Review.booking_id == data.booking_id)
    )
    if existing.scalar_one_or_none():
        raise AppException(status.HTTP_409_CONFLICT, "ALREADY_REVIEWED", "You have already reviewed this booking.")

    # Resolve overall rating from criteria or direct value
    try:
        overall = data.resolved_rating()
    except ValueError as exc:
        raise AppException(status.HTTP_422_UNPROCESSABLE_ENTITY, "NO_RATING", str(exc))

    review = Review(
        booking_id=data.booking_id,
        reviewer_id=reviewer_id,
        provider_id=booking.provider_id,
        rating=overall,
        quality_rating=data.quality_rating,
        punctuality_rating=data.punctuality_rating,
        communication_rating=data.communication_rating,
        comment=data.comment,
    )
    db.add(review)

    # Update provider average rating (FR-45)
    await _recalculate_avg_rating(db, booking.provider_id)

    # Update trust score to reflect new rating (FR-66)
    from app.services.reputation import update_provider_reputation
    await update_provider_reputation(booking.provider_id, db)

    # Notify provider
    await notification_service.review_received(db, booking.provider_id, data.booking_id, overall)

    await db.commit()
    await db.refresh(review)
    return review


async def _recalculate_avg_rating(db: AsyncSession, provider_id: int) -> None:
    """Recalculate and persist provider's average rating after a new review."""
    result = await db.execute(
        select(func.avg(Review.rating), func.count(Review.id))
        .where(Review.provider_id == provider_id)
    )
    avg, count = result.one()
    profile = await db.get(ProviderProfile, provider_id)
    if profile:
        profile.avg_rating = round(float(avg or 0), 2)
        profile.updated_at = datetime.utcnow()
        db.add(profile)


async def add_provider_response(
    db: AsyncSession,
    review_id: int,
    provider_user_id: int,
    response_text: str,
) -> Review:
    """Provider responds to a review (FR-44)."""
    review = await db.get(Review, review_id)
    if not review:
        raise AppException(status.HTTP_404_NOT_FOUND, "REVIEW_NOT_FOUND", "Review not found.")

    # Verify ownership
    profile_result = await db.execute(
        select(ProviderProfile.id).where(ProviderProfile.user_id == provider_user_id)
    )
    profile_id = profile_result.scalar_one_or_none()
    if review.provider_id != profile_id:
        raise AppException(status.HTTP_403_FORBIDDEN, "FORBIDDEN", "This is not your review to respond to.")
    if review.provider_response:
        raise AppException(status.HTTP_409_CONFLICT, "ALREADY_RESPONDED", "You have already responded to this review.")

    review.provider_response = response_text
    review.responded_at = datetime.utcnow()
    db.add(review)
    await db.commit()
    await db.refresh(review)
    return review


async def list_provider_reviews(
    db: AsyncSession,
    provider_id: int,
    page: int = 1,
    limit: int = 20,
) -> List[Review]:
    result = await db.execute(
        select(Review)
        .where(Review.provider_id == provider_id, Review.is_flagged == False)
        .order_by(Review.created_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
    )
    return list(result.scalars().all())
