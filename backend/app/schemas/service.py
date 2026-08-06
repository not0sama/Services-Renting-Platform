from typing import Optional, List
from datetime import date, time
from pydantic import BaseModel


# ── Service ──────────────────────────────────────────────────────────────────

class ServiceCreate(BaseModel):
    category_id: int
    title: str
    description: Optional[str] = None
    price: float
    duration_minutes: int


class ServiceUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    duration_minutes: Optional[int] = None
    is_active: Optional[bool] = None


class ServiceOut(BaseModel):
    id: int
    provider_id: int
    category_id: int
    title: str
    description: Optional[str]
    price: float
    duration_minutes: int
    is_active: bool

    model_config = {"from_attributes": True}


# ── Availability ─────────────────────────────────────────────────────────────

class AvailabilitySlotCreate(BaseModel):
    day_of_week: Optional[int] = None       # 0–6
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    is_blocked: bool = False
    blocked_date: Optional[date] = None


class AvailabilityOut(BaseModel):
    id: int
    provider_id: int
    day_of_week: Optional[int]
    start_time: Optional[time]
    end_time: Optional[time]
    is_blocked: bool
    blocked_date: Optional[date]

    model_config = {"from_attributes": True}


class TimeSlot(BaseModel):
    """A generated bookable time slot returned to the customer."""
    start: str      # ISO datetime string
    end: str
    available: bool
