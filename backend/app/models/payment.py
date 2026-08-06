from enum import Enum
from typing import Optional
from datetime import datetime, timezone
from sqlmodel import SQLModel, Field
import uuid


class PaymentStatus(str, Enum):
    held = "held"                   # paid, funds in escrow
    released = "released"           # customer accepted work
    auto_released = "auto_released" # 72h timeout fired (Phase 2)
    refunded = "refunded"           # cancellation or dispute resolution
    failed = "failed"


class Payment(SQLModel, table=True):
    """
    Simulated escrow payment record (FR-35–39).
    One Payment per Booking. Commission deducted on release.
    """
    __tablename__ = "payments"

    id: Optional[int] = Field(default=None, primary_key=True)
    booking_id: int = Field(foreign_key="bookings.id", unique=True, index=True)
    customer_id: int = Field(foreign_key="users.id", index=True)
    provider_id: int = Field(foreign_key="provider_profiles.id", index=True)

    # Amounts (FR-36, FR-37)
    gross_amount: float = Field(ge=0)        # what customer paid
    commission_pct: float = Field(ge=0, le=100)  # % taken at category level
    commission_amount: float = Field(ge=0)   # computed: gross * commission_pct / 100
    net_amount: float = Field(ge=0)          # provider receives: gross - commission

    status: PaymentStatus = Field(default=PaymentStatus.held, index=True)

    # Escrow timing (Phase 2 — FR-64)
    auto_release_at: Optional[datetime] = Field(default=None, index=True)
    released_at: Optional[datetime] = Field(default=None)

    # Invoice
    invoice_number: str = Field(default_factory=lambda: f"INV-{uuid.uuid4().hex[:8].upper()}", unique=True)

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
