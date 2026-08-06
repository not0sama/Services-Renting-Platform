from enum import Enum
from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field


class ReportStatus(str, Enum):
    pending = "pending"
    reviewed = "reviewed"
    dismissed = "dismissed"
    action_taken = "action_taken"


class Report(SQLModel, table=True):
    """User safety report for flagging inappropriate behavior (FR-47)."""
    __tablename__ = "reports"

    id: Optional[int] = Field(default=None, primary_key=True)
    reporter_id: int = Field(foreign_key="users.id", index=True)
    reported_user_id: int = Field(foreign_key="users.id", index=True)
    booking_id: Optional[int] = Field(default=None, foreign_key="bookings.id", index=True)

    reason: str = Field(max_length=500)
    details: Optional[str] = Field(default=None, max_length=2000)

    status: ReportStatus = Field(default=ReportStatus.pending, index=True)
    admin_notes: Optional[str] = Field(default=None, max_length=1000)

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
