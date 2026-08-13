"""Bookings router (FR-28–31, FR-63)."""
from typing import List, Optional

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user, require_role
from app.db.session import get_session
from app.models.booking import BookingStatus
from app.models.user import User
from app.schemas.booking import (
    InstantBookCreate, DirectBookingCreate, BookingStatusUpdate, CancelBooking,
    RescheduleBooking, BookingOut,
)
from app.services import booking_service, payment_service
from app.schemas.payment import PaymentOut

router = APIRouter(prefix="/bookings", tags=["Bookings"])


@router.post("", response_model=BookingOut, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=BookingOut, status_code=status.HTTP_201_CREATED, include_in_schema=False)
async def create_direct_booking(
    data: DirectBookingCreate,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_role("customer")),
):
    """Customer books a provider directly from AI Assist or Profile."""
    booking = await booking_service.create_direct_booking(db, current_user.id, data)
    return BookingOut.model_validate(booking)


@router.post("/instant", response_model=BookingOut, status_code=status.HTTP_201_CREATED)
async def instant_book(
    data: InstantBookCreate,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_role("customer")),
):
    """Customer books a service slot directly (FR-23, FR-24)."""
    booking = await booking_service.instant_book(db, current_user.id, data)
    return BookingOut.model_validate(booking)


@router.get("", response_model=List[BookingOut])
async def list_bookings(
    booking_status: Optional[BookingStatus] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """List bookings for the current user filtered by role (FR-28)."""
    bookings = await booking_service.list_bookings(
        db, current_user.id, current_user.role.value, booking_status, page, limit
    )
    return [BookingOut.model_validate(b) for b in bookings]


@router.get("/{booking_id}", response_model=BookingOut)
async def get_booking(
    booking_id: int,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    booking = await booking_service.get_booking(db, booking_id)
    return BookingOut.model_validate(booking)


@router.patch("/{booking_id}/status", response_model=BookingOut)
async def update_status(
    booking_id: int,
    data: BookingStatusUpdate,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Provider (or admin) transitions booking status (FR-29)."""
    booking = await booking_service.update_status(
        db, booking_id, current_user.id, current_user.role.value, data.status
    )
    return BookingOut.model_validate(booking)


@router.post("/{booking_id}/cancel", response_model=BookingOut)
async def cancel_booking(
    booking_id: int,
    data: CancelBooking,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Cancel a booking with optional reason + fee logic (FR-30)."""
    booking = await booking_service.cancel_booking(
        db, booking_id, current_user.id, current_user.role.value, data
    )
    return BookingOut.model_validate(booking)


@router.post("/{booking_id}/reschedule", response_model=BookingOut)
async def reschedule_booking(
    booking_id: int,
    data: RescheduleBooking,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_role("customer")),
):
    """Customer requests reschedule — resets booking to pending (FR-31)."""
    booking = await booking_service.reschedule_booking(db, booking_id, current_user.id, data)
    return BookingOut.model_validate(booking)


# -- Payment / Escrow endpoints --------------------------------------------------------

@router.post("/{booking_id}/accept-work", response_model=PaymentOut)
async def accept_work(
    booking_id: int,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_role("customer")),
):
    """Customer accepts completed work and releases escrow payment (FR-63)."""
    payment = await payment_service.release_payment(db, booking_id, current_user.id)
    return PaymentOut.model_validate(payment)


@router.post("/{booking_id}/request-revision", response_model=BookingOut)
async def request_revision(
    booking_id: int,
    body: dict,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_role("customer")),
):
    """Customer requests revision after provider marks complete (FR-65). Pauses auto-release."""
    notes = body.get("notes", "")[:1000]
    if not notes.strip():
        from fastapi import HTTPException
        raise HTTPException(status_code=422, detail="Revision notes are required.")
    booking = await booking_service.request_revision(db, booking_id, current_user.id, notes)
    return BookingOut.model_validate(booking)


@router.post("/{booking_id}/resubmit-complete", response_model=BookingOut)
async def resubmit_complete(
    booking_id: int,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_role("provider")),
):
    """Provider marks work as complete again after a revision (FR-65). Resets auto-release timer."""
    booking = await booking_service.resubmit_complete(db, booking_id, current_user.id)
    return BookingOut.model_validate(booking)
