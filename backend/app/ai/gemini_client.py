"""Google Gemini API client wrapper with timeout, retry, and response caching."""
from __future__ import annotations

import hashlib
import json
import logging
import time
from functools import lru_cache
from typing import Any

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

# Simple in-process cache: key → (response_json, ts)
_CACHE: dict[str, tuple[dict, float]] = {}
_CACHE_TTL = 300  # 5 minutes


def _cache_key(payload: dict) -> str:
    raw = json.dumps(payload, sort_keys=True, ensure_ascii=False)
    return hashlib.sha256(raw.encode()).hexdigest()


async def call_gemini(
    user_text: str,
    system_prompt: str,
    max_retries: int = 2,
    timeout: float = 15.0,
) -> dict[str, Any]:
    """
    Call Gemini API and return parsed JSON from the model response.
    Uses in-process cache to avoid duplicate API calls.
    """
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": f"{system_prompt}\n\nUser request:\n{user_text}"}
                ]
            }
        ],
        "generationConfig": {
            "responseMimeType": "application/json",
            "temperature": 0.3,
            "maxOutputTokens": 512,
        },
    }

    cache_k = _cache_key({"u": user_text, "s": system_prompt})
    now = time.monotonic()
    if cache_k in _CACHE:
        cached_resp, cached_ts = _CACHE[cache_k]
        if now - cached_ts < _CACHE_TTL:
            logger.debug("Gemini cache hit")
            return cached_resp

    url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/"
        f"{settings.GEMINI_MODEL}:generateContent?key={settings.GEMINI_API_KEY}"
    )

    last_err: Exception | None = None
    for attempt in range(max_retries + 1):
        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                resp = await client.post(url, json=payload)
                resp.raise_for_status()
                data = resp.json()

            # Extract the text part from Gemini response
            text_part = (
                data.get("candidates", [{}])[0]
                .get("content", {})
                .get("parts", [{}])[0]
                .get("text", "{}")
            )
            parsed = json.loads(text_part)
            _CACHE[cache_k] = (parsed, time.monotonic())
            return parsed

        except (httpx.TimeoutException, httpx.HTTPStatusError, json.JSONDecodeError) as e:
            last_err = e
            logger.warning("Gemini attempt %d failed: %s", attempt + 1, e)
            if attempt < max_retries:
                await _sleep(1.5 ** attempt)

    raise RuntimeError(f"Gemini API unavailable after {max_retries + 1} attempts: {last_err}")


async def _sleep(seconds: float) -> None:
    import asyncio
    await asyncio.sleep(seconds)
