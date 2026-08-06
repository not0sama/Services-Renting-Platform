"""Services + availability router (FR-21, FR-22, FR-23, FR-24)."""
from datetime import date
from typing import List

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user, require_role
from app.db.session import get_session
from app.models.user import User
from app.schemas.service import (
    ServiceCreate, ServiceUpdate, ServiceOut, AvailabilitySlotCreate, AvailabilityOut, TimeSlot
)
from app.services import service_service
from app.services.provider_service import get_profile_by_user_id

router = APIRouter(prefix="/services", tags=["Services"])


# ── Provider Service CRUD (FR-21) ─────────────────────────────────────────────

@router.post("", response_model=ServiceOut, status_code=status.HTTP_201_CREATED)
async def create_service(
    data: ServiceCreate,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_role("provider")),
):
    svc = await service_service.create_service(db, current_user.id, data)
    return ServiceOut.model_validate(svc)


@router.get("/my", response_model=List[ServiceOut])
async def list_my_services(
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_role("provider")),
):
    profile = await get_profile_by_user_id(db, current_user.id)
    services = await service_service.list_provider_services(db, profile.id)
    return [ServiceOut.model_validate(s) for s in services]


@router.get("/provider/{provider_id}", response_model=List[ServiceOut])
async def list_provider_services(
    provider_id: int,
    db: AsyncSession = Depends(get_session),
    _: User = Depends(get_current_user),
):
    services = await service_service.list_provider_services(db, provider_id)
    return [ServiceOut.model_validate(s) for s in services]


@router.patch("/{service_id}", response_model=ServiceOut)
async def update_service(
    service_id: int,
    data: ServiceUpdate,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_role("provider")),
):
    svc = await service_service.update_service(db, current_user.id, service_id, data)
    return ServiceOut.model_validate(svc)


@router.delete("/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_service(
    service_id: int,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_role("provider")),
):
    await service_service.delete_service(db, current_user.id, service_id)


# ── Availability (FR-22) ──────────────────────────────────────────────────────

@router.post("/availability", response_model=AvailabilityOut, status_code=status.HTTP_201_CREATED)
async def set_availability(
    data: AvailabilitySlotCreate,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_role("provider")),
):
    if data.is_blocked and data.blocked_date:
        avail = await service_service.block_date(db, current_user.id, data.blocked_date)
    else:
        avail = await service_service.set_availability(
            db, current_user.id,
            data.day_of_week,
            data.start_time,
            data.end_time,
        )
    return AvailabilityOut.model_validate(avail)


@router.get("/availability/my", response_model=List[AvailabilityOut])
async def get_my_availability(
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_role("provider")),
):
    profile = await get_profile_by_user_id(db, current_user.id)
    avails = await service_service.get_availability(db, profile.id)
    return [AvailabilityOut.model_validate(a) for a in avails]


# ── Slot generation (FR-23, FR-24) ───────────────────────────────────────────

@router.get("/{service_id}/slots", response_model=List[TimeSlot])
async def get_slots(
    service_id: int,
    date: date = Query(..., description="Target date (YYYY-MM-DD)"),
    db: AsyncSession = Depends(get_session),
    _: User = Depends(get_current_user),
):
    """Get available time slots for a service on a given date."""
    return await service_service.get_available_slots(db, service_id, date)
