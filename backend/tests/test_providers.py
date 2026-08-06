import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_provider_onboarding_and_verification(admin_client: AsyncClient, provider_client: AsyncClient):
    # Step 1: Personal Info
    step1_data = {
        "bio": "I am a professional cleaner.",
        "years_experience": 5,
        "city": "Dubai",
        "country": "UAE"
    }
    res_s1 = await provider_client.post("/api/v1/providers/onboarding/step/1", json=step1_data)
    assert res_s1.status_code == 200
    assert res_s1.json()["city"] == "Dubai"

    # Admin creates a category for Step 2
    cat_res = await admin_client.post("/api/v1/categories", json={
        "name_en": "Cleaning",
        "name_ar": "تنظيف",
        "slug": "cleaning-prov",
        "icon": "sparkles",
        "booking_mode": "instant",
        "commission_rate": 10.0,
        "is_active": True,
        "dynamic_fields_schema": {}
    })
    cat_id = cat_res.json()["id"]

    # Step 2: Categories
    res_s2 = await provider_client.post("/api/v1/providers/onboarding/step/2", json={"category_ids": [cat_id]})
    assert res_s2.status_code == 200

    # Step 3: Service Area
    res_s3 = await provider_client.post("/api/v1/providers/onboarding/step/3", json={
        "latitude": 25.2048,
        "longitude": 55.2708,
        "service_radius_km": 15.0
    })
    assert res_s3.status_code == 200
    assert res_s3.json()["service_radius_km"] == 15.0
    assert res_s3.json()["verification_status"] == "pending"

    profile_id = res_s3.json()["id"]

    # Admin checks pending providers
    res_pending = await admin_client.get("/api/v1/admin/providers/pending")
    assert res_pending.status_code == 200
    pending_ids = [p["id"] for p in res_pending.json()]
    assert profile_id in pending_ids

    # Admin approves provider
    res_approve = await admin_client.post(f"/api/v1/admin/providers/{profile_id}/verify", json={
        "status": "approved",
        "notes": "Looks good"
    })
    assert res_approve.status_code == 200
    assert res_approve.json()["verification_status"] == "approved"

    # Provider sets online status
    res_online = await provider_client.patch("/api/v1/providers/me/online-status", json={"is_online": True})
    assert res_online.status_code == 200
    assert res_online.json()["is_online"] is True
