import pytest
from app.models.booking import BookingStatus, VALID_TRANSITIONS


def test_booking_state_machine_valid_transitions():
    assert BookingStatus.confirmed in VALID_TRANSITIONS[BookingStatus.pending]
    assert BookingStatus.en_route in VALID_TRANSITIONS[BookingStatus.confirmed]
    assert BookingStatus.in_progress in VALID_TRANSITIONS[BookingStatus.en_route]
    assert BookingStatus.completed in VALID_TRANSITIONS[BookingStatus.in_progress]
    assert BookingStatus.revision_requested in VALID_TRANSITIONS[BookingStatus.completed]
    assert BookingStatus.completed in VALID_TRANSITIONS[BookingStatus.revision_requested]


def test_booking_state_machine_cancellation_allowed():
    assert BookingStatus.cancelled in VALID_TRANSITIONS[BookingStatus.pending]
    assert BookingStatus.cancelled in VALID_TRANSITIONS[BookingStatus.confirmed]
    assert BookingStatus.cancelled in VALID_TRANSITIONS[BookingStatus.en_route]


def test_booking_state_machine_disallowed_transition():
    # Cannot jump straight from pending to completed
    assert BookingStatus.completed not in VALID_TRANSITIONS[BookingStatus.pending]
