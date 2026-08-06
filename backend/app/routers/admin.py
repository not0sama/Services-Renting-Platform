"""Admin router — user management, booking management, provider approval, analytics (FR-50, FR-51, FR-54)."""
from typing import List, Optional

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, func

from app.core.deps import require_role
from app.db.session import get_session
from app.models.user import User
from app.models.booking import Booking, BookingStatus
from app.models.provider import ProviderProfile, VerificationStatus
from app.schemas.misc import UserAdminOut, UserSuspend
from app.schemas.booking import BookingOut

router = APIRouter(prefix="/admin", tags=["Admin"])


# ── User management (FR-50) ───────────────────────────────────────────────────

@router.get("/users", response_model=List[UserAdminOut])
async def list_users(
    search: Optional[str] = Query(None),
    role: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_session),
    _: User = Depends(require_role("admin")),
):
    stmt = select(User).offset((page - 1) * limit).limit(limit)
    if search:
        stmt = stmt.where(User.name.ilike(f"%{search}%") | User.email.ilike(f"%{search}%"))
    if role:
        stmt = stmt.where(User.role == role)
    if is_active is not None:
        stmt = stmt.where(User.is_active == is_active)
    result = await db.execute(stmt)
    return [UserAdminOut.model_validate(u) for u in result.scalars().all()]


@router.patch("/users/{user_id}/suspend", response_model=UserAdminOut)
async def suspend_user(
    user_id: int,
    data: UserSuspend,
    db: AsyncSession = Depends(get_session),
    current_admin: User = Depends(require_role("admin")),
):
    user = await db.get(User, user_id)
    if not user:
        from app.core.exceptions import AppException
        raise AppException(status.HTTP_404_NOT_FOUND, "NOT_FOUND", "User not found.")
    user.is_active = False
    db.add(user)

    from app.models.audit import AuditLog
    db.add(AuditLog(
        actor_id=current_admin.id,
        action="user.suspend",
        entity_type="user",
        entity_id=user_id,
        extra_data={"reason": data.reason},
    ))
    await db.commit()
    await db.refresh(user)
    return UserAdminOut.model_validate(user)


@router.patch("/users/{user_id}/reactivate", response_model=UserAdminOut)
async def reactivate_user(
    user_id: int,
    db: AsyncSession = Depends(get_session),
    current_admin: User = Depends(require_role("admin")),
):
    user = await db.get(User, user_id)
    if not user:
        from app.core.exceptions import AppException
        raise AppException(status.HTTP_404_NOT_FOUND, "NOT_FOUND", "User not found.")
    user.is_active = True
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return UserAdminOut.model_validate(user)


# ── Booking management (FR-51) ────────────────────────────────────────────────

@router.get("/bookings", response_model=List[BookingOut])
async def list_all_bookings(
    booking_status: Optional[BookingStatus] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_session),
    _: User = Depends(require_role("admin")),
):
    stmt = (
        select(Booking)
        .order_by(Booking.created_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
    )
    if booking_status:
        stmt = stmt.where(Booking.status == booking_status)
    result = await db.execute(stmt)
    return [BookingOut.model_validate(b) for b in result.scalars().all()]


@router.post("/bookings/{booking_id}/cancel", response_model=BookingOut)
async def admin_cancel_booking(
    booking_id: int,
    db: AsyncSession = Depends(get_session),
    current_admin: User = Depends(require_role("admin")),
):
    from app.services.booking_service import get_booking, VALID_TRANSITIONS
    from app.models.booking import BookingStatus
    from datetime import datetime, timezone

    booking = await get_booking(db, booking_id)
    booking.status = BookingStatus.cancelled
    booking.cancelled_by_role = "admin"
    booking.updated_at = datetime.now(timezone.utc)
    db.add(booking)

    from app.models.audit import AuditLog
    db.add(AuditLog(
        actor_id=current_admin.id,
        action="booking.cancel",
        entity_type="booking",
        entity_id=booking_id,
    ))
    await db.commit()
    await db.refresh(booking)
    return BookingOut.model_validate(booking)


# ── Analytics KPIs (FR-54) ───────────────────────────────────────────────────

@router.get("/analytics/kpis")
async def get_kpis(
    db: AsyncSession = Depends(get_session),
    _: User = Depends(require_role("admin")),
):
    total_users = (await db.execute(select(func.count(User.id)))).scalar()
    total_providers = (await db.execute(
        select(func.count(User.id)).where(User.role == "provider")
    )).scalar()
    total_bookings = (await db.execute(select(func.count(Booking.id)))).scalar()
    active_bookings = (await db.execute(
        select(func.count(Booking.id)).where(
            Booking.status.in_([BookingStatus.confirmed, BookingStatus.en_route, BookingStatus.in_progress])
        )
    )).scalar()

    from app.models.payment import Payment, PaymentStatus
    revenue_result = await db.execute(
        select(func.sum(Payment.commission_amount)).where(
            Payment.status.in_([PaymentStatus.released, PaymentStatus.auto_released])
        )
    )
    revenue = revenue_result.scalar() or 0

    return {
        "total_users": total_users,
        "total_providers": total_providers,
        "total_bookings": total_bookings,
        "active_bookings": active_bookings,
        "platform_revenue": round(float(revenue), 2),
    }
