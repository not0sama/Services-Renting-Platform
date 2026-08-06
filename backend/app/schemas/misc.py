from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, field_validator


class ReviewCreate(BaseModel):
    booking_id: int
    # Optional overall rating — overridden by criteria average if all three provided
    rating: Optional[int] = None
    # Multi-criteria (FR-44) — all optional but recommended
    quality_rating: Optional[int] = None
    punctuality_rating: Optional[int] = None
    communication_rating: Optional[int] = None
    comment: Optional[str] = None

    @field_validator("rating", "quality_rating", "punctuality_rating", "communication_rating", mode="before")
    @classmethod
    def validate_stars(cls, v) -> Optional[int]:
        if v is None:
            return v
        v = int(v)
        if not 1 <= v <= 5:
            raise ValueError("Rating must be between 1 and 5")
        return v

    def resolved_rating(self) -> int:
        """Return overall rating: average of criteria if all three given, else fall back to self.rating."""
        criteria = [self.quality_rating, self.punctuality_rating, self.communication_rating]
        provided = [r for r in criteria if r is not None]
        if len(provided) == 3:
            return round(sum(provided) / 3)
        if self.rating is not None:
            return self.rating
        if provided:
            return round(sum(provided) / len(provided))
        raise ValueError("At least one rating (overall or any criteria) must be provided.")


class ReviewResponseCreate(BaseModel):
    response: str


class ReviewOut(BaseModel):
    id: int
    booking_id: int
    reviewer_id: int
    provider_id: int
    rating: int
    quality_rating: Optional[int]
    punctuality_rating: Optional[int]
    communication_rating: Optional[int]
    comment: Optional[str]
    provider_response: Optional[str]
    responded_at: Optional[datetime]
    is_flagged: bool
    created_at: datetime
    reviewer_name: Optional[str] = None  # enriched

    model_config = {"from_attributes": True}


class NotificationOut(BaseModel):
    id: int
    user_id: int
    type: str
    title: str
    body: str
    data: Optional[dict]
    read_at: Optional[datetime]
    created_at: datetime

    model_config = {"from_attributes": True}


class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    language_pref: Optional[str] = None


class AddressCreate(BaseModel):
    label: str
    full_address: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_default: bool = False


class AddressOut(BaseModel):
    id: int
    user_id: int
    label: str
    full_address: str
    latitude: Optional[float]
    longitude: Optional[float]
    is_default: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Admin schemas ─────────────────────────────────────────────────────────────

class UserAdminOut(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str]
    role: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class UserSuspend(BaseModel):
    reason: Optional[str] = None


class AnnouncementCreate(BaseModel):
    title: str
    body: str
    target_role: Optional[str] = None  # "customer", "provider", or None = all
