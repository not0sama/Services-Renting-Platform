"""Disputes router — FR-49, FR-52."""
from __future__ import annotations

from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.core.deps import get_current_user, get_session, require_role
from app.models.booking import Booking, BookingStatus
from app.models.dispute import Dispute, DisputeStatus
from app.models.payment import Payment, PaymentStatus
from app.models.user import User, UserRole
from app.services.notification_service import emit
from app.models.notification import NotificationType

router = APIRouter(prefix="/disputes", tags=["Disputes"])


class OpenDisputeRequest(BaseModel):
    reason: str = Field(..., min_length=10, max_length=2000)
    evidence_urls: list[str] = Field(default_factory=list, max_length=5)


class AdminResolveRequest(BaseModel):
    resolution: str = Field(..., description="resolved_refund | resolved_release | resolved_warning")
    admin_notes: str = Field(..., min_length=5, max_length=2000)


# ─── Customer: open a dispute ───────────────────────────────────────────────

@router.post("/bookings/{booking_id}/open", summary="Open a dispute (FR-49)")
async def open_dispute(
    booking_id: int,
    body: OpenDisputeRequest,
    db: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict:
    b_res = await db.execute(select(Booking).where(Booking.id == booking_id))
    booking = b_res.scalar_one_or_none()
    if not booking:
        raise HTTPException(404, "Booking not found")
    if booking.customer_id != current_user.id:
        raise HTTPException(403, "Only the customer can open a dispute")
    if booking.status not in (BookingStatus.completed, BookingStatus.revision_requested):
        raise HTTPException(400, "Dispute can only be opened on completed or revision-requested bookings")

    # Check no existing open dispute
    d_res = await db.execute(
        select(Dispute).where(Dispute.booking_id == booking_id, Dispute.status == DisputeStatus.open)
    )
    if d_res.scalar_one_or_none():
        raise HTTPException(409, "A dispute is already open for this booking")

    dispute = Dispute(
        booking_id=booking_id,
        opened_by_user_id=current_user.id,
        reason=body.reason,
        evidence_urls=",".join(body.evidence_urls) if body.evidence_urls else None,
    )
    db.add(dispute)

    # Freeze payment (keep status = held but block auto-release)
    p_res = await db.execute(select(Payment).where(Payment.booking_id == booking_id))
    payment = p_res.scalar_one_or_none()
    if payment:
        payment.auto_release_at = None  # cancel timer
        db.add(payment)

    await db.commit()
    await db.refresh(dispute)

    # Notify admin (use system notification)
    await emit(db, current_user.id, NotificationType.system,
               "Dispute Opened",
               f"Your dispute for booking #{booking_id} has been submitted. Admin will review within 48h.")
    await db.commit()

    return {"dispute_id": dispute.id, "status": dispute.status}


# ─── Admin: list open disputes ──────────────────────────────────────────────

@router.get("", summary="List all disputes (admin)")
async def list_disputes(
    db: Annotated[AsyncSession, Depends(get_session)],
    _admin: Annotated[User, Depends(require_role("admin"))],
    dispute_status: str | None = None,
) -> list[dict]:
    stmt = select(Dispute)
    if dispute_status:
        stmt = stmt.where(Dispute.status == dispute_status)
    stmt = stmt.order_by(Dispute.opened_at.desc()).limit(100)
    result = await db.execute(stmt)
    disputes = result.scalars().all()
    return [
        {
            "id": d.id,
            "booking_id": d.booking_id,
            "opened_by_user_id": d.opened_by_user_id,
            "reason": d.reason,
            "status": d.status,
            "admin_notes": d.admin_notes,
            "opened_at": d.opened_at.isoformat(),
            "resolved_at": d.resolved_at.isoformat() if d.resolved_at else None,
        }
        for d in disputes
    ]


# ─── Admin: resolve dispute ──────────────────────────────────────────────────

@router.patch("/{dispute_id}/resolve", summary="Resolve a dispute (admin)")
async def resolve_dispute(
    dispute_id: int,
    body: AdminResolveRequest,
    db: Annotated[AsyncSession, Depends(get_session)],
    admin: Annotated[User, Depends(require_role("admin"))],
) -> dict:
    from datetime import datetime, timezone

    d_res = await db.execute(select(Dispute).where(Dispute.id == dispute_id))
    dispute = d_res.scalar_one_or_none()
    if not dispute:
        raise HTTPException(404, "Dispute not found")

    valid_resolutions = {
        "resolved_refund": DisputeStatus.resolved_refund,
        "resolved_release": DisputeStatus.resolved_release,
        "resolved_warning": DisputeStatus.resolved_warning,
    }
    if body.resolution not in valid_resolutions:
        raise HTTPException(400, f"Invalid resolution. Must be one of: {list(valid_resolutions)}")

    dispute.status = valid_resolutions[body.resolution]
    dispute.admin_notes = body.admin_notes
    dispute.resolved_by_admin_id = admin.id
    dispute.resolved_at = datetime.now(timezone.utc)
    db.add(dispute)

    # Act on payment based on resolution
    p_res = await db.execute(select(Payment).where(Payment.booking_id == dispute.booking_id))
    payment = p_res.scalar_one_or_none()
    if payment:
        if body.resolution == "resolved_refund":
            payment.status = PaymentStatus.refunded
        elif body.resolution == "resolved_release":
            payment.status = PaymentStatus.released
            payment.released_at = datetime.now(timezone.utc)
        db.add(payment)

    await db.commit()
    return {"dispute_id": dispute.id, "resolution": body.resolution}
