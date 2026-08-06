from enum import Enum
from typing import Optional, Any
from datetime import datetime, timezone
from sqlmodel import SQLModel, Field, Column
from sqlalchemy import JSON


class JobStatus(str, Enum):
    open = "open"
    in_review = "in_review"   # offers received, customer reviewing
    accepted = "accepted"     # an offer was accepted → booking created
    cancelled = "cancelled"
    expired = "expired"


class OfferStatus(str, Enum):
    pending = "pending"
    accepted = "accepted"
    declined = "declined"
    withdrawn = "withdrawn"


class JobRequest(SQLModel, table=True):
    """
    Customer's custom quote request (bidding flow — FR-13, FR-14, FR-15).
    Dynamic fields are stored as JSON matching the category's dynamic_fields_schema.
    """
    __tablename__ = "job_requests"

    id: Optional[int] = Field(default=None, primary_key=True)
    customer_id: int = Field(foreign_key="users.id", index=True)
    category_id: int = Field(foreign_key="categories.id", index=True)

    title: str = Field(min_length=5, max_length=200)
    description: str = Field(min_length=10, max_length=3000)

    # Dynamic fields data matching category schema (NFR-3)
    dynamic_fields_data: Optional[Any] = Field(default=None, sa_column=Column(JSON))

    # Location
    location_address: Optional[str] = Field(default=None, max_length=500)
    latitude: Optional[float] = Field(default=None)
    longitude: Optional[float] = Field(default=None)

    # Budget
    budget_min: Optional[float] = Field(default=None, ge=0)
    budget_max: Optional[float] = Field(default=None, ge=0)

    # Urgency (FR-14, FR-32)
    is_urgent: bool = Field(default=False)
    urgent_surcharge_pct: float = Field(default=25.0)  # +25% default

    # Scheduling
    scheduled_date: Optional[datetime] = Field(default=None)

    # AI metadata (set when posted from AI flow — FR-59–62)
    ai_generated: bool = Field(default=False)
    ai_estimated_cost_min: Optional[float] = Field(default=None)
    ai_estimated_cost_max: Optional[float] = Field(default=None)
    ai_estimated_duration_minutes: Optional[int] = Field(default=None)

    status: JobStatus = Field(default=JobStatus.open, index=True)
    expires_at: Optional[datetime] = Field(default=None, index=True)

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class Offer(SQLModel, table=True):
    """
    Provider's price offer on a JobRequest (FR-17, FR-18, FR-19, FR-20).
    best_match_score is computed by the best-match service (FR-20).
    """
    __tablename__ = "offers"

    id: Optional[int] = Field(default=None, primary_key=True)
    job_id: int = Field(foreign_key="job_requests.id", index=True)
    provider_id: int = Field(foreign_key="provider_profiles.id", index=True)

    price: float = Field(ge=0)
    duration_minutes: int = Field(ge=15)
    message: Optional[str] = Field(default=None, max_length=1000)
    
    # Urgent negotiation (FR-32-33)
    urgent_surcharge_pct: Optional[float] = Field(default=None, ge=0)

    status: OfferStatus = Field(default=OfferStatus.pending, index=True)

    # Set by best-match service after all offers collected
    best_match_score: Optional[float] = Field(default=None)

    submitted_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: Optional[datetime] = Field(default=None)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
