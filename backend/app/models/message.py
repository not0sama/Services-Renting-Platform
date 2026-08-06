"""Message model — in-app chat (FR-40)."""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from sqlmodel import Field, SQLModel


class Message(SQLModel, table=True):
    __tablename__ = "messages"

    id: Optional[int] = Field(default=None, primary_key=True)
    booking_id: int = Field(foreign_key="bookings.id", index=True)
    sender_id: int = Field(foreign_key="users.id", index=True)
    content: str = Field(max_length=4000)
    attachment_url: Optional[str] = Field(default=None, max_length=500)
    read_at: Optional[datetime] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ProviderLocation(SQLModel, table=True):
    """Last known location for a provider during en_route state (FR-42)."""
    __tablename__ = "provider_locations"

    id: Optional[int] = Field(default=None, primary_key=True)
    booking_id: int = Field(foreign_key="bookings.id", index=True, unique=True)
    provider_id: int = Field(foreign_key="users.id", index=True)
    latitude: float
    longitude: float
    updated_at: datetime = Field(default_factory=datetime.utcnow)
