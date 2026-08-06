from typing import Optional
from datetime import datetime, timezone
from sqlmodel import SQLModel, Field


class Review(SQLModel, table=True):
    """
    Customer review for a completed booking (FR-43, FR-44, FR-45).
    Phase 2: multi-criteria ratings (quality, punctuality, communication).
    Only allowed when booking.status == 'completed' (NFR-15 enforced in service layer).
    """
    __tablename__ = "reviews"

    id: Optional[int] = Field(default=None, primary_key=True)
    booking_id: int = Field(foreign_key="bookings.id", unique=True, index=True)  # one review per booking
    reviewer_id: int = Field(foreign_key="users.id", index=True)
    provider_id: int = Field(foreign_key="provider_profiles.id", index=True)

    # Overall star rating (1-5) — computed from criteria if provided, else stored directly
    rating: int = Field(ge=1, le=5)

    # Multi-criteria ratings (Phase 2 — FR-44): each 1-5, optional
    quality_rating: Optional[int] = Field(default=None, ge=1, le=5)      # quality of work
    punctuality_rating: Optional[int] = Field(default=None, ge=1, le=5)  # arrived/delivered on time
    communication_rating: Optional[int] = Field(default=None, ge=1, le=5)  # responsiveness

    comment: Optional[str] = Field(default=None, max_length=2000)

    # Provider response (FR-44)
    provider_response: Optional[str] = Field(default=None, max_length=1000)
    responded_at: Optional[datetime] = Field(default=None)

    # Moderation (Phase 3 — FR-53)
    is_flagged: bool = Field(default=False)
    flag_reason: Optional[str] = Field(default=None, max_length=500)

    created_at: datetime = Field(default_factory=datetime.utcnow)
