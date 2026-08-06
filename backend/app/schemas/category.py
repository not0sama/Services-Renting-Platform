from typing import Optional, Any, List
from pydantic import BaseModel, field_validator
from app.models.category import BookingMode


# ── Request schemas ──────────────────────────────────────────────────────────

class CategoryCreate(BaseModel):
    name_en: str
    name_ar: str
    slug: str
    parent_id: Optional[int] = None
    icon_url: Optional[str] = None
    booking_mode: BookingMode = BookingMode.both
    commission_rate: float = 15.0
    # Optional tiered brackets: [{"min": 0, "max": 500, "rate": 20}, ...]
    commission_tiers: Optional[Any] = None
    urgent_enabled: bool = True
    dynamic_fields_schema: Optional[Any] = None
    is_active: bool = True
    sort_order: int = 0

    @field_validator("slug")
    @classmethod
    def slug_lowercase(cls, v: str) -> str:
        return v.lower().strip().replace(" ", "-")


class CategoryUpdate(BaseModel):
    name_en: Optional[str] = None
    name_ar: Optional[str] = None
    icon_url: Optional[str] = None
    booking_mode: Optional[BookingMode] = None
    commission_rate: Optional[float] = None
    commission_tiers: Optional[Any] = None  # set to [] to clear tiers
    urgent_enabled: Optional[bool] = None
    dynamic_fields_schema: Optional[Any] = None
    is_active: Optional[bool] = None
    sort_order: Optional[int] = None


# ── Response schemas ─────────────────────────────────────────────────────────

class CategoryOut(BaseModel):
    id: int
    name_en: str
    name_ar: str
    slug: str
    parent_id: Optional[int]
    icon_url: Optional[str]
    booking_mode: BookingMode
    commission_rate: float
    commission_tiers: Optional[Any]
    urgent_enabled: bool
    dynamic_fields_schema: Optional[Any]
    is_active: bool
    sort_order: int
    children: Optional[List["CategoryOut"]] = None

    model_config = {"from_attributes": True}


CategoryOut.model_rebuild()
