"""Favorites router — FR-57."""
from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.core.deps import get_current_user, get_session
from app.models.audit import Favorite
from app.models.provider import ProviderProfile
from app.models.user import User

router = APIRouter(prefix="/me/favorites", tags=["Favorites"])


@router.get("", summary="List favorite providers (FR-57)")
async def list_favorites(
    db: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> list[dict]:
    result = await db.execute(
        select(Favorite).where(Favorite.customer_id == current_user.id)
    )
    favs = result.scalars().all()
    out = []
    for f in favs:
        p_res = await db.execute(select(ProviderProfile).where(ProviderProfile.id == f.provider_id))
        profile = p_res.scalar_one_or_none()
        out.append({
            "provider_id": f.provider_id,
            "avg_rating": profile.avg_rating if profile else None,
            "trust_score": profile.trust_score if profile else None,
            "tier": profile.tier.value if profile and profile.tier else None,
            "city": profile.city if profile else None,
            "created_at": f.created_at.isoformat(),
        })
    return out


@router.post("/{provider_id}", summary="Add to favorites")
async def add_favorite(
    provider_id: int,
    db: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict:
    # Validate provider exists
    p_res = await db.execute(select(ProviderProfile).where(ProviderProfile.id == provider_id))
    if not p_res.scalar_one_or_none():
        raise HTTPException(404, "Provider not found")

    # Check not already favorited
    f_res = await db.execute(
        select(Favorite).where(Favorite.customer_id == current_user.id, Favorite.provider_id == provider_id)
    )
    if f_res.scalar_one_or_none():
        raise HTTPException(409, "Already in favorites")

    fav = Favorite(customer_id=current_user.id, provider_id=provider_id)
    db.add(fav)
    await db.commit()
    return {"provider_id": provider_id, "favorited": True}


@router.delete("/{provider_id}", summary="Remove from favorites")
async def remove_favorite(
    provider_id: int,
    db: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict:
    f_res = await db.execute(
        select(Favorite).where(Favorite.customer_id == current_user.id, Favorite.provider_id == provider_id)
    )
    fav = f_res.scalar_one_or_none()
    if not fav:
        raise HTTPException(404, "Not in favorites")
    await db.delete(fav)
    await db.commit()
    return {"provider_id": provider_id, "favorited": False}
