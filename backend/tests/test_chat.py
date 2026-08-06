import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_chat_rest(
    admin_client: AsyncClient,
    provider_client: AsyncClient,
    customer_client: AsyncClient
):
    # 1. Setup Category
    cat_res = await admin_client.post("/api/v1/categories", json={
        "name_en": "Chat Test",
        "name_ar": "محادثة",
        "slug": "chat-test",
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
        "title": "Chat Service",
        "description": "Test",
        "price": 50.0,
        "duration_minutes": 30
    })
    svc_id = svc_res.json()["id"]

    # 4. Customer books
    book_res = await customer_client.post("/api/v1/bookings/instant", json={
        "service_id": svc_id,
        "scheduled_datetime": "2026-10-20T10:00:00Z"
    })
    booking_id = book_res.json()["id"]

    # 5. Customer sends a message via REST
    msg_res = await customer_client.post(f"/api/v1/chat/{booking_id}/messages", json={
        "content": "Hello Provider!"
    })
    assert msg_res.status_code == 200
    assert msg_res.json()["content"] == "Hello Provider!"

    # 6. Provider replies via REST
    rep_res = await provider_client.post(f"/api/v1/chat/{booking_id}/messages", json={
        "content": "Hi Customer!"
    })
    assert rep_res.status_code == 200
    assert rep_res.json()["content"] == "Hi Customer!"

    # 7. Customer fetches history
    hist_res = await customer_client.get(f"/api/v1/chat/{booking_id}/messages")
    assert hist_res.status_code == 200
    messages = hist_res.json()
    assert len(messages) == 2
    assert messages[0]["content"] == "Hello Provider!"
    assert messages[1]["content"] == "Hi Customer!"

    # 8. Admin cannot access chat (should return 403 or 404, we'll check what the router says)
    # The router says "Not a participant in this booking" and returns 403.
    admin_hist = await admin_client.get(f"/api/v1/chat/{booking_id}/messages")
    assert admin_hist.status_code == 403
