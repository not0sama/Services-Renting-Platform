from enum import Enum
from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field


class TargetRole(str, Enum):
    all = "all"
    customer = "customer"
    provider = "provider"


class Announcement(SQLModel, table=True):
    """
    Platform Announcement System (FR-55).
    Allows Admins to compose and broadcast announcements to Customers, Providers, or All users.
    """
    __tablename__ = "announcements"

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(max_length=200)
    message: str = Field(max_length=2000)
    target_role: TargetRole = Field(default=TargetRole.all)
    is_active: bool = Field(default=True)
    created_by_id: Optional[int] = Field(default=None, foreign_key="users.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
