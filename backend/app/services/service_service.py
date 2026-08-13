"""
Service package + availability + slot generation (FR-21, FR-22, FR-23, FR-24).
"""
from datetime import datetime, timedelta, date, time, timezone
from typing import List, Optional

from fastapi import status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.core.exceptions import AppException
from app.models.provider import ProviderCategory
from app.models.service import Service, Availability
from app.models.booking import Booking, BookingStatus
from app.schemas.service import ServiceCreate, ServiceUpdate, TimeSlot
from app.services.provider_service import get_profile_by_user_id


# ── Service CRUD ─────────────────────────────────────────────────────────────

async def create_service(db: AsyncSession, user_id: int, data: ServiceCreate) -> Service:
    profile = await get_profile_by_user_id(db, user_id)
    svc = Service(provider_id=profile.id, **data.model_dump())
    db.add(svc)

    # Auto-link category to ProviderCategory table if not present
    res = await db.execute(
        select(ProviderCategory).where(
            ProviderCategory.provider_id == profile.id,
            ProviderCategory.category_id == data.category_id
        )
    )
    if not res.scalars().first():
        db.add(ProviderCategory(provider_id=profile.id, category_id=data.category_id))

    await db.commit()
    await db.refresh(svc)
    return svc


async def get_service(db: AsyncSession, service_id: int) -> Service:
    svc = await db.get(Service, service_id)
    if not svc:
        raise AppException(status.HTTP_404_NOT_FOUND, "SERVICE_NOT_FOUND", "Service not found.")
    return svc


async def list_provider_services(db: AsyncSession, provider_id: int, active_only: bool = True) -> List[Service]:
    stmt = select(Service).where(Service.provider_id == provider_id)
    if active_only:
        stmt = stmt.where(Service.is_active == True)
    stmt = stmt.order_by(Service.id)
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def update_service(db: AsyncSession, user_id: int, service_id: int, data: ServiceUpdate) -> Service:
    profile = await get_profile_by_user_id(db, user_id)
    svc = await get_service(db, service_id)
    if svc.provider_id != profile.id:
        raise AppException(status.HTTP_403_FORBIDDEN, "FORBIDDEN", "You do not own this service.")
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(svc, k, v)
    svc.updated_at = datetime.utcnow()
    db.add(svc)
    await db.commit()
    await db.refresh(svc)
    return svc


async def delete_service(db: AsyncSession, user_id: int, service_id: int) -> None:
    profile = await get_profile_by_user_id(db, user_id)
    svc = await get_service(db, service_id)
    if svc.provider_id != profile.id:
        raise AppException(status.HTTP_403_FORBIDDEN, "FORBIDDEN", "You do not own this service.")
    svc.is_active = False
    svc.updated_at = datetime.utcnow()
    db.add(svc)
    await db.commit()


# ── Availability CRUD ────────────────────────────────────────────────────────

async def set_availability(
    db: AsyncSession,
    user_id: int,
    day_of_week: int,
    start_time: time,
    end_time: time,
) -> Availability:
    profile = await get_profile_by_user_id(db, user_id)
    # Upsert: delete existing for this day then re-create
    existing = await db.execute(
        select(Availability).where(
            Availability.provider_id == profile.id,
            Availability.day_of_week == day_of_week,
            Availability.blocked_date == None,
        )
    )
    for row in existing.scalars().all():
        await db.delete(row)

    avail = Availability(
        provider_id=profile.id,
        day_of_week=day_of_week,
        start_time=start_time,
        end_time=end_time,
        is_blocked=False,
    )
    db.add(avail)
    await db.commit()
    await db.refresh(avail)
    return avail


async def block_date(db: AsyncSession, user_id: int, blocked_date: date) -> Availability:
    profile = await get_profile_by_user_id(db, user_id)
    avail = Availability(
        provider_id=profile.id,
        is_blocked=True,
        blocked_date=blocked_date,
    )
    db.add(avail)
    await db.commit()
    await db.refresh(avail)
    return avail


async def get_availability(db: AsyncSession, provider_id: int) -> List[Availability]:
    result = await db.execute(
        select(Availability).where(Availability.provider_id == provider_id)
    )
    return list(result.scalars().all())


# ── Slot generation (FR-23) ──────────────────────────────────────────────────

async def get_available_slots(
    db: AsyncSession,
    service_id: int,
    target_date: date,
) -> List[TimeSlot]:
    """
    Generate bookable time slots for a service on a given date.
    Slots = provider's availability window divided into service.duration_minutes blocks,
    minus any confirmed/en_route/in_progress bookings in that window.
    """
    svc = await get_service(db, service_id)
    dow = target_date.weekday()  # 0=Monday

    # Check for full-day block
    blocked = await db.execute(
        select(Availability).where(
            Availability.provider_id == svc.provider_id,
            Availability.is_blocked == True,
            Availability.blocked_date == target_date,
        )
    )
    if blocked.scalar_one_or_none():
        return []

    # Get working hours for this day
    avail_result = await db.execute(
        select(Availability).where(
            Availability.provider_id == svc.provider_id,
            Availability.day_of_week == dow,
            Availability.is_blocked == False,
        )
    )
    avail = avail_result.scalar_one_or_none()
    if not avail or not avail.start_time or not avail.end_time:
        return []  # Provider doesn't work on this day

    # Build window as datetimes
    day_start = datetime.combine(target_date, avail.start_time)
    day_end = datetime.combine(target_date, avail.end_time)
    duration = timedelta(minutes=svc.duration_minutes)

    # Get existing bookings in this window (double-booking guard — FR-24)
    busy_result = await db.execute(
        select(Booking).where(
            Booking.provider_id == svc.provider_id,
            Booking.status.in_([
                BookingStatus.confirmed,
                BookingStatus.en_route,
                BookingStatus.in_progress,
            ]),
            Booking.scheduled_datetime >= day_start,
            Booking.scheduled_datetime < day_end,
        )
    )
    busy_bookings = list(busy_result.scalars().all())

    def is_busy(slot_start: datetime) -> bool:
        slot_end = slot_start + duration
        for b in busy_bookings:
            if b.scheduled_datetime is None:
                continue
            b_start = b.scheduled_datetime
            b_end = b_start + timedelta(minutes=b.duration_minutes)
            if not (slot_end <= b_start or slot_start >= b_end):
                return True
        return False

    slots: List[TimeSlot] = []
    current = day_start
    while current + duration <= day_end:
        slots.append(TimeSlot(
            start=current.isoformat(),
            end=(current + duration).isoformat(),
            available=not is_busy(current),
        ))
        current += duration

    return slots
