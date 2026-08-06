"""
Best-match scoring service (FR-20).

Formula (deterministic — NOT AI):
  score = w_price * norm_price + w_distance * norm_distance + w_rating * norm_rating + w_eta * norm_eta

Weights (per business-rules.md):
  price: 40%, distance: 30%, rating: 20%, ETA: 10%

Normalisation:
  - price:    lower is better → norm = 1 - (price - min) / (max - min)
  - distance: lower is better → norm = 1 - (dist - min) / (max - min)
  - rating:   higher is better → norm = rating / 5.0
  - ETA:      lower is better → norm = 1 - (eta - min) / (max - min)

If only 1 offer, score = 1.0.
"""
from dataclasses import dataclass
from typing import List, Optional


WEIGHT_PRICE = 0.40
WEIGHT_DISTANCE = 0.30
WEIGHT_RATING = 0.20
WEIGHT_ETA = 0.10


@dataclass
class OfferInput:
    offer_id: int
    provider_id: int
    price: float
    distance_km: float        # Haversine from job location to provider
    avg_rating: float         # 0.0–5.0
    duration_minutes: int     # used as ETA proxy


@dataclass
class OfferScore:
    offer_id: int
    score: float              # 0.0–1.0
    reasoning: str


def _normalize(value: float, min_val: float, max_val: float, invert: bool = False) -> float:
    """Min-max normalisation. If invert=True, lower source value → higher normalised score."""
    if max_val == min_val:
        return 1.0  # All offers are equal on this dimension
    norm = (value - min_val) / (max_val - min_val)
    return (1.0 - norm) if invert else norm


def compute_best_match(offers: List[OfferInput]) -> List[OfferScore]:
    """
    Compute best-match scores for a list of offers.
    Returns list of OfferScore objects sorted descending by score.
    """
    if not offers:
        return []

    if len(offers) == 1:
        return [OfferScore(
            offer_id=offers[0].offer_id,
            score=1.0,
            reasoning="Only offer — automatically top match.",
        )]

    # Gather extremes
    prices = [o.price for o in offers]
    distances = [o.distance_km for o in offers]
    ratings = [o.avg_rating for o in offers]
    etas = [o.duration_minutes for o in offers]

    min_price, max_price = min(prices), max(prices)
    min_dist, max_dist = min(distances), max(distances)
    min_eta, max_eta = min(etas), max(etas)

    results: List[OfferScore] = []

    for o in offers:
        np = _normalize(o.price, min_price, max_price, invert=True)
        nd = _normalize(o.distance_km, min_dist, max_dist, invert=True)
        nr = o.avg_rating / 5.0
        ne = _normalize(o.duration_minutes, min_eta, max_eta, invert=True)

        score = WEIGHT_PRICE * np + WEIGHT_DISTANCE * nd + WEIGHT_RATING * nr + WEIGHT_ETA * ne

        reasons = []
        if np >= 0.7:
            reasons.append("competitive price")
        if nd >= 0.7:
            reasons.append("closest provider")
        if nr >= 0.7:
            reasons.append("high rating")
        if not reasons:
            reasons.append("balanced match")

        reasoning = f"Score {score:.2f} — " + ", ".join(reasons) + "."

        results.append(OfferScore(offer_id=o.offer_id, score=round(score, 4), reasoning=reasoning))

    results.sort(key=lambda x: x.score, reverse=True)
    return results
