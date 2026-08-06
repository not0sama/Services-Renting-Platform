"""Provider router — onboarding, profile, online status, admin approval (FR-6, FR-7, FR-46)."""
from typing import List, Optional

from fastapi import APIRouter, Depends, status, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user, require_role
from app.db.session import get_session
from app.models.user import User
from app.models.provider import DocumentType, VerificationStatus
from app.schemas.provider import (
    OnboardingStep1, OnboardingStep2, OnboardingStep3,
    OnlineStatusUpdate, VerificationDecision,
    ProviderProfileOut, ProviderPublicOut, DocumentOut,
)
from app.services import provider_service
from app.services.provider_service import list_providers_in_category

router = APIRouter(tags=["Providers"])


# ── Onboarding (FR-6) ─────────────────────────────────────────────────────────

@router.post(
    "/providers/onboarding/step/1",
    response_model=ProviderProfileOut,
    summary="Onboarding step 1 — personal info",
)
async def onboarding_step1(
    data: OnboardingStep1,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_role("provider")),
):
    profile = await provider_service.onboarding_step1(db, current_user.id, data)
    return ProviderProfileOut.model_validate(profile)


@router.post(
    "/providers/onboarding/step/2",
    response_model=ProviderProfileOut,
    summary="Onboarding step 2 — select categories",
)
async def onboarding_step2(
    data: OnboardingStep2,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_role("provider")),
):
    profile = await provider_service.onboarding_step2(db, current_user.id, data)
    return ProviderProfileOut.model_validate(profile)


@router.post(
    "/providers/onboarding/step/3",
    response_model=ProviderProfileOut,
    summary="Onboarding step 3 — service area",
)
async def onboarding_step3(
    data: OnboardingStep3,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_role("provider")),
):
    profile = await provider_service.onboarding_step3(db, current_user.id, data)
    return ProviderProfileOut.model_validate(profile)


@router.post(
    "/providers/documents",
    response_model=DocumentOut,
    status_code=status.HTTP_201_CREATED,
    summary="Onboarding step 4 — upload document",
)
async def upload_document(
    doc_type: DocumentType = Form(...),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_role("provider")),
):
    doc = await provider_service.upload_document(db, current_user.id, doc_type, file)
    return DocumentOut.model_validate(doc)


# ── Online Status ─────────────────────────────────────────────────────────────

@router.patch(
    "/providers/me/online-status",
    response_model=ProviderProfileOut,
    summary="Toggle online/offline status",
)
async def set_online_status(
    data: OnlineStatusUpdate,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_role("provider")),
):
    profile = await provider_service.set_online_status(db, current_user.id, data.is_online)
    return ProviderProfileOut.model_validate(profile)


# ── My Profile ────────────────────────────────────────────────────────────────

@router.get(
    "/providers/me/profile",
    response_model=ProviderProfileOut,
    summary="Get my provider profile",
)
async def get_my_profile(
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_role("provider")),
):
    profile = await provider_service.get_profile_by_user_id(db, current_user.id)
    return ProviderProfileOut.model_validate(profile)


# ── Public Profile ────────────────────────────────────────────────────────────

@router.get(
    "/providers/{profile_id}",
    response_model=ProviderPublicOut,
    summary="Get provider public profile",
)
async def get_provider_public(
    profile_id: int,
    db: AsyncSession = Depends(get_session),
    _: User = Depends(get_current_user),
):
    profile = await provider_service.get_profile_by_id(db, profile_id)
    out = ProviderPublicOut.model_validate(profile)
    # Enrich with user name
    from app.models.user import User as UserModel
    user = await db.get(UserModel, profile.user_id)
    if user:
        out.name = user.name
    return out


# ── Category providers list ───────────────────────────────────────────────────

@router.get(
    "/categories/{category_id}/providers",
    response_model=List[ProviderPublicOut],
    summary="List providers for a category",
)
async def list_providers(
    category_id: int,
    lat: Optional[float] = None,
    lon: Optional[float] = None,
    page: int = 1,
    limit: int = 20,
    db: AsyncSession = Depends(get_session),
):
    providers = await list_providers_in_category(db, category_id, lat, lon, page=page, limit=limit)
    result = []
    for p in providers:
        out = ProviderPublicOut.model_validate(p)
        from app.models.user import User as UserModel
        user = await db.get(UserModel, p.user_id)
        if user:
            out.name = user.name
        result.append(out)
    return result


# ── Admin: approval queue (FR-7) ─────────────────────────────────────────────

@router.get(
    "/admin/providers/pending",
    response_model=List[ProviderProfileOut],
    summary="Admin: list providers pending verification",
)
async def list_pending_providers(
    db: AsyncSession = Depends(get_session),
    _: User = Depends(require_role("admin")),
):
    from sqlmodel import select
    from app.models.provider import ProviderProfile
    result = await db.execute(
        select(ProviderProfile).where(ProviderProfile.verification_status == VerificationStatus.pending)
    )
    return [ProviderProfileOut.model_validate(p) for p in result.scalars().all()]


@router.post(
    "/admin/providers/{profile_id}/verify",
    response_model=ProviderProfileOut,
    summary="Admin: approve or reject provider",
)
async def admin_verify_provider(
    profile_id: int,
    data: VerificationDecision,
    db: AsyncSession = Depends(get_session),
    _: User = Depends(require_role("admin")),
):
    profile = await provider_service.admin_verify(db, profile_id, data)
    return ProviderProfileOut.model_validate(profile)
