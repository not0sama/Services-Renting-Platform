import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_register_and_login_customer(client: AsyncClient):
    # Register
    register_data = {
        "name": "Test Customer",
        "email": "customer@example.com",
        "password": "Password123!",
        "role": "customer",
        "language_pref": "en",
        "accepted_terms": True
    }
    response = await client.post("/api/v1/auth/register", json=register_data)
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["user"]["email"] == register_data["email"]
    assert data["user"]["role"] == "customer"

    # Login
    login_data = {
        "email": "customer@example.com",
        "password": "Password123!"
    }
    response = await client.post("/api/v1/auth/login", json=login_data)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    
    # Get ME
    access_token = data["access_token"]
    headers = {"Authorization": f"Bearer {access_token}"}
    response = await client.get("/api/v1/auth/me", headers=headers)
    assert response.status_code == 200
    me_data = response.json()
    assert me_data["email"] == register_data["email"]
