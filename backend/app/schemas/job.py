from typing import Optional, Any, List
from datetime import datetime
from pydantic import BaseModel
from app.models.job import JobStatus, OfferStatus


# ── Job Request ──────────────────────────────────────────────────────────────

class JobCreate(BaseModel):
    category_id: int
    title: str
    description: str
    dynamic_fields_data: Optional[Any] = None
    location_address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    budget_min: Optional[float] = None
    budget_max: Optional[float] = None
    is_urgent: bool = False
    scheduled_date: Optional[datetime] = None
    # AI flow metadata — set by AI service before calling this
    ai_generated: bool = False
    ai_estimated_cost_min: Optional[float] = None
    ai_estimated_cost_max: Optional[float] = None
    ai_estimated_duration_minutes: Optional[int] = None


class JobOut(BaseModel):
    id: int
    customer_id: int
    category_id: int
    title: str
    description: str
    dynamic_fields_data: Optional[Any]
    location_address: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    budget_min: Optional[float]
    budget_max: Optional[float]
    is_urgent: bool
    urgent_surcharge_pct: float
    scheduled_date: Optional[datetime]
    ai_generated: bool
    ai_estimated_cost_min: Optional[float]
    ai_estimated_cost_max: Optional[float]
    ai_estimated_duration_minutes: Optional[int]
    status: JobStatus
    expires_at: Optional[datetime]
    created_at: datetime
    offer_count: int = 0

    model_config = {"from_attributes": True}


# ── Offer ────────────────────────────────────────────────────────────────────

class OfferCreate(BaseModel):
    price: float
    duration_minutes: int
    message: Optional[str] = None
    urgent_surcharge_pct: Optional[float] = None


class OfferUpdate(BaseModel):
    price: Optional[float] = None
    duration_minutes: Optional[int] = None
    message: Optional[str] = None
    urgent_surcharge_pct: Optional[float] = None


class OfferOut(BaseModel):
    id: int
    job_id: int
    provider_id: int
    price: float
    duration_minutes: int
    message: Optional[str]
    urgent_surcharge_pct: Optional[float]
    status: OfferStatus
    best_match_score: Optional[float]
    submitted_at: datetime
    expires_at: Optional[datetime]
    # Enriched for comparison table & provider offers view
    job_title: Optional[str] = None
    job_status: Optional[str] = None
    provider_name: Optional[str] = None
    provider_rating: Optional[float] = None
    provider_tier: Optional[str] = None
    provider_avatar: Optional[str] = None
    distance_km: Optional[float] = None  # from job location to provider

    model_config = {"from_attributes": True}
