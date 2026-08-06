"""Reviews + notifications + users/addresses router (FR-41, FR-43, FR-44, FR-45, FR-5)."""
from typing import List, Optional

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, update

from app.core.deps import get_current_user, require_role
from app.db.session import get_session
from app.models.notification import Notification
from app.models.user import User, Address
from app.schemas.misc import (
    ReviewCreate, ReviewResponseCreate, ReviewOut,
    NotificationOut, UserProfileUpdate, AddressCreate, AddressOut,
)
from app.services import review_service

# ── Reviews ───────────────────────────────────────────────────────────────────
reviews_router = APIRouter(prefix="/reviews", tags=["Reviews"])


@reviews_router.post("", response_model=ReviewOut, status_code=status.HTTP_201_CREATED)
async def create_review(
    data: ReviewCreate,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_role("customer")),
):
    review = await review_service.create_review(db, current_user.id, data)
    return ReviewOut.model_validate(review)


@reviews_router.post("/{review_id}/response", response_model=ReviewOut)
async def respond_to_review(
    review_id: int,
    data: ReviewResponseCreate,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_role("provider")),
):
    review = await review_service.add_provider_response(db, review_id, current_user.id, data.response)
    return ReviewOut.model_validate(review)


@reviews_router.get("/provider/{provider_id}", response_model=List[ReviewOut])
async def get_provider_reviews(
    provider_id: int,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_session),
):
    reviews = await review_service.list_provider_reviews(db, provider_id, page, limit)
    return [ReviewOut.model_validate(r) for r in reviews]


# ── Notifications ─────────────────────────────────────────────────────────────
notifications_router = APIRouter(prefix="/notifications", tags=["Notifications"])


@notifications_router.get("", response_model=List[NotificationOut])
async def list_notifications(
    unread_only: bool = Query(False),
    page: int = Query(1, ge=1),
    limit: int = Query(30, ge=1, le=100),
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    stmt = (
        select(Notification)
        .where(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
    )
    if unread_only:
        stmt = stmt.where(Notification.read_at == None)
    result = await db.execute(stmt)
    return [NotificationOut.model_validate(n) for n in result.scalars().all()]


@notifications_router.patch("/{notification_id}/read")
async def mark_read(
    notification_id: int,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    from datetime import datetime, timezone
    notif = await db.get(Notification, notification_id)
    if notif and notif.user_id == current_user.id:
        notif.read_at = datetime.now(timezone.utc)
        db.add(notif)
        await db.commit()
    return {"ok": True}


@notifications_router.patch("/read-all")
async def mark_all_read(
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    from datetime import datetime, timezone
    result = await db.execute(
        select(Notification).where(
            Notification.user_id == current_user.id,
            Notification.read_at == None,
        )
    )
    for n in result.scalars().all():
        n.read_at = datetime.now(timezone.utc)
        db.add(n)
    await db.commit()
    return {"ok": True}


# ── User profile + addresses (FR-5) ───────────────────────────────────────────
users_router = APIRouter(prefix="/users", tags=["Users"])


@users_router.get("/me/profile")
async def get_profile(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "phone": current_user.phone,
        "role": current_user.role,
        "language_pref": current_user.language_pref,
    }


@users_router.patch("/me/profile")
async def update_profile(
    data: UserProfileUpdate,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    from datetime import datetime, timezone
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(current_user, k, v)
    current_user.updated_at = datetime.now(timezone.utc)
    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)
    return {"ok": True}


@users_router.get("/me/addresses", response_model=List[AddressOut])
async def list_addresses(
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Address).where(Address.user_id == current_user.id)
    )
    return [AddressOut.model_validate(a) for a in result.scalars().all()]


@users_router.post("/me/addresses", response_model=AddressOut, status_code=status.HTTP_201_CREATED)
async def add_address(
    data: AddressCreate,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    from datetime import datetime, timezone
    if data.is_default:
        # Clear other defaults
        result = await db.execute(
            select(Address).where(Address.user_id == current_user.id, Address.is_default == True)
        )
        for a in result.scalars().all():
            a.is_default = False
            db.add(a)

    address = Address(user_id=current_user.id, **data.model_dump())
    db.add(address)
    await db.commit()
    await db.refresh(address)
    return AddressOut.model_validate(address)


@users_router.delete("/me/addresses/{address_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_address(
    address_id: int,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    address = await db.get(Address, address_id)
    if address and address.user_id == current_user.id:
        await db.delete(address)
        await db.commit()
