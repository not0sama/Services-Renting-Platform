"""Reputation service — trust score + tier calculation (FR-66–68)."""
from __future__ import annotations

import logging
from datetime import datetime, timezone

from sqlmodel import select

from app.core.config import settings
from app.models.provider import ProviderProfile, ProviderTier

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Tier thresholds (from settings)
# ---------------------------------------------------------------------------

def _get_thresholds() -> tuple[float, float, float]:
    """Returns (bronze_max, silver_max, gold_max). Platinum is >= gold_max."""
    raw = getattr(settings, "TIER_THRESHOLDS", "50,70,85")
    parts = [float(x) for x in str(raw).split(",")]
    if len(parts) == 3:
        return parts[0], parts[1], parts[2]
    return 50.0, 70.0, 85.0


def _assign_tier(trust_score: float) -> ProviderTier:
    bronze_max, silver_max, gold_max = _get_thresholds()
    if trust_score >= gold_max:
        return ProviderTier.platinum
    if trust_score >= silver_max:
        return ProviderTier.gold
    if trust_score >= bronze_max:
        return ProviderTier.silver
    return ProviderTier.bronze


# ---------------------------------------------------------------------------
# Trust score formula
# ---------------------------------------------------------------------------

def _get_weights() -> tuple[float, float, float, float, float]:
    """Returns (w_rating, w_on_time, w_completion, w_response, w_cancel_inv)."""
    raw = getattr(settings, "TRUST_SCORE_WEIGHTS", "0.3,0.25,0.2,0.15,0.1")
    parts = [float(x) for x in str(raw).split(",")]
    if len(parts) == 5:
        return tuple(parts)  # type: ignore[return-value]
    return 0.3, 0.25, 0.2, 0.15, 0.1


def calculate_trust_score(
    avg_rating: float,
    on_time_rate: float,
    completion_rate: float,
    avg_response_minutes: float,
    cancellation_rate: float,
) -> float:
    """
    trust = w1*norm_rating + w2*on_time_rate + w3*completion_rate
            + w4*norm_response + w5*(1-cancellation_rate)

    All inputs in [0, 1] after normalization. Output in [0, 100].
    """
    w1, w2, w3, w4, w5 = _get_weights()

    # Normalize rating 0–5 → 0–1
    norm_rating = min(max(avg_rating / 5.0, 0.0), 1.0)

    # Normalize response time: 0 min → 1.0, 60 min → 0.5, 120 min → 0.0
    norm_response = max(0.0, 1.0 - (avg_response_minutes / 120.0))

    raw = (
        w1 * norm_rating
        + w2 * on_time_rate
        + w3 * completion_rate
        + w4 * norm_response
        + w5 * (1.0 - cancellation_rate)
    )

    return round(min(max(raw * 100, 0), 100), 2)


# ---------------------------------------------------------------------------
# Incremental update
# ---------------------------------------------------------------------------

async def update_provider_reputation(provider_id: int, db) -> None:
    """
    Recalculate and persist trust_score + tier for a provider.
    Called after: booking completed, review submitted, booking cancelled.
    """
    result = await db.execute(select(ProviderProfile).where(ProviderProfile.id == provider_id))
    profile = result.scalar_one_or_none()
    if not profile:
        logger.warning("Reputation update: provider %s not found", provider_id)
        return

    # Use stored aggregate metrics from the profile
    avg_rating = profile.avg_rating or 0.0
    on_time_rate = getattr(profile, "on_time_rate", 0.5) or 0.5
    completion_rate = getattr(profile, "completion_rate", 0.5) or 0.5
    avg_response_minutes = getattr(profile, "avg_response_minutes", 30) or 30
    cancellation_rate = getattr(profile, "cancellation_rate", 0.0) or 0.0

    trust = calculate_trust_score(
        avg_rating=avg_rating,
        on_time_rate=on_time_rate,
        completion_rate=completion_rate,
        avg_response_minutes=avg_response_minutes,
        cancellation_rate=cancellation_rate,
    )

    old_tier = profile.tier
    new_tier = _assign_tier(trust)

    profile.trust_score = trust
    profile.tier = new_tier
    db.add(profile)

    if old_tier != new_tier:
        logger.info(
            "Provider %s tier changed: %s → %s (trust=%.1f)",
            provider_id, old_tier, new_tier, trust,
        )

    # Note: caller is responsible for commit
