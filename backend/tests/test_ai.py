import pytest
from httpx import AsyncClient
from unittest.mock import patch

@pytest.mark.asyncio
@patch("app.ai.assistant.call_gemini")
async def test_ai_assist_success(mock_call_gemini, customer_client: AsyncClient, admin_client: AsyncClient):
    # Create a category to match
    cat_res = await admin_client.post("/api/v1/categories", json={
        "name_en": "Plumbing",
        "name_ar": "سباكة",
        "slug": "plumbing",
        "icon_url": "wrench",
        "booking_mode": "quote",
        "is_active": True
    })
    assert cat_res.status_code == 201

    # Mock the Gemini response
    mock_call_gemini.return_value = {
        "category_slug": "plumbing",
        "cost_min": 150,
        "cost_max": 300,
        "duration_minutes": 60,
        "structured_description": "My sink is leaking",
        "confidence": 0.95
    }

    # Customer sends AI prompt
    res = await customer_client.post("/api/v1/ai/assist", json={"text": "I have a leaking sink in my kitchen"})
    assert res.status_code == 200
    data = res.json()
    assert data["category_slug"] == "plumbing"
    assert data["cost_min"] == 150
    assert data["cost_max"] == 300
    assert data["duration_minutes"] == 60
    assert data["ai_generated"] is True
    assert data["category_name"] == "Plumbing"
    assert data["fallback"] is None

@pytest.mark.asyncio
@patch("app.ai.assistant.call_gemini")
async def test_ai_assist_fallback(mock_call_gemini, customer_client: AsyncClient):
    # Simulate API failure
    mock_call_gemini.side_effect = RuntimeError("Gemini API is down")

    # Customer sends AI prompt
    res = await customer_client.post("/api/v1/ai/assist", json={"text": "My AC is broken"})
    assert res.status_code == 503
    assert res.json()["detail"]["fallback"] == "manual"
