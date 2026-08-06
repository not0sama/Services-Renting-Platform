import pytest
from app.schemas.misc import ReviewCreate


def test_resolved_rating_all_criteria():
    rc = ReviewCreate(
        booking_id=1,
        quality_rating=5,
        punctuality_rating=4,
        communication_rating=4,
    )
    # Average = (5 + 4 + 4) / 3 = 13/3 = 4.33 -> rounded to 4
    assert rc.resolved_rating() == 4


def test_resolved_rating_fallback_to_rating():
    rc = ReviewCreate(
        booking_id=1,
        rating=5,
    )
    assert rc.resolved_rating() == 5


def test_resolved_rating_partial_criteria():
    rc = ReviewCreate(
        booking_id=1,
        quality_rating=5,
        punctuality_rating=3,
    )
    # Average = (5 + 3) / 2 = 4
    assert rc.resolved_rating() == 4


def test_invalid_star_rating_raises():
    with pytest.raises(ValueError):
        ReviewCreate(booking_id=1, quality_rating=6)
