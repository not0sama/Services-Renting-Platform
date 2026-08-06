from typing import Optional
from datetime import datetime
from pydantic import BaseModel
from app.models.booking import BookingStatus, BookingType


class InstantBookCreate(BaseModel):
    """Customer books a provider's service package at a specific time slot (FR-23)."""
    service_id: int
    scheduled_datetime: datetime
    location_address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class BookingStatusUpdate(BaseModel):
    """Provider changes booking status (FR-29)."""
    status: BookingStatus
    note: Optional[str] = None


class CancelBooking(BaseModel):
    reason: Optional[str] = None


class RescheduleBooking(BaseModel):
    new_datetime: datetime
    reason: Optional[str] = None


class RevisionRequest(BaseModel):
    notes: str


class BookingOut(BaseModel):
    id: int
    customer_id: int
    provider_id: int
    category_id: int
    service_id: Optional[int]
    job_offer_id: Optional[int]
    title: str
    description: Optional[str]
    scheduled_datetime: Optional[datetime]
    duration_minutes: int
    price: float
    status: BookingStatus
    booking_type: BookingType
    cancellation_reason: Optional[str]
    revision_notes: Optional[str]
    revision_count: int
    created_at: datetime
    updated_at: datetime
    # Enriched
    customer_name: Optional[str] = None
    provider_name: Optional[str] = None
    category_name: Optional[str] = None
    payment_status: Optional[str] = None
    invoice_number: Optional[str] = None

    model_config = {"from_attributes": True}
