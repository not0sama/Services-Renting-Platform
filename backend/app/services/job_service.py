"""
Job request + offer service (FR-13–20, FR-32).
"""
from datetime import datetime, timedelta, timezone
from typing import List, Optional

from fastapi import status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, func

from app.core.exceptions import AppException
from app.models.job import JobRequest, Offer, JobStatus, OfferStatus
from app.models.provider import ProviderProfile, ProviderCategory, VerificationStatus
from app.models.service import Service
from app.models.user import User
from app.schemas.job import JobCreate, OfferCreate, OfferUpdate, OfferOut
from app.services import notification_service
from app.services.best_match_service import compute_best_match, OfferInput
from app.utils.haversine import haversine

# Offer expiry: 7 days from job posting (business-rules.md)
OFFER_EXPIRY_DAYS = 7
# Urgent surcharge default
URGENT_SURCHARGE_PCT = 25.0


# ── Job CRUD ──────────────────────────────────────────────────────────────────

async def create_job(db: AsyncSession, customer_id: int, data: JobCreate) -> JobRequest:
    job_data = data.model_dump()
    # Apply urgent surcharge
    if data.is_urgent:
        job_data["urgent_surcharge_pct"] = URGENT_SURCHARGE_PCT

    if job_data.get("scheduled_date") and getattr(job_data["scheduled_date"], "tzinfo", None):
        job_data["scheduled_date"] = job_data["scheduled_date"].replace(tzinfo=None)

    expires_at = (datetime.now(timezone.utc) + timedelta(days=OFFER_EXPIRY_DAYS)).replace(tzinfo=None)

    job = JobRequest(
        customer_id=customer_id,
        expires_at=expires_at,
        **job_data,
    )
    db.add(job)
    await db.commit()
    await db.refresh(job)
    return job


async def get_job(db: AsyncSession, job_id: int) -> JobRequest:
    job = await db.get(JobRequest, job_id)
    if not job:
        raise AppException(status.HTTP_404_NOT_FOUND, "JOB_NOT_FOUND", "Job not found.")
    return job


