"""AI router — POST /ai/assist (FR-59–62)."""
from __future__ import annotations

from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.assistant import run_ai_assist
from app.core.deps import get_current_user, get_session
from app.models.user import User

router = APIRouter(prefix="/ai", tags=["AI Assistant"])


class AIAssistRequest(BaseModel):
    text: str = Field(..., min_length=5, max_length=1000, description="Natural language problem description")


class AIAssistResponse(BaseModel):
    category_id: int | None = None
    category_slug: str | None = None
    category_name: str | None = None
    cost_min: int | None = None
    cost_max: int | None = None
    duration_minutes: int | None = None
    structured_description: str | None = None
    confidence: float | None = None
    top_providers: list[dict] = []
    category_suggestions: list[dict] = []
    ai_generated: bool = True
    fallback: str | None = None
    reason: str | None = None


@router.post("/assist", response_model=AIAssistResponse, summary="AI Smart Assistant (FR-59–62)")
async def ai_assist(
    body: AIAssistRequest,
    db: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> Any:
    """
    Given a free-text problem description, use Google Gemini to:
    1. Identify the service category
    2. Estimate cost range and duration
    3. Return the top 3 matching providers

    On Gemini API failure returns `{ fallback: "manual" }` with HTTP 503.
    """
    result = await run_ai_assist(user_text=body.text, db=db)

    if result.get("fallback") == "manual":
        # NFR-22: graceful degradation
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "fallback": "manual",
                "reason": result.get("reason", "AI service unavailable"),
            },
        )

    return result
