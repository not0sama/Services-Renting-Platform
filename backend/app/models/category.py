from enum import Enum
from typing import Optional, Any
from datetime import datetime, timezone
from sqlmodel import SQLModel, Field, Column
from sqlalchemy import JSON


class BookingMode(str, Enum):
    instant = "instant"
    quote = "quote"
    both = "both"


class CategoryBase(SQLModel):
    name_en: str = Field(min_length=2, max_length=100)
    name_ar: str = Field(min_length=2, max_length=100)
    slug: str = Field(unique=True, index=True, max_length=80)
    parent_id: Optional[int] = Field(default=None, foreign_key="categories.id", index=True)
    icon_url: Optional[str] = Field(default=None, max_length=500)
    booking_mode: BookingMode = Field(default=BookingMode.both)
    commission_rate: float = Field(default=15.0, ge=0.0, le=100.0)  # percentage fallback
    # Tiered commission overrides flat rate when set.
    # Format: [{"min": 0, "max": 500, "rate": 20}, {"min": 501, "max": 2000, "rate": 15}, ...]
    commission_tiers: Optional[Any] = Field(default=None, sa_column=Column(JSON))
    urgent_enabled: bool = Field(default=True)
    # JSON Schema: {"fields": [{"name": "str", "type": "text|number|select|photo", "label": "str", "required": bool, "options": [...]}]}
    dynamic_fields_schema: Optional[Any] = Field(default=None, sa_column=Column(JSON))
    is_active: bool = Field(default=True)
    sort_order: int = Field(default=0)


class Category(CategoryBase, table=True):
    __tablename__ = "categories"

    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
