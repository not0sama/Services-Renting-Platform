import pytest
from app.services.reputation import calculate_trust_score, _assign_tier
from app.models.provider import ProviderTier

def test_calculate_trust_score_perfect():
    score = calculate_trust_score(
        avg_rating=5.0,
        on_time_rate=1.0,
        completion_rate=1.0,
        avg_response_minutes=0,
        cancellation_rate=0.0
    )
    assert score == 100.0

def test_calculate_trust_score_poor():
    score = calculate_trust_score(
        avg_rating=2.5,  # 0.5 norm * 0.3 = 0.15
        on_time_rate=0.5, # 0.5 * 0.25 = 0.125
        completion_rate=0.6, # 0.6 * 0.2 = 0.12
        avg_response_minutes=120, # 0.0 * 0.15 = 0.0
        cancellation_rate=0.5 # 0.5 * 0.1 = 0.05
    )
    # Total raw = 0.15 + 0.125 + 0.12 + 0 + 0.05 = 0.445 -> 44.5
    assert 44.0 <= score <= 45.0

def test_assign_tier():
    assert _assign_tier(49.0) == ProviderTier.bronze
    assert _assign_tier(50.0) == ProviderTier.silver
    assert _assign_tier(69.9) == ProviderTier.silver
    assert _assign_tier(70.0) == ProviderTier.gold
    assert _assign_tier(84.9) == ProviderTier.gold
    assert _assign_tier(85.0) == ProviderTier.platinum
    assert _assign_tier(100.0) == ProviderTier.platinum

@pytest.mark.asyncio
async def test_update_provider_reputation_db(provider_client, session):
    from app.services.reputation import update_provider_reputation
    from app.models.provider import ProviderProfile, ProviderTier
    from sqlalchemy import select
    
    # 1. Onboard provider to create profile
    cat_res = await provider_client.post("/api/v1/providers/onboarding/step/1", json={"bio": "Reputation Test", "years_experience": 5, "city": "Dubai", "country": "UAE"})
    
    # 2. Find profile in DB
    result = await session.execute(select(ProviderProfile))
    profile = result.scalars().first()
    
    # 3. Modify metrics artificially
    profile.avg_rating = 4.8
    profile.on_time_rate = 0.9
    profile.completion_rate = 0.95
    profile.avg_response_minutes = 15
    profile.cancellation_rate = 0.05
    session.add(profile)
    await session.commit()
    
    # 4. Trigger recalculation
    await update_provider_reputation(profile.id, session)
    await session.commit()
    
    # 5. Verify tier
    await session.refresh(profile)
    assert profile.trust_score > 80.0
    assert profile.tier in [ProviderTier.gold, ProviderTier.platinum]
