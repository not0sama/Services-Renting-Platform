import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_category_crud_flow(admin_client: AsyncClient, customer_client: AsyncClient):
    # Admin creates category
    cat_data = {
        "name_en": "Cleaning",
        "name_ar": "تنظيف",
        "slug": "cleaning",
        "icon_url": "sparkles",
        "booking_mode": "instant",
        "commission_rate": 10.0,
        "is_active": True,
        "dynamic_fields_schema": {"type": "object"}
    }
    res = await admin_client.post("/api/v1/categories", json=cat_data)
    assert res.status_code == 201
    cat_id = res.json()["id"]

    # Customer can read category
    res_read = await customer_client.get("/api/v1/categories")
    assert res_read.status_code == 200
    assert len(res_read.json()) > 0
    assert res_read.json()[0]["slug"] == "cleaning"

    # Customer CANNOT update category
    res_err = await customer_client.patch(f"/api/v1/categories/{cat_id}", json={"name_en": "Hacked"})
    assert res_err.status_code == 403

    # Admin updates category
    res_up = await admin_client.patch(f"/api/v1/categories/{cat_id}", json={"name_en": "Deep Cleaning"})
    assert res_up.status_code == 200
    assert res_up.json()["name_en"] == "Deep Cleaning"

    # Admin deactivates category
    res_del = await admin_client.delete(f"/api/v1/categories/{cat_id}")
    assert res_del.status_code == 204

    # Fetch to ensure deactivated (if get_tree excludes inactive or we just get it by ID)
    res_get = await admin_client.get(f"/api/v1/categories/{cat_id}")
    assert res_get.status_code == 200
    assert res_get.json()["is_active"] is False
