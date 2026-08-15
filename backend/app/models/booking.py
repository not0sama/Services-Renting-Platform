from enum import Enum
from typing import Optional
from datetime import datetime, timezone
from sqlmodel import SQLModel, Field


class BookingStatus(str, Enum):
    pending = "pending"
    confirmed = "confirmed"
    en_route = "en_route"
    in_progress = "in_progress"
    completed = "completed"
    cancelled = "cancelled"
    revision_requested = "revision_requested"  # Phase 2 escrow


class BookingType(str, Enum):
    instant = "instant"
    quote = "quote"


# Valid provider-driven status transitions (FR-29, NFR-8)
VALID_TRANSITIONS: dict[BookingStatus, list[BookingStatus]] = {
    BookingStatus.pending:             [BookingStatus.confirmed, BookingStatus.cancelled],
    BookingStatus.confirmed:           [BookingStatus.en_route, BookingStatus.cancelled],
    BookingStatus.en_route:            [BookingStatus.in_progress, BookingStatus.cancelled],
    BookingStatus.in_progress:         [BookingStatus.completed],
    BookingStatus.completed:           [BookingStatus.revision_requested],  # customer only
    BookingStatus.revision_requested:  [BookingStatus.completed],           # provider re-submits
    BookingStatus.cancelled:           [],
}


class Booking(SQLModel, table=True):
    """
    Central booking record linking customer, provider, and payment (FR-28-31).
    Created either via Instant Book or when a Custom Quote offer is accepted.
    """
    __tablename__ = "bookings"

    id: Optional[int] = Field(default=None, primary_key=True)

    # Participants
    customer_id: int = Field(foreign_key="users.id", index=True)
    provider_id: int = Field(foreign_key="provider_profiles.id", index=True)
    # Denormalised: the User.id of the provider (for chat, notifications, location checks)
    provider_user_id: Optional[int] = Field(default=None, foreign_key="users.id", index=True)
    category_id: int = Field(foreign_key="categories.id")

    # Source references
    service_id: Optional[int] = Field(default=None, foreign_key="services.id")        # Instant Book
    job_offer_id: Optional[int] = Field(default=None, foreign_key="offers.id")         # Custom Quote

    # Content & Location
    title: str = Field(max_length=200)
    description: Optional[str] = Field(default=None, max_length=2000)
    location_address: Optional[str] = Field(default=None, max_length=500)
    latitude: Optional[float] = Field(default=None)
    longitude: Optional[float] = Field(default=None)

    # Scheduling
    scheduled_datetime: Optional[datetime] = Field(default=None, index=True)
    duration_minutes: int = Field(ge=15)

    # Pricing
    price: float = Field(ge=0)

    # State machine
    status: BookingStatus = Field(default=BookingStatus.pending, index=True)
    booking_type: BookingType = Field(default=BookingType.instant)
    payment_method: Optional[str] = Field(default="card", max_length=20)

    # Cancellation
    cancellation_reason: Optional[str] = Field(default=None, max_length=500)
    cancelled_by_role: Optional[str] = Field(default=None, max_length=20)

    # Revision tracking (Phase 2 - FR-65)
    revision_notes: Optional[str] = Field(default=None, max_length=1000)
    revision_count: int = Field(default=0, ge=0)

    # Escrow auto-release timer (Phase 2 - FR-64)
    auto_release_at: Optional[datetime] = Field(default=None, index=True)

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
