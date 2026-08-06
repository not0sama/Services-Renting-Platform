"""Payments router (FR-35–39)."""
from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user, require_role
from app.db.session import get_session
from app.models.user import User
from app.schemas.payment import CheckoutCreate, PaymentOut, InvoiceOut, EarningOut
from app.services import payment_service

router = APIRouter(prefix="/payments", tags=["Payments"])


@router.post("/checkout", response_model=PaymentOut)
async def checkout(
    data: CheckoutCreate,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_role("customer")),
):
    """Customer pays for a booking — funds held in simulated escrow (FR-35, FR-36)."""
    payment = await payment_service.checkout(db, current_user.id, data)
    return PaymentOut.model_validate(payment)


@router.get("/{booking_id}/invoice", response_model=InvoiceOut)
async def get_invoice(
    booking_id: int,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Get invoice for a booking (FR-38)."""
    return await payment_service.get_invoice(db, booking_id, current_user.id)


@router.get("/me/earnings", response_model=List[EarningOut])
async def get_earnings(
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_role("provider")),
):
    """Provider's earnings history (FR-39)."""
    return await payment_service.get_provider_earnings(db, current_user.id)
