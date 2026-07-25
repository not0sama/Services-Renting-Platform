# Business Rules — Hiring & Renting Platform

> **Source of truth for all platform business logic.**  
> Finalized in Week 1. Values here must match environment variables in `.env`.  
> Admin-configurable values can be updated via the Admin UI in Phase 1/2.

---

## Escrow & Payments

| Rule | Default | Configurable |
|---|---|---|
| Escrow auto-release window | **72 hours** after provider marks complete | ✅ Admin global + per-category |
| Cancellation free window | **24 hours** before scheduled start | ❌ Platform-wide |
| Cancellation fee (after free window) | **10%** of booking price | ❌ Platform-wide |
| Invoice generated | On checkout confirmation | — |
| Payout minimum | $10 | — |

## Commission

| Rule | Default | Configurable |
|---|---|---|
| Commission model (Phase 1) | **Flat 15%** per category | ✅ Per-category in Admin |
| Commission tiers (Phase 2) | 0–500: **20%** / 501–2000: **15%** / 2001+: **10%** | ✅ Per-category in Admin |

## Urgent Requests

| Rule | Default | Configurable |
|---|---|---|
| Urgent surcharge (Phase 1 fixed) | **+25%** on base price | ✅ Per-category |
| Urgent negotiation (Phase 2) | Provider can counter **±50%** of suggested premium | — |
| Urgent broadcast priority | Online providers sorted first | — |

## Offers & Jobs

| Rule | Default | Configurable |
|---|---|---|
| Offer expiry | **7 days** after job posted | ✅ Per-category |
| Max offers per provider per job | 1 | — |
| Job auto-expire if no offers | 14 days | — |

## Best-Match Scoring (Deterministic Formula)

```
score = w_price * norm_price + w_distance * norm_distance + w_rating * norm_rating + w_eta * norm_eta
```

| Factor | Weight | Notes |
|---|---|---|
| Price (lower = better) | **40%** | Normalized: cheapest offer = 1.0 |
| Distance (shorter = better) | **30%** | Haversine from job location |
| Provider rating (higher = better) | **20%** | Average rating / 5.0 |
| ETA (shorter = better) | **10%** | Normalized |

## Trust Score Formula

```
trust = w1*norm_rating + w2*on_time_rate + w3*completion_rate + w4*norm_response + w5*(1 - cancellation_rate)
```

| Metric | Weight | Notes |
|---|---|---|
| Average rating | **30%** | Rating / 5.0 |
| On-time rate | **25%** | % of jobs started on schedule |
| Completion rate | **20%** | % of accepted jobs completed |
| Response speed | **15%** | Inverse of avg_response_minutes, normalized |
| Cancellation rate (inverted) | **10%** | (1 - rate) so lower cancellation = better score |

## Reputation Tiers

| Tier | Trust Score Range | Badge Color |
|---|---|---|
| 🥉 Bronze | 0 – 49 | Bronze gradient |
| 🥈 Silver | 50 – 69 | Silver gradient |
| 🥇 Gold | 70 – 84 | Gold gradient |
| 💎 Platinum | 85 – 100 | Platinum gradient |

Tier recalculated incrementally after each: completed booking, review received, offer/message sent (for response time).

## Provider Minimum Standards

| Rule | Value | Action |
|---|---|---|
| Min rating before admin flag | Below **3.0** with 5+ reviews | Flagged in Admin dashboard |
| Min completion rate before warning | Below **70%** with 10+ jobs | Admin notification |

## Security & Auth

| Rule | Value |
|---|---|
| Password minimum length | 8 characters |
| Password requirements | 1 uppercase, 1 number |
| JWT access token expiry | 15 minutes |
| JWT refresh token expiry | 7 days |
| Password reset code validity | 30 minutes |
| Reset code length | 6 digits |
| File upload max size | Images: 5MB, PDFs: 10MB |
| Allowed file types | jpg, png, pdf |

## Booking Status Machine

```
[*] → pending → confirmed → en_route → in_progress → completed → [*]
                                    ↘ revision_requested ↗ (loops back to completed)
confirmed / en_route / in_progress → cancelled
```

Valid provider transitions only — invalid transitions return HTTP 409.

## Escrow Decision Flow (after provider marks complete)

1. Payment status: `held` — auto_release_at = now + 72 hours
2. Customer must choose within 72 hours:
   - ✅ Accept Work → payment `released`
   - 🔄 Request Revision → booking `revision_requested` + auto_release timer **paused**
   - ⚠️ Open Dispute → dispute created, payment stays `held`
3. If no action: payment auto-released (`auto_released`), both parties notified
4. Provider addresses revision → resubmits → booking back to `completed` → auto_release timer **resets** (new 72h window)

## Scheduler Configuration

| Setting | Value |
|---|---|
| Poll interval | Every 5 minutes |
| Test mode (for unit tests) | 1 minute (override via env) |
