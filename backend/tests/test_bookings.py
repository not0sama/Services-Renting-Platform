import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_instant_booking_flow(admin_client: AsyncClient, provider_client: AsyncClient, customer_client: AsyncClient):
    # Setup Category
    cat_res = await admin_client.post("/api/v1/categories", json={
        "name_en": "Electrician",
        "name_ar": "كهربائي",
        "slug": "electrician-test",
        "icon_url": "zap",
        "booking_mode": "instant",
        "commission_rate": 10.0,
        "is_active": True,
        "dynamic_fields_schema": {}
    })
    cat_id = cat_res.json()["id"]

    # Provider Onboarding
    await provider_client.post("/api/v1/providers/onboarding/step/1", json={"bio": "Electrician", "years_experience": 5, "city": "Dubai", "country": "UAE"})
    await provider_client.post("/api/v1/providers/onboarding/step/2", json={"category_ids": [cat_id]})
    res_s3 = await provider_client.post("/api/v1/providers/onboarding/step/3", json={"latitude": 25.2, "longitude": 55.2, "service_radius_km": 15.0})
    profile_id = res_s3.json()["id"]
    await admin_client.post(f"/api/v1/admin/providers/{profile_id}/verify", json={"status": "approved", "notes": "Approved"})

    # Provider creates a service
    svc_res = await provider_client.post("/api/v1/services", json={
        "category_id": cat_id,
        "title": "Wiring Repair",
        "description": "Fixing wires.",
        "price": 200.0,
        "duration_minutes": 120
    })
    service_id = svc_res.json()["id"]

    # Customer books instantly
    book_res = await customer_client.post("/api/v1/bookings/instant", json={
        "service_id": service_id,
        "scheduled_datetime": "2026-11-11T10:00:00Z",
        "latitude": 25.22,
        "longitude": 55.22,
        "location_address": "Marina Dubai"
    })
    assert book_res.status_code == 201
    booking_id = book_res.json()["id"]
    assert book_res.json()["status"] == "pending"
    assert book_res.json()["price"] == 200.0

    # Provider accepts booking (pending -> confirmed)
    stat_res = await provider_client.patch(f"/api/v1/bookings/{booking_id}/status", json={"status": "confirmed"})
    assert stat_res.status_code == 200
    assert stat_res.json()["status"] == "confirmed"

    # Customer pays for booking (checkout)
    checkout_res = await customer_client.post("/api/v1/payments/checkout", json={"booking_id": booking_id})
    assert checkout_res.status_code == 200
    assert checkout_res.json()["status"] == "held"

    # Provider en route (confirmed -> en_route)
    en_route_res = await provider_client.patch(f"/api/v1/bookings/{booking_id}/status", json={"status": "en_route"})
    assert en_route_res.status_code == 200

    # Provider starts work (en_route -> in_progress)
    in_progress_res = await provider_client.patch(f"/api/v1/bookings/{booking_id}/status", json={"status": "in_progress"})
    assert in_progress_res.status_code == 200

    # Provider completes work (in_progress -> completed)
    comp_res = await provider_client.patch(f"/api/v1/bookings/{booking_id}/status", json={"status": "completed"})
    assert comp_res.status_code == 200
    assert comp_res.json()["status"] == "completed"

    # Customer releases payment
    pay_res = await customer_client.post(f"/api/v1/bookings/{booking_id}/accept-work")
    assert pay_res.status_code == 200
    assert pay_res.json()["status"] == "released"
    assert pay_res.json()["gross_amount"] == 200.0
