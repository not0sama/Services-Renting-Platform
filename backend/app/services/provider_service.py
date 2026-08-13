"""
Provider service — onboarding, online toggle, verification, stats (FR-6, FR-7, FR-46, FR-66-68).
"""
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import status, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.core.exceptions import AppException
from app.models.provider import (
    ProviderProfile, ProviderCategory, Document,
    VerificationStatus, ProviderTier, DocumentType,
)
from app.models.user import User
from app.schemas.provider import (
    OnboardingStep1, OnboardingStep2, OnboardingStep3,
    VerificationDecision,
)
from app.utils.file_upload import validate_and_save_file
from app.services import notification_service


async def get_or_create_profile(db: AsyncSession, user_id: int) -> ProviderProfile:
    result = await db.execute(
        select(ProviderProfile).where(ProviderProfile.user_id == user_id)
    )
    profile = result.scalar_one_or_none()
    if not profile:
        from app.models.user import User as UserModel
        user = await db.get(UserModel, user_id)
        avatar = getattr(user, "avatar_url", None) if user else None
        profile = ProviderProfile(user_id=user_id, avatar_url=avatar)
        db.add(profile)
        await db.commit()
        await db.refresh(profile)
    return profile


async def get_profile_by_id(db: AsyncSession, profile_id: int) -> ProviderProfile:
    p = await db.get(ProviderProfile, profile_id)
    if not p:
        raise AppException(status.HTTP_404_NOT_FOUND, "PROVIDER_NOT_FOUND", "Provider not found.")
    return p


async def get_profile_by_user_id(db: AsyncSession, user_id: int) -> ProviderProfile:
    return await get_or_create_profile(db, user_id)


# ── Onboarding Steps (FR-6) ───────────────────────────────────────────────────

async def onboarding_step1(db: AsyncSession, user_id: int, data: OnboardingStep1) -> ProviderProfile:
    profile = await get_or_create_profile(db, user_id)
    profile.bio = data.bio
    profile.years_experience = data.years_experience
    profile.city = data.city
    profile.country = data.country
    profile.updated_at = datetime.now(timezone.utc)
    db.add(profile)
    await db.commit()
    await db.refresh(profile)
    return profile


async def onboarding_step2(db: AsyncSession, user_id: int, data: OnboardingStep2) -> ProviderProfile:
    profile = await get_or_create_profile(db, user_id)

    # Remove existing categories
    old = await db.execute(
        select(ProviderCategory).where(ProviderCategory.provider_id == profile.id)
    )
    for pc in old.scalars().all():
        await db.delete(pc)

    # Add new
    for cat_id in data.category_ids:
        db.add(ProviderCategory(provider_id=profile.id, category_id=cat_id))

    await db.commit()
    await db.refresh(profile)
    return profile


async def onboarding_step3(db: AsyncSession, user_id: int, data: OnboardingStep3) -> ProviderProfile:
    profile = await get_or_create_profile(db, user_id)
    profile.latitude = data.latitude
    profile.longitude = data.longitude
    profile.service_radius_km = data.service_radius_km
    profile.updated_at = datetime.now(timezone.utc)
    db.add(profile)
    await db.commit()
    await db.refresh(profile)
    return profile


async def upload_document(
    db: AsyncSession,
    user_id: int,
    doc_type: DocumentType,
    file: UploadFile,
) -> Document:
    profile = await get_or_create_profile(db, user_id)
    file_path = validate_and_save_file(file, is_document=doc_type == DocumentType.certificate)
    doc = Document(
        provider_id=profile.id,
        type=doc_type,
        file_path=file_path,
        original_filename=file.filename or "document",
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)
    return doc


async def set_online_status(db: AsyncSession, user_id: int, is_online: bool) -> ProviderProfile:
    profile = await get_profile_by_user_id(db, user_id)
    if is_online and profile.verification_status != VerificationStatus.approved:
        raise AppException(
            status.HTTP_403_FORBIDDEN,
            "NOT_VERIFIED",
            "Your account must be verified before going online.",
        )
    profile.is_online = is_online
    profile.updated_at = datetime.now(timezone.utc)
    db.add(profile)
    await db.commit()
    await db.refresh(profile)
    return profile


# ── Admin verification (FR-7) ─────────────────────────────────────────────────

async def admin_verify(
    db: AsyncSession,
    profile_id: int,
    decision: VerificationDecision,
) -> ProviderProfile:
    profile = await get_profile_by_id(db, profile_id)
    profile.verification_status = decision.status
    profile.verification_notes = decision.notes
    if decision.status == VerificationStatus.approved:
        profile.verified_at = datetime.now(timezone.utc)
    profile.updated_at = datetime.now(timezone.utc)
    db.add(profile)

    # Notify the provider's user
    await notification_service.verification_decision(
        db, profile.user_id,
        approved=(decision.status == VerificationStatus.approved),
        notes=decision.notes,
    )

    await db.commit()
    await db.refresh(profile)
    return profile


# ── Public provider listing ───────────────────────────────────────────────────

async def list_providers_in_category(
    db: AsyncSession,
    category_id: int,
    lat: Optional[float] = None,
    lon: Optional[float] = None,
    max_radius_km: float = 50,
    page: int = 1,
    limit: int = 20,
) -> List[ProviderProfile]:
    """List approved providers for a category, optionally filtered by proximity."""
    from app.utils.haversine import haversine

    stmt = (
        select(ProviderProfile)
        .join(ProviderCategory, ProviderCategory.provider_id == ProviderProfile.id)
        .where(
            ProviderCategory.category_id == category_id,
            ProviderProfile.verification_status == VerificationStatus.approved,
        )
        .order_by(ProviderProfile.avg_rating.desc())
        .offset((page - 1) * limit)
        .limit(limit)
    )
    result = await db.execute(stmt)
    providers = list(result.scalars().all())

    if lat is not None and lon is not None:
        providers = [
            p for p in providers
            if p.latitude and p.longitude
            and haversine(lat, lon, p.latitude, p.longitude) <= max_radius_km
        ]

    return providers
