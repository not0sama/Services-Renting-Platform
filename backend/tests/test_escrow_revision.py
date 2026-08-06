import pytest
from httpx import AsyncClient
from datetime import datetime, timedelta

@pytest.mark.asyncio
async def test_escrow_revision_and_autorelease(
    admin_client: AsyncClient,
    provider_client: AsyncClient,
    customer_client: AsyncClient,
    session
):
    from app.tasks.auto_release import _release_overdue_payments
    from app.models.payment import Payment, PaymentStatus
    from sqlalchemy import select
    
    cat_res = await admin_client.post("/api/v1/categories", json={
        "name_en": "Escrow Test",
        "name_ar": "اختبار",
        "slug": "escrow-test",
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
        "title": "Escrow Service",
        "description": "Test",
        "price": 500.0,
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
    checkout_res = await customer_client.post("/api/v1/payments/checkout", json={"booking_id": booking_id})
    assert checkout_res.status_code == 200
    assert checkout_res.json()["status"] == "held"
    
    # 6. Provider completes work (steps)
    await provider_client.patch(f"/api/v1/bookings/{booking_id}/status", json={"status": "en_route"})
    await provider_client.patch(f"/api/v1/bookings/{booking_id}/status", json={"status": "in_progress"})
    comp_res = await provider_client.patch(f"/api/v1/bookings/{booking_id}/status", json={"status": "completed"})
    assert comp_res.json()["status"] == "completed"

    # 7. Customer Requests Revision
    rev_res = await customer_client.post(f"/api/v1/bookings/{booking_id}/request-revision", json={"notes": "Please fix X"})
    assert rev_res.status_code == 200
    assert rev_res.json()["status"] == "revision_requested"

    # 8. Try auto-release -> should NOT release because status is revision_requested
    await _release_overdue_payments()
    
    payment_result = await session.execute(select(Payment).where(Payment.booking_id == booking_id))
    payment = payment_result.scalars().first()
    assert payment.status == PaymentStatus.held

    # 9. Provider resubmits
    resubmit = await provider_client.post(f"/api/v1/bookings/{booking_id}/resubmit-complete")
    assert resubmit.status_code == 200
    assert resubmit.json()["status"] == "completed"

    # 10. Manipulate auto_release_at to simulate time passing (72+ hours)
    payment_result = await session.execute(select(Payment).where(Payment.booking_id == booking_id))
    payment = payment_result.scalars().first()
    payment.auto_release_at = datetime.utcnow() - timedelta(hours=1)
    session.add(payment)
    await session.commit()

    # 11. Run Auto-release -> SHOULD release now
    from app.models.booking import Booking
    booking_result = await session.execute(select(Booking).where(Booking.id == booking_id))
    b = booking_result.scalars().first()
    print("\n--- DEBUG BEFORE TASK ---")
    print(f"Payment Status: {payment.status}, Auto_release_at: {payment.auto_release_at}, Type: {type(payment.auto_release_at)}")
    print(f"Booking Status: {b.status}")
    print(f"Now UTC: {datetime.utcnow()}")
    print("-------------------------\n")
    
    import app.tasks.auto_release
    async def mock_get_session():
        yield session
    original_get_session = app.tasks.auto_release.get_session
    app.tasks.auto_release.get_session = mock_get_session

    await _release_overdue_payments()
    
    app.tasks.auto_release.get_session = original_get_session
    
    await session.refresh(payment)
    assert payment.status == PaymentStatus.auto_released