async def list_customer_jobs(
    db: AsyncSession,
    customer_id: int,
    job_status: Optional[JobStatus] = None,
    page: int = 1,
    limit: int = 20,
) -> List[JobRequest]:
    stmt = (
        select(JobRequest)
        .where(JobRequest.customer_id == customer_id)
        .order_by(JobRequest.created_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
    )
    if job_status:
        stmt = stmt.where(JobRequest.status == job_status)
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_provider_job_feed(
    db: AsyncSession,
    provider_profile_id: int,
    lat: Optional[float] = None,
    lon: Optional[float] = None,
    category_id: Optional[int] = None,
    is_urgent: Optional[bool] = None,
    page: int = 1,
    limit: int = 20,
) -> List[JobRequest]:
    """
    Job feed for providers — filtered by their category matches,
    service radius, and other optional filters (FR-15, FR-16).
    """
    # Get provider's categories from ProviderCategory
    cat_result = await db.execute(
        select(ProviderCategory.category_id)
        .where(ProviderCategory.provider_id == provider_profile_id)
    )
    provider_cat_ids = set(r[0] for r in cat_result.all() if r[0] is not None)

    # Also include categories from provider's active services
    svc_cat_result = await db.execute(
        select(Service.category_id)
        .where(Service.provider_id == provider_profile_id)
    )
    for r in svc_cat_result.all():
        if r[0] is not None:
            provider_cat_ids.add(r[0])

    now_naive = datetime.utcnow()

    stmt = select(JobRequest).where(
        JobRequest.status == JobStatus.open,
        (JobRequest.expires_at > now_naive) | (JobRequest.expires_at == None),
    )

    if category_id:
        stmt = stmt.where(JobRequest.category_id == category_id)
    elif provider_cat_ids:
        stmt = stmt.where(JobRequest.category_id.in_(list(provider_cat_ids)))

    if is_urgent is not None:
        stmt = stmt.where(JobRequest.is_urgent == is_urgent)

    stmt = (
        stmt.order_by(JobRequest.is_urgent.desc(), JobRequest.created_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
    )

    result = await db.execute(stmt)
    jobs = list(result.scalars().all())

    # Radius filter using Haversine (FR-16)
    if lat is not None and lon is not None:
        provider_result = await db.get(ProviderProfile, provider_profile_id)
        radius = provider_result.service_radius_km if provider_result else 20.0

        jobs = [
            j for j in jobs
            if j.latitude is None or j.longitude is None or
            haversine(lat, lon, j.latitude, j.longitude) <= radius
        ]

    return jobs


# ── Offer CRUD ────────────────────────────────────────────────────────────────

async def submit_offer(
    db: AsyncSession,
    provider_profile_id: int,
    job_id: int,
    data: OfferCreate,
) -> Offer:
    job = await get_job(db, job_id)

    if job.status != JobStatus.open:
        raise AppException(status.HTTP_409_CONFLICT, "JOB_CLOSED", "This job is no longer accepting offers.")

    # Check for existing offer from this provider
    existing = await db.execute(
        select(Offer).where(
            Offer.job_id == job_id,
            Offer.provider_id == provider_profile_id,
            Offer.status == OfferStatus.pending,
        )
    )
    if existing.scalar_one_or_none():
        raise AppException(status.HTTP_409_CONFLICT, "OFFER_EXISTS", "You already have a pending offer on this job.")

    offer_data = data.model_dump()
    if job.is_urgent:
        if offer_data.get("urgent_surcharge_pct") is None:
            offer_data["urgent_surcharge_pct"] = job.urgent_surcharge_pct
    else:
        offer_data["urgent_surcharge_pct"] = None

    offer = Offer(
        job_id=job_id,
        provider_id=provider_profile_id,
        expires_at=job.expires_at,
        **offer_data,
    )
    db.add(offer)

    # Notify customer
    customer_result = await db.get(User, job.customer_id)
    provider_profile = await db.get(ProviderProfile, provider_profile_id)
    provider_user = await db.get(User, provider_profile.user_id) if provider_profile else None
    provider_name = provider_user.name if provider_user else "A provider"

    await notification_service.offer_received(db, job.customer_id, job_id, provider_name)

    await db.commit()
    await db.refresh(offer)
    return offer


async def get_job_offers(
    db: AsyncSession,
    job_id: int,
    job_lat: Optional[float] = None,
    job_lon: Optional[float] = None,
) -> List[OfferOut]:
    """
    Return all pending offers for a job, enriched with provider info and best-match scores.
    """
    job = await get_job(db, job_id)

    result = await db.execute(
        select(Offer).where(Offer.job_id == job_id, Offer.status == OfferStatus.pending)
    )
    offers = list(result.scalars().all())

    if not offers:
        return []

    # Build best-match inputs
    offer_inputs: List[OfferInput] = []
    enriched: dict[int, dict] = {}

    for offer in offers:
        provider = await db.get(ProviderProfile, offer.provider_id)
        user = await db.get(User, provider.user_id) if provider else None

        dist = 0.0
        if job_lat and job_lon and provider and provider.latitude and provider.longitude:
            dist = haversine(job_lat, job_lon, provider.latitude, provider.longitude)

        enriched[offer.id] = {
            "provider_name": user.name if user else "Unknown",
            "provider_rating": provider.avg_rating if provider else 0.0,
            "provider_tier": provider.tier.value if provider else "bronze",
            "provider_avatar": provider.avatar_url if provider else None,
            "distance_km": round(dist, 2),
        }

        offer_inputs.append(OfferInput(
            offer_id=offer.id,
            provider_id=offer.provider_id,
            price=offer.price,
            distance_km=dist,
            avg_rating=provider.avg_rating if provider else 0.0,
            duration_minutes=offer.duration_minutes,
        ))

    # Compute and persist best-match scores
    scores = compute_best_match(offer_inputs)
    score_map = {s.offer_id: s.score for s in scores}

    offer_outs: List[OfferOut] = []
    for offer in offers:
        offer.best_match_score = score_map.get(offer.id)
        db.add(offer)
        enrich = enriched.get(offer.id, {})
        offer_outs.append(OfferOut(
            **offer.model_dump(),
            **enrich,
        ))

    await db.commit()

    # Sort by best_match_score descending
    offer_outs.sort(key=lambda o: o.best_match_score or 0, reverse=True)
    return offer_outs


async def update_offer(
    db: AsyncSession,
    provider_profile_id: int,
    offer_id: int,
    data: OfferUpdate,
) -> Offer:
    offer = await db.get(Offer, offer_id)
    if not offer:
        raise AppException(status.HTTP_404_NOT_FOUND, "OFFER_NOT_FOUND", "Offer not found.")
    if offer.provider_id != provider_profile_id:
        raise AppException(status.HTTP_403_FORBIDDEN, "FORBIDDEN", "You do not own this offer.")
    if offer.status != OfferStatus.pending:
        raise AppException(status.HTTP_409_CONFLICT, "OFFER_NOT_EDITABLE", "Only pending offers can be edited.")

    update_data = data.model_dump(exclude_none=True)
    if "urgent_surcharge_pct" in update_data:
        job = await db.get(JobRequest, offer.job_id)
        if not job or not job.is_urgent:
            update_data["urgent_surcharge_pct"] = None

    for k, v in update_data.items():
        setattr(offer, k, v)
    offer.updated_at = datetime.utcnow()
    db.add(offer)
    await db.commit()
    await db.refresh(offer)
    return offer


async def withdraw_offer(db: AsyncSession, provider_profile_id: int, offer_id: int) -> Offer:
    offer = await db.get(Offer, offer_id)
    if not offer:
        raise AppException(status.HTTP_404_NOT_FOUND, "OFFER_NOT_FOUND", "Offer not found.")
    if offer.provider_id != provider_profile_id:
        raise AppException(status.HTTP_403_FORBIDDEN, "FORBIDDEN", "You do not own this offer.")
    if offer.status != OfferStatus.pending:
        raise AppException(status.HTTP_409_CONFLICT, "OFFER_NOT_WITHDRAWABLE", "Only pending offers can be withdrawn.")

    offer.status = OfferStatus.withdrawn
    offer.updated_at = datetime.utcnow()
    db.add(offer)
    await db.commit()
    await db.refresh(offer)
    return offer


async def list_provider_offers(db: AsyncSession, provider_profile_id: int) -> List[OfferOut]:
    stmt = (
        select(Offer, JobRequest)
        .join(JobRequest, Offer.job_id == JobRequest.id)
        .where(Offer.provider_id == provider_profile_id)
        .order_by(Offer.submitted_at.desc())
    )
    result = await db.execute(stmt)
    rows = result.all()

    outs = []
    for offer, job in rows:
        out = OfferOut.model_validate(offer)
        out.job_title = job.title
        out.job_status = job.status.value if hasattr(job.status, "value") else str(job.status)
        outs.append(out)
    return outs
