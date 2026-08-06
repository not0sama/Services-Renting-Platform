from enum import Enum
from typing import Optional
from datetime import datetime, timezone
from sqlmodel import SQLModel, Field


class UserRole(str, Enum):
    customer = "customer"
    provider = "provider"
    admin = "admin"


class LanguagePref(str, Enum):
    en = "en"
    ar = "ar"


class UserBase(SQLModel):
    name: str = Field(min_length=2, max_length=100)
    email: str = Field(unique=True, index=True)
    phone: Optional[str] = Field(default=None, max_length=20)
    role: UserRole = Field(default=UserRole.customer)
    language_pref: LanguagePref = Field(default=LanguagePref.en)
    is_active: bool = Field(default=True)
    accepted_terms: bool = Field(default=False)


class User(UserBase, table=True):
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    password_hash: str
    password_reset_code: Optional[str] = Field(default=None)
    password_reset_expires: Optional[datetime] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class Address(SQLModel, table=True):
    __tablename__ = "addresses"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    label: str = Field(max_length=50)  # e.g. "Home", "Office"
    full_address: str = Field(max_length=500)
    latitude: Optional[float] = Field(default=None)
    longitude: Optional[float] = Field(default=None)
    is_default: bool = Field(default=False)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
