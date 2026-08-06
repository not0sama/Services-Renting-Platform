from typing import Optional, Any, List
from pydantic import BaseModel, field_validator
from app.models.provider import VerificationStatus, ProviderTier, DocumentType


# ── Onboarding steps ─────────────────────────────────────────────────────────

class OnboardingStep1(BaseModel):
    """Personal info"""
    bio: str
    years_experience: int
    city: str
    country: str


class OnboardingStep2(BaseModel):
    """Category selection"""
    category_ids: List[int]


class OnboardingStep3(BaseModel):
    """Service area"""
    latitude: float
    longitude: float
    service_radius_km: float = 20.0


class OnboardingStep4(BaseModel):
    """Online status / go-live"""
    pass  # document uploads happen via multipart — no JSON body


class OnboardingStep5(BaseModel):
    """Pricing preview — no required fields, just trigger completion"""
    pass


# ── Profile update ───────────────────────────────────────────────────────────

class ProviderProfileUpdate(BaseModel):
    bio: Optional[str] = None
    years_experience: Optional[int] = None
    service_radius_km: Optional[float] = None
    city: Optional[str] = None
    country: Optional[str] = None


class OnlineStatusUpdate(BaseModel):
    is_online: bool


# ── Admin actions ────────────────────────────────────────────────────────────

class VerificationDecision(BaseModel):
    status: VerificationStatus
    notes: Optional[str] = None


# ── Response schemas ─────────────────────────────────────────────────────────

class DocumentOut(BaseModel):
    id: int
    type: DocumentType
    file_path: str
    verification_status: VerificationStatus
    uploaded_at: str

    model_config = {"from_attributes": True}


class ProviderProfileOut(BaseModel):
    id: int
    user_id: int
    bio: Optional[str]
    years_experience: int
    service_radius_km: float
    latitude: Optional[float]
    longitude: Optional[float]
    city: Optional[str]
    country: Optional[str]
    is_online: bool
    verification_status: VerificationStatus
    avg_rating: float
    completed_jobs_count: int
    trust_score: float
    tier: ProviderTier
    avatar_url: Optional[str]

    model_config = {"from_attributes": True}


class ProviderPublicOut(BaseModel):
    """Shown to customers browsing."""
    id: int
    user_id: int
    bio: Optional[str]
    years_experience: int
    service_radius_km: float
    city: Optional[str]
    country: Optional[str]
    is_online: bool
    avg_rating: float
    completed_jobs_count: int
    trust_score: float
    tier: ProviderTier
    avatar_url: Optional[str]
    # Provider name fetched via join
    name: Optional[str] = None

    model_config = {"from_attributes": True}
