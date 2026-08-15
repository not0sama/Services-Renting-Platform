"""Live location router — FR-42."""
from __future__ import annotations

from typing import Annotated
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.core.deps import get_current_user, get_session
from app.models.booking import Booking, BookingStatus
from app.models.message import ProviderLocation
from app.models.user import User

router = APIRouter(prefix="/location", tags=["Live Location"])


class LocationUpdate(BaseModel):
    latitude: float
    longitude: float


@router.post("/bookings/{booking_id}", summary="Provider publishes live location (FR-42)")
async def update_location(
    booking_id: int,
    body: LocationUpdate,
    db: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict:
    b_res = await db.execute(select(Booking).where(Booking.id == booking_id))
    booking = b_res.scalar_one_or_none()
    if not booking:
        raise HTTPException(404, "Booking not found")
    if booking.provider_user_id != current_user.id:
        raise HTTPException(403, "Only the assigned provider can update location")
    if booking.status != BookingStatus.en_route:
        raise HTTPException(400, "Location only accepted when booking is en_route")

    # Upsert location record
    loc_res = await db.execute(
        select(ProviderLocation).where(ProviderLocation.booking_id == booking_id)
    )
    loc = loc_res.scalar_one_or_none()
    if loc:
        loc.latitude = body.latitude
        loc.longitude = body.longitude
        loc.updated_at = datetime.utcnow()
    else:
        loc = ProviderLocation(
            booking_id=booking_id,
            provider_id=current_user.id,
            latitude=body.latitude,
            longitude=body.longitude,
        )
    db.add(loc)
    await db.commit()
    return {"latitude": loc.latitude, "longitude": loc.longitude, "updated_at": loc.updated_at.isoformat()}


@router.get("/bookings/{booking_id}", summary="Customer reads provider location (FR-42)")
async def get_location(
    booking_id: int,
    db: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict:
    b_res = await db.execute(select(Booking).where(Booking.id == booking_id))
    booking = b_res.scalar_one_or_none()
    if not booking:
        raise HTTPException(404, "Booking not found")
    if current_user.id not in (booking.customer_id, booking.provider_user_id):
        raise HTTPException(403, "Not a participant")

    loc_res = await db.execute(
        select(ProviderLocation).where(ProviderLocation.booking_id == booking_id)
    )
    loc = loc_res.scalar_one_or_none()
    if not loc:
        raise HTTPException(404, "No location available yet")
    return {"latitude": loc.latitude, "longitude": loc.longitude, "updated_at": loc.updated_at.isoformat()}
