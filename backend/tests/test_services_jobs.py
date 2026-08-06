import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_service_and_job_flow(admin_client: AsyncClient, provider_client: AsyncClient, customer_client: AsyncClient):
    # Setup Category
    cat_res = await admin_client.post("/api/v1/categories", json={
        "name_en": "Plumbing",
        "name_ar": "سباكة",
        "slug": "plumbing-test",
        "icon_url": "wrench",
        "booking_mode": "quote",
        "commission_rate": 15.0,
        "is_active": True,
        "dynamic_fields_schema": {}
    })
    cat_id = cat_res.json()["id"]

    # Provider Onboarding
    await provider_client.post("/api/v1/providers/onboarding/step/1", json={"bio": "Plumber", "years_experience": 10, "city": "Dubai", "country": "UAE"})
    await provider_client.post("/api/v1/providers/onboarding/step/2", json={"category_ids": [cat_id]})
    res_s3 = await provider_client.post("/api/v1/providers/onboarding/step/3", json={"latitude": 25.2, "longitude": 55.2, "service_radius_km": 15.0})
    profile_id = res_s3.json()["id"]
    await admin_client.post(f"/api/v1/admin/providers/{profile_id}/verify", json={"status": "approved", "notes": "Approved"})

    # Provider creates a service
    svc_data = {
        "category_id": cat_id,
        "title": "Pipe Leak Repair",
        "description": "Fixing leaking pipes.",
        "price": 100.0,
        "duration_minutes": 60
    }
    svc_res = await provider_client.post("/api/v1/services", json=svc_data)
    assert svc_res.status_code == 201

    # Customer posts a job
    job_data = {
        "category_id": cat_id,
        "title": "Fix sink",
        "description": "My kitchen sink is leaking",
        "latitude": 25.21,
        "longitude": 55.21,
        "location_address": "Downtown Dubai",
        "scheduled_date": "2026-10-10T10:00:00Z",
        "dynamic_fields_data": {}
    }
    job_res = await customer_client.post("/api/v1/jobs", json=job_data)
    assert job_res.status_code == 201
    job_id = job_res.json()["id"]

    # Provider submits offer
    offer_data = {
        "price": 150.0,
        "duration_minutes": 90,
        "message": "I can fix it in 90 mins."
    }
    offer_res = await provider_client.post(f"/api/v1/jobs/{job_id}/offers", json=offer_data)
    assert offer_res.status_code == 201
    offer_id = offer_res.json()["id"]

    # Customer accepts offer -> Creates booking
    accept_res = await customer_client.post(f"/api/v1/jobs/{job_id}/offers/{offer_id}/accept")
    assert accept_res.status_code == 200
    booking_id = accept_res.json()["id"]
    assert accept_res.json()["price"] == 150.0
