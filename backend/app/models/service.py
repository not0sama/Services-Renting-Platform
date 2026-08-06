from typing import Optional
from datetime import datetime, date, time, timezone
from sqlmodel import SQLModel, Field, UniqueConstraint


class Service(SQLModel, table=True):
    """
    Instant Book service package offered by a provider in a category (FR-21).
    A provider can have multiple packages per category (e.g. Basic / Standard / Premium).
    """
    __tablename__ = "services"

    id: Optional[int] = Field(default=None, primary_key=True)
    provider_id: int = Field(foreign_key="provider_profiles.id", index=True)
    category_id: int = Field(foreign_key="categories.id", index=True)

    title: str = Field(min_length=3, max_length=150)
    description: Optional[str] = Field(default=None, max_length=2000)
    price: float = Field(ge=0.0)           # base price for this package
    duration_minutes: int = Field(ge=15)   # expected job duration
    is_active: bool = Field(default=True)

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class Availability(SQLModel, table=True):
    """
    Provider recurring weekly availability (FR-22).
    day_of_week: 0=Monday … 6=Sunday.
    One record per (provider, day_of_week) defines working hours.
    Blocked dates override weekly rules.
    """
    __tablename__ = "availability"
    __table_args__ = (UniqueConstraint("provider_id", "day_of_week", "blocked_date"),)

    id: Optional[int] = Field(default=None, primary_key=True)
    provider_id: int = Field(foreign_key="provider_profiles.id", index=True)
    day_of_week: Optional[int] = Field(default=None, ge=0, le=6)  # null = full-date override
    start_time: Optional[time] = Field(default=None)
    end_time: Optional[time] = Field(default=None)

    # A blocked_date overrides/adds a one-off blocked day
    is_blocked: bool = Field(default=False)
    blocked_date: Optional[date] = Field(default=None)
