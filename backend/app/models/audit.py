from typing import Optional, Any
from datetime import datetime, timezone
from sqlmodel import SQLModel, Field, Column
from sqlalchemy import JSON


class AuditLog(SQLModel, table=True):
    """
    Immutable audit trail for sensitive actions (NFR-13).
    e.g. payment release, admin suspend, document approval.
    """
    __tablename__ = "audit_logs"

    id: Optional[int] = Field(default=None, primary_key=True)
    actor_id: Optional[int] = Field(default=None, foreign_key="users.id", index=True)
    action: str = Field(max_length=100, index=True)   # e.g. "payment.release", "user.suspend"
    entity_type: str = Field(max_length=50)           # e.g. "payment", "user", "booking"
    entity_id: Optional[int] = Field(default=None)
    extra_data: Optional[Any] = Field(default=None, sa_column=Column(JSON))
    ip_address: Optional[str] = Field(default=None, max_length=50)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Favorite(SQLModel, table=True):
    """Customer's saved/favorite provider list (FR-57 — Phase 2)."""
    __tablename__ = "favorites"

    id: Optional[int] = Field(default=None, primary_key=True)
    customer_id: int = Field(foreign_key="users.id", index=True)
    provider_id: int = Field(foreign_key="provider_profiles.id", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
