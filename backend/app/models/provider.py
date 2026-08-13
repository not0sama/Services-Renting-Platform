from enum import Enum
from typing import Optional, Any
from datetime import datetime, timezone
from sqlmodel import SQLModel, Field, Column
from sqlalchemy import JSON, UniqueConstraint


class VerificationStatus(str, Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


class ProviderTier(str, Enum):
    bronze = "bronze"
    silver = "silver"
    gold = "gold"
    platinum = "platinum"


class DocumentType(str, Enum):
    national_id = "national_id"
    commercial_license = "commercial_license"
    certificate = "certificate"
    other = "other"


class ProviderProfile(SQLModel, table=True):
    __tablename__ = "provider_profiles"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", unique=True, index=True)

    # Bio & experience
    bio: Optional[str] = Field(default=None, max_length=2000)
    years_experience: int = Field(default=0, ge=0)

    # Location & service area
    service_radius_km: float = Field(default=20.0, ge=1.0)
    latitude: Optional[float] = Field(default=None)
    longitude: Optional[float] = Field(default=None)
    city: Optional[str] = Field(default=None, max_length=100)
    country: Optional[str] = Field(default=None, max_length=100)

    # Status
    is_online: bool = Field(default=False)

    # Verification
    verification_status: VerificationStatus = Field(default=VerificationStatus.pending)
    verification_notes: Optional[str] = Field(default=None, max_length=1000)
    verified_at: Optional[datetime] = Field(default=None)

    # Reputation metrics (updated incrementally — NFR-23)
    avg_rating: float = Field(default=0.0, ge=0.0, le=5.0)
    completed_jobs_count: int = Field(default=0, ge=0)
    trust_score: float = Field(default=0.0, ge=0.0, le=100.0)
    tier: ProviderTier = Field(default=ProviderTier.bronze)

    # Trust sub-metrics (used in formula)
    on_time_rate: float = Field(default=0.0, ge=0.0, le=1.0)       # % of jobs started on schedule
    completion_rate: float = Field(default=0.0, ge=0.0, le=1.0)    # % of accepted jobs completed
    avg_response_minutes: float = Field(default=0.0, ge=0.0)        # avg minutes to respond
    cancellation_rate: float = Field(default=0.0, ge=0.0, le=1.0)  # % of accepted jobs cancelled
    total_jobs_accepted: int = Field(default=0, ge=0)
    total_jobs_cancelled: int = Field(default=0, ge=0)
    total_jobs_on_time: int = Field(default=0, ge=0)

    # Profile image
    avatar_url: Optional[str] = Field(default=None)
    profile_images: Optional[Any] = Field(default=None, sa_column=Column(JSON))  # list of URLs

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class ProviderCategory(SQLModel, table=True):
    """Provider ↔ Category join table — which categories a provider works in."""
    __tablename__ = "provider_categories"
    __table_args__ = (UniqueConstraint("provider_id", "category_id"),)

    id: Optional[int] = Field(default=None, primary_key=True)
    provider_id: int = Field(foreign_key="provider_profiles.id", index=True)
    category_id: int = Field(foreign_key="categories.id", index=True)


class Document(SQLModel, table=True):
    """Provider identity / certification documents (NFR-12)."""
    __tablename__ = "documents"

    id: Optional[int] = Field(default=None, primary_key=True)
    provider_id: int = Field(foreign_key="provider_profiles.id", index=True)
    type: DocumentType = Field(default=DocumentType.national_id)
    file_path: str = Field(max_length=500)         # relative path under UPLOAD_DIR
    original_filename: str = Field(max_length=255)
    verification_status: VerificationStatus = Field(default=VerificationStatus.pending)
    verification_notes: Optional[str] = Field(default=None, max_length=500)
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)
    reviewed_at: Optional[datetime] = Field(default=None)
