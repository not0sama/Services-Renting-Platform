import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_reviews_and_disputes(
    admin_client: AsyncClient,
    provider_client: AsyncClient,
    customer_client: AsyncClient,
    session
):
    # 1. Setup Category
    cat_res = await admin_client.post("/api/v1/categories", json={
        "name_en": "Review Test",
        "name_ar": "مراجعة",
        "slug": "review-test",
        "icon_url": "test",
        "booking_mode": "instant",
        "is_active": True,
        "dynamic_fields_schema": {}
    })
    cat_id = cat_res.json()["id"]

    # 2. Setup Provider
    await provider_client.post("/api/v1/providers/onboarding/step/1", json={"bio": "Test", "years_experience": 1, "city": "Test", "country": "Test"})
    await provider_client.post("/api/v1/providers/onboarding/step/2", json={"category_ids": [cat_id]})
    res_s3 = await provider_client.post("/api/v1/providers/onboarding/step/3", json={"latitude": 10.0, "longitude": 10.0})
    profile_id = res_s3.json()["id"]
    await admin_client.post(f"/api/v1/admin/providers/{profile_id}/verify", json={"status": "approved", "notes": ""})

    # 3. Create Service
    svc_res = await provider_client.post("/api/v1/services", json={
        "category_id": cat_id,
        "title": "Review Service",
        "description": "Test",
        "price": 100.0,
        "duration_minutes": 60
    })
    svc_id = svc_res.json()["id"]

    # 4. Customer books
    book_res = await customer_client.post("/api/v1/bookings/instant", json={
        "service_id": svc_id,
        "scheduled_datetime": "2026-10-10T10:00:00Z"
    })
    booking_id = book_res.json()["id"]

    # 5. Customer Checkout
    await customer_client.post("/api/v1/payments/checkout", json={"booking_id": booking_id})
    
    # 6. Provider completes work (steps)
    await provider_client.patch(f"/api/v1/bookings/{booking_id}/status", json={"status": "en_route"})
    await provider_client.patch(f"/api/v1/bookings/{booking_id}/status", json={"status": "in_progress"})
    await provider_client.patch(f"/api/v1/bookings/{booking_id}/status", json={"status": "completed"})

    # 7. Customer submits review
    rev_payload = {
        "booking_id": booking_id,
        "rating": 5,
        "quality_rating": 5,
        "punctuality_rating": 5,
        "communication_rating": 4,
        "comment": "Great work"
    }
    review_res = await customer_client.post("/api/v1/reviews", json=rev_payload)
    assert review_res.status_code == 201
    assert review_res.json()["rating"] == 5

    # 8. Dispute Test (create another booking for the same service)
    book_res2 = await customer_client.post("/api/v1/bookings/instant", json={
        "service_id": svc_id,
        "scheduled_datetime": "2026-10-11T10:00:00Z"
    })
    booking2_id = book_res2.json()["id"]
    await customer_client.post("/api/v1/payments/checkout", json={"booking_id": booking2_id})
    
    await provider_client.patch(f"/api/v1/bookings/{booking2_id}/status", json={"status": "en_route"})
    await provider_client.patch(f"/api/v1/bookings/{booking2_id}/status", json={"status": "in_progress"})
    await provider_client.patch(f"/api/v1/bookings/{booking2_id}/status", json={"status": "completed"})

    # Open Dispute
    disp_res = await customer_client.post(f"/api/v1/disputes/bookings/{booking2_id}/open", json={
        "reason": "Not done correctly",
        "evidence_urls": []
    })
    assert disp_res.status_code == 200
    disp_id = disp_res.json()["dispute_id"]

    # Admin resolves dispute in favor of customer
    resolve_res = await admin_client.patch(f"/api/v1/disputes/{disp_id}/resolve", json={
        "resolution": "resolved_refund",
        "admin_notes": "Provider did not finish"
    })
    print("RESOLVE RES:", resolve_res.text)
    assert resolve_res.status_code == 200
    assert resolve_res.json()["resolution"] == "resolved_refund"
