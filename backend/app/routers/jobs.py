"""Jobs + offers router (FR-13–20, FR-32)."""
from typing import List, Optional

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user, require_role
from app.db.session import get_session
from app.models.user import User
from app.models.job import JobStatus
from app.schemas.job import JobCreate, JobOut, OfferCreate, OfferUpdate, OfferOut
from app.services import job_service
from app.services.provider_service import get_profile_by_user_id

router = APIRouter(tags=["Jobs & Offers"])


# ── Jobs ──────────────────────────────────────────────────────────────────────

@router.post("/jobs", response_model=JobOut, status_code=status.HTTP_201_CREATED, tags=["Jobs & Offers"])
async def post_job(
    data: JobCreate,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_role("customer")),
):
    """Customer posts a custom quote job request (FR-13, FR-14)."""
    job = await job_service.create_job(db, current_user.id, data)
    return JobOut.model_validate(job)


@router.get("/jobs", response_model=List[JobOut], tags=["Jobs & Offers"])
async def list_my_jobs(
    job_status: Optional[JobStatus] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_role("customer")),
):
    """Customer's own job list."""
    jobs = await job_service.list_customer_jobs(db, current_user.id, job_status, page, limit)
    return [JobOut.model_validate(j) for j in jobs]


@router.get("/jobs/feed", response_model=List[JobOut], tags=["Jobs & Offers"])
async def provider_job_feed(
    lat: Optional[float] = Query(None),
    lon: Optional[float] = Query(None),
    category_id: Optional[int] = Query(None),
    is_urgent: Optional[bool] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_role("provider")),
):
    """Provider's job feed — filtered by category match and service radius (FR-15, FR-16)."""
    profile = await get_profile_by_user_id(db, current_user.id)
    jobs = await job_service.get_provider_job_feed(
        db, profile.id, lat, lon, category_id, is_urgent, page, limit
    )
    return [JobOut.model_validate(j) for j in jobs]


@router.get("/jobs/{job_id}", response_model=JobOut, tags=["Jobs & Offers"])
async def get_job(
    job_id: int,
    db: AsyncSession = Depends(get_session),
    _: User = Depends(get_current_user),
):
    job = await job_service.get_job(db, job_id)
    return JobOut.model_validate(job)


# ── Offers ────────────────────────────────────────────────────────────────────

@router.post("/jobs/{job_id}/offers", response_model=OfferOut, status_code=status.HTTP_201_CREATED)
async def submit_offer(
    job_id: int,
    data: OfferCreate,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_role("provider")),
):
    """Provider submits an offer on a job (FR-17)."""
    profile = await get_profile_by_user_id(db, current_user.id)
    offer = await job_service.submit_offer(db, profile.id, job_id, data)
    return OfferOut.model_validate(offer)


@router.get("/offers/my", response_model=List[OfferOut], tags=["Jobs & Offers"])
async def list_my_offers(
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_role("provider")),
):
    """List all offers submitted by the current provider."""
    profile = await get_profile_by_user_id(db, current_user.id)
    return await job_service.list_provider_offers(db, profile.id)


@router.get("/jobs/{job_id}/offers", response_model=List[OfferOut])
async def get_job_offers(
    job_id: int,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_role("customer")),
):
    """
    Customer views all offers for their job — enriched with provider info + best-match scores (FR-19, FR-20).
    """
    job = await job_service.get_job(db, job_id)
    if job.customer_id != current_user.id:
        from app.core.exceptions import AppException
        raise AppException(403, "FORBIDDEN", "Not your job.")

    return await job_service.get_job_offers(db, job_id, job.latitude, job.longitude)


@router.post("/jobs/{job_id}/offers/{offer_id}/accept", tags=["Jobs & Offers"])
async def accept_offer(
    job_id: int,
    offer_id: int,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_role("customer")),
):
    """Customer accepts an offer → creates booking (FR-19)."""
    from app.services.booking_service import accept_offer_create_booking
    from app.schemas.booking import BookingOut
    booking = await accept_offer_create_booking(db, current_user.id, job_id, offer_id)
    return BookingOut.model_validate(booking)


@router.patch("/offers/{offer_id}", response_model=OfferOut)
async def update_offer(
    offer_id: int,
    data: OfferUpdate,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_role("provider")),
):
    """Provider edits a pending offer (FR-18)."""
    profile = await get_profile_by_user_id(db, current_user.id)
    offer = await job_service.update_offer(db, profile.id, offer_id, data)
    return OfferOut.model_validate(offer)


@router.delete("/offers/{offer_id}", status_code=status.HTTP_204_NO_CONTENT)
async def withdraw_offer(
    offer_id: int,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_role("provider")),
):
    """Provider withdraws a pending offer (FR-18)."""
    profile = await get_profile_by_user_id(db, current_user.id)
    await job_service.withdraw_offer(db, profile.id, offer_id)
