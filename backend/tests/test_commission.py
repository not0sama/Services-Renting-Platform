import pytest
from app.services.payment_service import _resolve_commission_pct
from app.models.category import Category


def test_resolve_commission_flat_fallback():
    # Category with flat rate and no tiers
    cat = Category(name_en="Test", name_ar="اختبار", slug="test", commission_rate=12.5)
    pct = _resolve_commission_pct(200.0, cat)
    assert pct == 12.5


def test_resolve_commission_tiered_brackets():
    tiers = [
        {"min": 0, "max": 500, "rate": 20.0},
        {"min": 501, "max": 2000, "rate": 15.0},
        {"min": 2001, "max": 10000, "rate": 10.0},
    ]
    cat = Category(name_en="Test Tier", name_ar="اختبار", slug="test-tier", commission_rate=15.0, commission_tiers=tiers)

    # Under 500
    assert _resolve_commission_pct(300.0, cat) == 20.0
    # Between 501 and 2000
    assert _resolve_commission_pct(1000.0, cat) == 15.0
    # Over 2000
    assert _resolve_commission_pct(3000.0, cat) == 10.0


def test_resolve_commission_no_category_fallback():
    pct = _resolve_commission_pct(100.0, None)
    assert pct == 15.0  # default settings fallback
