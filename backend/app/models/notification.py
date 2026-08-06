from enum import Enum
from typing import Optional, Any
from datetime import datetime, timezone
from sqlmodel import SQLModel, Field, Column
from sqlalchemy import JSON


class NotificationType(str, Enum):
    # Booking events
    booking_confirmed = "booking_confirmed"
    booking_status_changed = "booking_status_changed"
    booking_cancelled = "booking_cancelled"
    booking_completed = "booking_completed"
    # Offer events
    offer_received = "offer_received"
    offer_accepted = "offer_accepted"
    offer_declined = "offer_declined"
    # Review events
    review_received = "review_received"
    # Provider verification
    verification_approved = "verification_approved"
    verification_rejected = "verification_rejected"
    # Escrow
    escrow_released = "escrow_released"
    escrow_auto_released = "escrow_auto_released"
    revision_requested = "revision_requested"
    # Admin
    announcement = "announcement"
    # Generic
    system = "system"


class Notification(SQLModel, table=True):
    """In-app notification feed (FR-41)."""
    __tablename__ = "notifications"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    type: NotificationType
    title: str = Field(max_length=200)
    body: str = Field(max_length=500)
    data: Optional[Any] = Field(default=None, sa_column=Column(JSON))  # e.g. {"booking_id": 5}
    read_at: Optional[datetime] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)
