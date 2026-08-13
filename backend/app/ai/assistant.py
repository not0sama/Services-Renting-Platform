"""AI Smart Assistant orchestration (FR-59–62)."""
from __future__ import annotations

import logging
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.ai.gemini_client import call_gemini
from app.models.category import Category
from app.models.provider import ProviderProfile

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# System prompt builder
# ---------------------------------------------------------------------------

def _build_system_prompt(category_slugs: list[str]) -> str:
    slugs_str = ", ".join(category_slugs[:80])  # cap to avoid token overflow
    return f"""You are a service matching assistant for a multi-service hiring platform in Saudi Arabia.

Available service categories (slug format):
{slugs_str}

A customer will describe their problem in natural language.
You must respond with ONLY a valid JSON object matching this exact schema:
{{
  "category_slug": "<one of the category slugs above>",
  "cost_min": <integer LYD>,
  "cost_max": <integer LYD>,
  "duration_minutes": <integer>,
  "structured_description": "<clean, professional rewrite of the problem in English>",
  "confidence": <float 0.0-1.0>
}}

Rules:
- Pick the single most specific matching category slug.
- If no category matches well, pick the closest and set confidence < 0.5.
- cost_min and cost_max should reflect realistic Saudi market prices in LYD.
- duration_minutes is the expected service duration.
- structured_description should be professional and concise (max 200 chars).
- Return ONLY the JSON object, no markdown, no explanation."""


# ---------------------------------------------------------------------------
# Top-3 provider query
# ---------------------------------------------------------------------------

async def _get_top_providers(
    db: AsyncSession,
    category_id: int,
    limit: int = 3,
) -> list[dict]:
    stmt = (
        select(ProviderProfile)
        .where(
            ProviderProfile.is_online == True,  # noqa: E712
            ProviderProfile.verification_status == "approved",
        )
        .limit(limit * 3)  # fetch extra to sort
    )
    result = await db.execute(stmt)
    profiles = result.scalars().all()

    # Sort by rating × trust_score
    scored = sorted(
        profiles,
        key=lambda p: (p.avg_rating or 0) * (p.trust_score or 50),
        reverse=True,
    )[:limit]

    return [
        {
            "provider_id": p.id,
            "user_id": p.user_id,
            "avg_rating": round(p.avg_rating or 0, 1),
            "trust_score": round(p.trust_score or 50, 1),
            "tier": p.tier.value if p.tier else "bronze",
            "city": p.city,
            "completed_jobs_count": p.completed_jobs_count,
        }
        for p in scored
    ]


# ---------------------------------------------------------------------------
# Main orchestrator
# ---------------------------------------------------------------------------

async def run_ai_assist(
    user_text: str,
    db: AsyncSession,
) -> dict[str, Any]:
    """
    FR-59–62: Full AI assistant flow.
    1. Fetch category slugs from DB for system prompt.
    2. Call Gemini to parse the request.
    3. Map category_slug → category_id.
    4. Query top 3 providers in that category.
    5. Return combined response.
    """
    # 1. Fetch active category slugs
    cat_result = await db.execute(select(Category).where(Category.is_active == True))  # noqa: E712
    categories = cat_result.scalars().all()
    slug_to_id = {c.slug: c.id for c in categories}
    slug_to_name = {c.slug: c.name_en for c in categories}

    if not slug_to_id:
        return {"fallback": "manual", "reason": "No categories configured"}

    system_prompt = _build_system_prompt(list(slug_to_id.keys()))

    # 2. Call Gemini
    try:
        ai_data = await call_gemini(user_text=user_text, system_prompt=system_prompt)
    except RuntimeError as exc:
        logger.error("Gemini unavailable: %s", exc)
        return {"fallback": "manual", "reason": "AI service temporarily unavailable"}

    # 3. Map slug → id
    slug = ai_data.get("category_slug", "")
    category_id = slug_to_id.get(slug)
    category_name = slug_to_name.get(slug, slug)

    suggestions: list[dict] = []
    if not category_id:
        # Return top-level categories as suggestions
        root_cats = [c for c in categories if c.parent_id is None][:6]
        suggestions = [{"slug": c.slug, "name": c.name_en} for c in root_cats]

    # 4. Top 3 providers (if category matched)
    top_providers: list[dict] = []
    if category_id:
        top_providers = await _get_top_providers(db, category_id)

    return {
        "category_id": category_id,
        "category_slug": slug,
        "category_name": category_name,
        "cost_min": ai_data.get("cost_min"),
        "cost_max": ai_data.get("cost_max"),
        "duration_minutes": ai_data.get("duration_minutes"),
        "structured_description": ai_data.get("structured_description", user_text),
        "confidence": ai_data.get("confidence", 0.5),
        "top_providers": top_providers,
        "category_suggestions": suggestions,
        "ai_generated": True,
    }
