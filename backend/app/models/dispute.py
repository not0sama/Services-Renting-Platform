"""Dispute model — FR-49."""
from __future__ import annotations

import enum
from datetime import datetime, timezone
from typing import Optional

from sqlmodel import Field, SQLModel


class DisputeStatus(str, enum.Enum):
    open = "open"
    under_review = "under_review"
    resolved_refund = "resolved_refund"
    resolved_release = "resolved_release"
    resolved_warning = "resolved_warning"
    closed = "closed"


class Dispute(SQLModel, table=True):
    __tablename__ = "disputes"

    id: Optional[int] = Field(default=None, primary_key=True)
    booking_id: int = Field(foreign_key="bookings.id", index=True)
    opened_by_user_id: int = Field(foreign_key="users.id", index=True)
    reason: str = Field(max_length=2000)
    evidence_urls: Optional[str] = Field(default=None, max_length=2000)  # comma-separated
    status: DisputeStatus = Field(default=DisputeStatus.open, index=True)
    admin_notes: Optional[str] = Field(default=None, max_length=2000)
    resolved_by_admin_id: Optional[int] = Field(default=None, foreign_key="users.id")
    opened_at: datetime = Field(default_factory=datetime.utcnow)
    resolved_at: Optional[datetime] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
