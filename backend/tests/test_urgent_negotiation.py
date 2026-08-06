import pytest
from app.models.job import JobRequest, Offer, OfferStatus


def test_urgent_price_calculation():
    job = JobRequest(
        customer_id=1, category_id=1, title="Emergency Leak",
        description="Fix urgent water leak", is_urgent=True, urgent_surcharge_pct=25.0
    )
    offer = Offer(
        job_id=1, provider_id=1, price=200.0, duration_minutes=60, urgent_surcharge_pct=25.0
    )

    surcharge = offer.price * (offer.urgent_surcharge_pct / 100.0) if offer.urgent_surcharge_pct else 0
    final_price = round(offer.price + surcharge, 2)

    assert surcharge == 50.0
    assert final_price == 250.0


def test_urgent_counter_offer_negotiation():
    # Provider counters with 15% instead of requested 25%
    offer = Offer(
        job_id=1, provider_id=1, price=300.0, duration_minutes=90, urgent_surcharge_pct=15.0
    )

    surcharge = offer.price * (offer.urgent_surcharge_pct / 100.0)
    final_price = round(offer.price + surcharge, 2)

    assert surcharge == 45.0
    assert final_price == 345.0
