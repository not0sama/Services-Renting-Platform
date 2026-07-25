---
name: Comprehensive Dev Plan
overview: A granular 16-week development plan for the Multi-Service Hiring & Renting Platform, mapping all 68 functional requirements, 23 non-functional requirements, every UI screen, database entity, API module, business rule, and test/deployment artifact to phased weekly deliverables for a solo developer.
todos:
  - id: phase-0-foundation
    content: "Phase 0 (Weeks 1-2): Repo setup, auth/JWT/RBAC, role shells, password reset, run locally"
    status: pending
  - id: phase-1-mvp
    content: "Phase 1 (Weeks 3-8): Categories, onboarding, Instant Book, booking lifecycle, payments, reviews, Custom Quote, best-match, search, admin core — all Must-Have FRs"
    status: pending
  - id: phase-2-ai-escrow-reputation
    content: "Phase 2 Week 9-10: AI Smart Assistant (FR-59-62), Escrow revision/auto-release (FR-63-65), Reputation Score & tiers (FR-66-68)"
    status: pending
  - id: phase-2-remaining-should
    content: "Phase 2 Week 11: Tiered commission, urgent negotiation, chat, live location, verification/disputes, multi-criteria reviews, favorites"
    status: pending
  - id: phase-3-testing-polish
    content: "Phase 3 (Weeks 12-13): Unit tests, E2E matrix, seed data, Could-Have features, UI polish, browser compat"
    status: pending
  - id: phase-4-5-deploy-docs-defense
    content: "Phase 4-5 (Weeks 14-16): Production deploy, graduation report, demo script, backup video, defense rehearsal"
    status: pending
isProject: false
---

# Comprehensive Development Plan — Multi-Service Hiring & Renting Platform

**Scope:** Solo developer, 16-week semester, modular monolith (Next.js 14 + FastAPI + PostgreSQL)  
**Source of truth:** [Project_Documentation.md](/Users/osama/Desktop/Hiring & Renting Platform/Project_Documentation.md) (requirements, UI, schema, flows)  
**Baseline plan:** [Development_Plan.md](/Users/osama/Desktop/Hiring & Renting Platform/Development_Plan.md) — extended here with full traceability and implementation detail  

**Important alignment note:** [Project_Documentation.md Section 12.3](/Users/osama/Desktop/Hiring & Renting Platform/Project_Documentation.md) reorders Phase 2 to prioritize the three signature features (AI Smart Assistant, Escrow revision/auto-release, Reputation Score) **before** other Should-Have items. This plan follows that updated order, not the older sequence in [Development_Plan.md Section 3 Phase 2](/Users/osama/Desktop/Hiring & Renting Platform/Development_Plan.md).

**Language decision (confirmed):** Arabic and English are both supported — `language_pref` is scaffolded on USER from Phase 0 and UI strings are extracted to a constants file so switching is trivial. **RTL layout is deferred** — it is intentionally out of scope for this build cycle and will not be implemented. This resolves the NFR-4 vs MoSCoW Section 8.4 conflict pragmatically.

---

## 1. Architecture & Repository Structure

### 1.1 Monorepo layout

```
hiring-renting-platform/
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI app, CORS, lifespan
│   │   ├── core/                   # config, security, deps, exceptions
│   │   ├── db/                     # engine, session, base models
│   │   ├── models/                 # SQLModel entities (one file per domain)
│   │   ├── schemas/                # Pydantic request/response DTOs
│   │   ├── routers/                # API route modules
│   │   ├── services/               # business logic (stateless)
│   │   ├── utils/                  # haversine, file upload, validators
│   │   ├── websockets/             # chat + location manager
│   │   ├── tasks/                  # escrow auto-release scheduler
│   │   └── ai/                     # Claude client, prompts, matching
│   ├── alembic/                    # migrations
│   ├── tests/                      # pytest unit + integration
│   ├── uploads/                    # local file storage (gitignored)
│   ├── seed/                       # demo seed scripts
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/                    # Next.js App Router
│   │   │   ├── (public)/           # landing, login, signup, help
│   │   │   ├── (customer)/         # customer shell + pages
│   │   │   ├── (provider)/         # provider shell + pages
│   │   │   └── (admin)/            # admin shell (unlisted route)
│   │   ├── components/             # shared UI primitives
│   │   ├── features/               # domain-specific components
│   │   ├── hooks/                  # useAuth, useWebSocket, useNotifications
│   │   ├── lib/                    # api client, auth storage, utils
│   │   └── types/                  # TS interfaces mirroring backend schemas
│   └── package.json
├── docs/                           # ERD exports, API notes, business rules
├── .env.example
└── README.md
```

### 1.2 Backend modules ↔ FR mapping

| Module | Responsibilities | Primary FRs |
|--------|------------------|-------------|
| `auth` | Register, login, JWT, password reset, RBAC | FR-1–4, NFR-9–10 |
| `users` | Profiles, addresses, favorites, report/block | FR-5, FR-47, FR-57 |
| `providers` | Onboarding, verification, online toggle, metrics | FR-6–7, FR-46, FR-66–68 |
| `categories` | CRUD, dynamic fields schema, booking mode, commission, urgent | FR-8–12 |
| `services` | Instant Book packages, availability | FR-21–24 |
| `jobs` | Job requests, urgent flag, AI metadata | FR-13–16, FR-32, FR-59–62 |
| `offers` | Submit/edit/withdraw, best-match scoring | FR-17–20 |
| `bookings` | Lifecycle, reschedule, cancel, revision state | FR-28–31, FR-63–65 |
| `payments` | Escrow, commission, invoice, payout | FR-35–39, FR-64 |
| `reviews` | Ratings, provider response, moderation | FR-43–45, FR-53 |
| `chat` | Messages, WebSocket | FR-40 |
| `tracking` | En-route location via WebSocket | FR-42 |
| `notifications` | In-app event feed | FR-41 |
| `disputes` | Open, evidence, admin resolution | FR-49, FR-52 |
| `admin` | Users, bookings, analytics, announcements, roles | FR-50–56, FR-54 |
| `ai` | Smart Assistant, fallback path | FR-59–62, NFR-22 |
| `reputation` | Trust score formula, tier assignment | FR-66–68, NFR-23 |
| `scheduler` | Auto-release polling job | FR-64 |

### 1.3 System diagram

```mermaid
flowchart TB
  subgraph client [Next.js Client]
    PublicUI[Public Pages]
    CustomerUI[Customer Interface]
    ProviderUI[Provider Interface]
    AdminUI[Admin Interface]
  end

  subgraph api [FastAPI Modular Monolith]
    AuthMod[Auth and RBAC]
    BookingMod[Bookings and Jobs]
    PayMod[Payments and Escrow]
    AIMod[AI Assistant and Matching]
    RepMod[Reputation Scoring]
    ChatMod[WebSocket Chat and Tracking]
    SchedMod[Auto-Release Scheduler]
  end

  subgraph data [Data Layer]
    DB[(PostgreSQL)]
    Files[Local Uploads]
  end

  subgraph external [External]
    Gemini[Google Gemini API]
    OSM[OpenStreetMap via Leaflet]
  end

  client -->|REST and WebSocket| api
  api --> DB
  api --> Files
  AIMod --> Gemini
  client --> OSM
```

---

## 2. Business Rules & Configuration (finalize Week 1, implement with defaults)

Create [`docs/business-rules.md`](/Users/osama/Desktop/Hiring & Renting Platform/docs/business-rules.md) before coding feature logic. Suggested defaults (adjustable via Admin later where noted):

| Rule | Default | Configurable by Admin |
|------|---------|---------------------|
| Escrow auto-release window | 72 hours after provider marks complete | Yes — global + per category (FR-64, Section 5.4.8) |
| Urgent surcharge (Phase 1 MVP) | +25% on base price | Category-level |
| Urgent negotiation (Phase 2) | Provider can counter ±50% of suggested premium | — |
| Offer expiry | 7 days after job posted | Category-level |
| Cancellation — free window | 24h before scheduled start | — |
| Cancellation fee | 10% of booking price after free window | — |
| Commission — flat (Phase 1) | 15% per category | Category CRUD |
| Commission — tiered (Phase 2) | 0–500: 20%, 501–2000: 15%, 2000+: 10% | Category CRUD |
| Best-match weights | price 40%, distance 30%, rating 20%, ETA 10% | Env/config |
| Trust Score weights | rating 30%, on-time 25%, completion 20%, response 15%, cancellation 10% (inverted) | Env/config |
| Tier thresholds | Bronze 0–49, Silver 50–69, Gold 70–84, Platinum 85+ | Env/config |
| Min rating before flag | Below 3.0 with 5+ reviews → admin flag | — |
| File upload limits | Images: 5MB, PDF docs: 10MB; jpg/png/pdf only | — |
| Password policy | Min 8 chars, 1 uppercase, 1 number | — |
| JWT expiry | Access 15min, refresh 7 days | — |

---

## 3. Database Implementation Plan

### 3.1 Migration order (Alembic revisions)

Implement in this order to satisfy foreign keys (NFR-14):

1. `users` — base account (role enum: customer/provider/admin)
2. `addresses`
3. `categories` — includes `dynamic_fields_schema` JSON, `booking_mode`, `commission_rate`, `urgent_enabled`
4. `provider_profiles` — includes trust_score, tier, metric columns
5. `provider_categories` — join table
6. `documents` — provider verification uploads
7. `services` — Instant Book packages
8. `availability` — calendar slots
9. `job_requests` — includes ai_generated, estimated_cost/duration
10. `offers`
11. `bookings` — includes revision_notes, revision_count; status enum includes `revision_requested`
12. `payments` — includes auto_release_at, released_at; status enum: held/released/auto_released/refunded
13. `reviews` — criteria_ratings JSON; DB check: booking.status = completed (NFR-15)
14. `messages`
15. `notifications`
16. `disputes`
17. `favorites`
18. `audit_logs` — for NFR-13 sensitive actions
19. `admin_roles` + `admin_permissions` — Phase 3 Could-Have (FR-56)

### 3.2 Index strategy (NFR-5)

- `provider_profiles(latitude, longitude)` — distance queries
- `job_requests(category_id, status, is_urgent)`
- `bookings(customer_id, provider_id, status)`
- `payments(status, auto_release_at)` — scheduler query
- `notifications(user_id, read_at, created_at DESC)`

### 3.3 Seed data plan (Week 13)

- 15–20 categories (nested: Home → Plumbing, Electrical; Events → Photography)
- 10 provider accounts (mixed verification states, tiers)
- 5 customer accounts
- 1 admin account
- 20+ completed bookings with reviews (for reputation demo)
- 5 open job requests with offers
- Sample disputes, revision requests, auto-released payments

---

## 4. API Endpoint Catalog

All endpoints prefixed `/api/v1`. Every authenticated route enforces RBAC (FR-4, NFR-10).

### 4.1 Auth (`/auth`)
- `POST /register` — body: name, email, phone, password, role (customer|provider); FR-1, NFR-20 ToS checkbox
- `POST /login` — returns access + refresh JWT; FR-2
- `POST /logout` — invalidate refresh token; FR-2
- `POST /forgot-password` — send verification code (simulated email log in dev); FR-3
- `POST /reset-password` — verify code + set new password; FR-3
- `GET /me` — current user + role

### 4.2 Users (`/users`)
- `GET/PATCH /me/profile` — FR-5
- `CRUD /me/addresses`
- `GET/POST/DELETE /me/favorites/{provider_id}` — FR-57 (Phase 2)
- `POST /users/{id}/report` — FR-47 (Phase 3)
- `POST /users/{id}/block` — FR-47 (Phase 3)

### 4.3 Providers (`/providers`)
- `POST /onboarding/step/{n}` — multi-step FR-6 (steps: personal, categories, documents, service_area, pricing)
- `POST /documents` — upload ID/cert; NFR-12
- `GET /me/dashboard` — stats + trust widget
- `PATCH /me/online-status` — is_online toggle
- `GET /me/reputation` — full metrics breakdown FR-68

### 4.4 Categories (`/categories`) — Admin write, all read
- `GET /categories` — tree with booking_mode
- `POST/PATCH/DELETE /categories/{id}` — FR-8
- `PATCH /categories/{id}/dynamic-fields` — FR-9
- `PATCH /categories/{id}/config` — booking_mode, commission, urgent FR-10–12

### 4.5 Services & Availability (`/services`, `/availability`)
- Provider CRUD on own services — FR-21
- `GET /services/search` — filters FR-25–27
- Provider CRUD availability blocks — FR-22
- `GET /availability/{provider_id}` — available slots for date range

### 4.6 Jobs & Offers (`/jobs`, `/offers`)
- `POST /jobs` — dynamic fields from category schema; FR-13, FR-14
- `GET /jobs/feed` — provider-matched open jobs; FR-15–16
- `POST /jobs/{id}/offers` — FR-17
- `PATCH/DELETE /offers/{id}` — edit/withdraw pending; FR-18
- `GET /jobs/{id}/offers` — side-by-side + best_match payload; FR-19–20
- `POST /jobs/{id}/offers/{offer_id}/accept` — creates booking, declines others

### 4.7 Bookings (`/bookings`)
- `POST /bookings/instant` — slot + service_id; double-book check FR-23–24
- `GET /bookings` — role-filtered list with tab statuses FR-28
- `PATCH /bookings/{id}/status` — provider transitions FR-29
- `POST /bookings/{id}/cancel` — policy check FR-30
- `POST /bookings/{id}/reschedule` — FR-31
- `POST /bookings/{id}/complete` — provider marks complete → triggers escrow panel FR-63
- `POST /bookings/{id}/accept-work` — release payment FR-63
- `POST /bookings/{id}/request-revision` — body: notes; FR-63, FR-65
- `POST /bookings/{id}/resubmit-complete` — provider after revision FR-65
- `GET /bookings/{id}/escrow-status` — countdown to auto_release_at FR-64

### 4.8 Payments (`/payments`)
- `POST /payments/checkout` — simulated pay → status held; FR-35–36
- `GET /payments/{booking_id}/invoice` — PDF or HTML receipt FR-38
- `GET /providers/me/earnings` — history FR-39
- `POST /providers/me/payout-request` — FR-39

### 4.9 Reviews (`/reviews`)
- `POST /reviews` — only if booking completed; FR-43, NFR-15
- `POST /reviews/{id}/response` — provider reply FR-44
- `GET /providers/{id}/reviews` — aggregate rating FR-45

### 4.10 Chat & Tracking (WebSocket + REST)
- `WS /ws/chat/{booking_id}` — FR-40
- `POST /chat/{booking_id}/messages` — text + photo upload fallback
- `WS /ws/tracking/{booking_id}` — provider publishes lat/lng; FR-42
- `POST /bookings/{id}/sos` — FR-48 (Phase 3)

### 4.11 AI (`/ai`)
- `POST /ai/assist` — free-text → category, cost range, duration, top 3 providers, draft description; FR-59–62
- Returns structured JSON; caches by input hash in dev
- On Claude failure → 503 with `fallback: manual_form` flag; NFR-22

### 4.12 Disputes (`/disputes`)
- `POST /disputes` — from escrow panel; attaches revision history FR-49
- Admin: `GET /disputes`, `PATCH /disputes/{id}/resolve` — refund/warn/suspend FR-52

### 4.13 Admin (`/admin`)
- Users: search, suspend, ban FR-50
- Providers: approval queue approve/reject with reason FR-7
- Bookings: list, cancel, reassign FR-51
- Reviews: moderate flagged FR-53
- Analytics: KPIs, tier distribution FR-54
- Announcements FR-55
- Config: auto_release_hours global/per-category FR-64
- Admin roles FR-56 (Phase 3 Could-Have)

### 4.14 Notifications (`/notifications`)
- `GET /notifications` — paginated FR-41
- `PATCH /notifications/{id}/read`

---

## 5. Frontend Route & Screen Map

Every screen from Project_Documentation Section 5 mapped to Next.js routes and build phase.

### 5.1 Public (Phase 0–1)
| Screen | Route | Phase |
|--------|-------|-------|
| Landing | `/` | 0 |
| Login / Sign Up | `/login`, `/register` | 0 |
| Forgot / Reset Password | `/forgot-password`, `/reset-password` | 1 |
| Help / FAQ | `/help` | 3 |
| Admin login | `/admin/login` (unlisted) | 0 |

### 5.2 Customer (Phase 1–2)
| Screen | Route | FRs |
|--------|-------|-----|
| Home | `/customer` | — |
| Category browse | `/customer/categories/[id]` | FR-25–27 |
| Provider profile | `/customer/providers/[id]` | FR-45–46, FR-66–68 |
| Post job (manual) | `/customer/jobs/new` | FR-13 |
| Post job (AI mode) | `/customer/jobs/new?mode=ai` | FR-59–62 |
| Instant book flow | `/customer/book/[serviceId]` | FR-23 |
| My jobs dashboard | `/customer/bookings` | FR-28 |
| Job details + escrow panel | `/customer/bookings/[id]` | FR-63–64, FR-42 |
| Chat | `/customer/messages` | FR-40 |
| Checkout | `/customer/checkout/[bookingId]` | FR-35 |
| Review | `/customer/bookings/[id]/review` | FR-43 |
| Profile & settings | `/customer/settings` | FR-5, FR-57 |
| Notifications | `/customer/notifications` | FR-41 |

### 5.3 Provider (Phase 1–2)
| Screen | Route | FRs |
|--------|-------|-----|
| Onboarding wizard | `/provider/onboarding` | FR-6 |
| Dashboard | `/provider` | FR-66–68 |
| Job feed | `/provider/jobs` | FR-15–16 |
| My offers | `/provider/offers` | FR-17–18 |
| My services | `/provider/services` | FR-21 |
| Availability | `/provider/availability` | FR-22 |
| Active jobs | `/provider/bookings/active` | FR-29, FR-65 |
| Job history | `/provider/bookings/history` | — |
| Earnings | `/provider/earnings` | FR-39 |
| Reviews | `/provider/reviews` | FR-44–45 |
| Profile & verification | `/provider/profile` | FR-46, FR-68 |
| Messages | `/provider/messages` | FR-40 |
| Notifications | `/provider/notifications` | FR-41 |
| Settings | `/provider/settings` | — |

### 5.4 Admin (Phase 1–3)
| Screen | Route | FRs |
|--------|-------|-----|
| Dashboard | `/admin` | FR-54 |
| Users | `/admin/users` | FR-50 |
| Provider approval | `/admin/providers` | FR-7 |
| Categories | `/admin/categories` | FR-8–12 |
| Bookings | `/admin/bookings` | FR-51 |
| Disputes | `/admin/disputes` | FR-52 |
| Reviews moderation | `/admin/reviews` | FR-53 |
| Payments & commission | `/admin/payments` | FR-37, FR-64 config |
| Analytics | `/admin/analytics` | FR-54 |
| Announcements | `/admin/announcements` | FR-55 |
| Admin roles | `/admin/roles` | FR-56 |

### 5.5 Shared UI components to build early (Phase 0–1)

- `RoleGuard`, `AuthProvider`, `ApiClient` with JWT refresh
- `CategoryGrid`, `ProviderCard`, `OfferComparisonTable`, `BestMatchBadge`
- `BookingStatusTimeline`, `DynamicFormRenderer` (reads category JSON schema — NFR-3)
- `EscrowDecisionPanel` (Phase 2), `TrustScorePanel`, `TierBadge` (Phase 2)
- `ChatWindow`, `NotificationBell`, `MapTracker` (Leaflet)
- `FileUpload`, `ImageGallery`, `RatingInput`, `FilterPanel`
- Responsive layout shell per role (NFR-2)

---

## 6. Phase-by-Phase Detailed Schedule

### Phase 0 — Foundation & Setup (Weeks 1–2)

**Goal:** Deployed skeleton with auth and role routing (Milestone M0).

#### Week 1 — Project bootstrap
- Initialize git repo, `.gitignore`, `.env.example` (DATABASE_URL, JWT_SECRET, ANTHROPIC_API_KEY, UPLOAD_DIR, CORS_ORIGINS)
- Backend: FastAPI project, SQLModel, Alembic init, health check `GET /health`
- Implement `User` model, password hashing (bcrypt — NFR-9), JWT issue/verify
- `POST /register`, `POST /login`, `GET /me` with role enum
- RBAC dependency: `require_role("customer"|"provider"|"admin")`
- Frontend: Next.js 14 App Router, TypeScript, **Tailwind CSS + shadcn/ui**, ESLint/Prettier
- Pages: landing (static), login, register with role toggle (Section 5.1.2)
- `AuthContext` + protected route middleware
- Language constants file scaffolded (Arabic + English strings, no RTL)
- Write [`docs/business-rules.md`](/Users/osama/Desktop/Hiring & Renting Platform/docs/business-rules.md) with defaults from Section 2
- **Deliverable:** Local register/login works for both roles

#### Week 2 — Shell UI + local run
- Role-based dashboard shells (empty states) for customer, provider, admin
- Admin login at unlisted `/admin/login` (FR-4)
- Password reset flow (simulated — log code to console in dev); FR-3
- Terms/Privacy checkbox on signup; NFR-20
- File upload utility stub (validation rules — NFR-12)
- Run backend + frontend locally; document env vars in README and `.env.example`
- **Exit criteria M0:** Local URL, register → login → role dashboard

---

### Phase 1 — Core Marketplace Loop / Must-Have (Weeks 3–8)

**Goal:** Full MVP — both booking models, payments, reviews, admin core (Milestone M1).

#### Week 3 — Categories, provider onboarding, admin approval

**Backend**
- Models: `Category`, `ProviderProfile`, `ProviderCategory`, `Document`
- Admin category CRUD with nested subcategories (FR-8)
- Dynamic fields schema stored as JSON Schema-like structure: `{ fields: [{ name, type, label, required, options? }] }` (FR-9)
- Per-category: `booking_mode`, `commission_rate`, `urgent_enabled` (FR-10; FR-11 flat rate only in Week 3)
- Provider onboarding 5-step API (FR-6)
- Document upload to local filesystem (FR-6)
- Admin approve/reject with reason (FR-7)

**Frontend**
- Admin: Category management UI with dynamic field builder (drag/add field types: text, number, select, photo)
- Provider onboarding wizard (Section 5.3.1)
- Admin provider approval queue (Section 5.4.3)

**Tests:** Category CRUD, onboarding step validation

#### Week 3–4 — Instant Book flow

**Backend**
- Models: `Service`, `Availability`
- Provider service package CRUD (FR-21)
- Availability calendar: working hours template + blocked dates (FR-22)
- Slot generation algorithm: divide availability windows by `duration_minutes`, exclude existing confirmed bookings (FR-23–24)
- `POST /bookings/instant` — atomic transaction: check slot free → insert booking status `confirmed` (NFR-8)

**Frontend**
- Provider: My Services CRUD (Section 5.3.5)
- Provider: Availability calendar component
- Customer: Browse services in category, select slot, confirm address (Section 5.2.5)
- Double-booking UX: refresh slots on conflict

**Internal checkpoint:** Provider can list a service; customer can select a slot (payment not yet wired)

#### Week 4–5 — Booking lifecycle + simulated payments

**Backend**
- Extend `Booking` status machine:

```mermaid
stateDiagram-v2
  [*] --> pending
  pending --> confirmed
  confirmed --> en_route
  en_route --> in_progress
  in_progress --> completed
  confirmed --> cancelled
  en_route --> cancelled
  in_progress --> cancelled
  completed --> [*]
```

- Provider status update endpoints with valid transition guards (FR-29, NFR-8)
- Cancellation policy service (FR-30) — apply fee rules from business-rules.md
- Reschedule request endpoint (FR-31) — provider must re-confirm
- `Payment` model: on checkout → `held`, compute commission (FR-35–37)
- Invoice generation: HTML template → optional WeasyPrint PDF (FR-38)
- Audit log for payment actions (NFR-13)

**Frontend**
- Customer/provider active job views with status timeline (Section 5.2.6–5.2.7)
- Checkout page with price breakdown (Section 5.2.9)
- Provider earnings stub page

**Internal checkpoint:** Instant Book path complete except review

#### Week 5 — Reviews + notifications

**Backend**
- `Review` model; enforce completed booking only (NFR-15)
- Recalculate `provider_profiles.average_rating` on review create (FR-45)
- `Notification` model + service: emit on booking confirmed, status change, offer received, review received (FR-41)
- Notification types enum documented

**Frontend**
- Review submission form — Phase 1: single overall star + text (FR-43 simplified per MoSCoW 8.1)
- Notification bell + panel (Section 5.2.12)

**Milestone: First full Instant Book transaction** — browse → book → pay → complete → review → notification

#### Week 5–6.5 — Custom Quote (bidding) flow

**Backend**
- `JobRequest`, `Offer` models
- Job posting with dynamic form renderer data (FR-13, NFR-3)
- Urgent flag with fixed +25% surcharge stored on job (FR-14, FR-32 simplified)
- Provider job feed: filter by category match, service radius (Haversine — FR-26), urgency, budget, distance (FR-15–16)
- Offer CRUD: submit, edit, withdraw pending (FR-17–18)
- Accept offer → create booking, set other offers to `declined`, close job (FR-19)
- Offer expiry background check (optional cron in Phase 1 or Week 12)

**Frontend**
- Post a Job page — manual path (Section 5.2.4 standard path)
- Provider job feed with filters (Section 5.3.3)
- Submit offer form
- Customer: Pending Offers tab with side-by-side cards (Section 5.2.6)

#### Week 6.5–7 — Search, best-match scoring, urgent broadcast

**Backend**
- `GET /services/search` and provider search with filters (FR-25–27)
- Best-match scoring service (FR-20):

```
score = w_price * norm_price + w_distance * norm_distance + w_rating * norm_rating + w_eta * norm_eta
```

- Return `best_match_offer_id` + human-readable `reasoning` string
- Urgent broadcast: sort matching online providers first (FR-34)

**Frontend**
- Category browse filter panel (Section 5.2.2)
- "AI Best Match" badge on offer cards (deterministic formula, not Claude — distinct from Smart Assistant)
- Urgent toggle on job post with premium display (FR-32)

#### Week 7–8 — Admin core + integration hardening

**Backend**
- Admin user search, suspend, ban (FR-50)
- Admin booking list, force cancel (FR-51)
- End-to-end error handling middleware (NFR-7)
- OpenAPI tags and descriptions (NFR-17)

**Frontend**
- Admin user management, booking management (Sections 5.4.2, 5.4.5)
- Provider profile public page (Section 5.2.3) — rating only in Phase 1

**Phase 1 exit criteria (M1):**
- Customer completes Instant Book AND Custom Quote paths
- Simulated escrow payment + commission + invoice
- Admin approves provider, manages bookings
- All Must-Have FRs from Section 8.1 verified via manual test script

---

### Phase 2 — Should-Have / Signature Features (Weeks 9–11)

**Goal:** Three differentiators + remaining Should-Haves (Milestone M2).  
**Order per Project_Documentation Section 12.3 — do not reorder.**

#### Week 9 — AI Smart Assistant (FR-59–62) + start Escrow

**AI Smart Assistant — Backend (`app/ai/`)**
- **Google Gemini API** client wrapper (replaces Anthropic Claude) with timeout, retry, response caching (key = hash of input)
- System prompt includes: platform category taxonomy (fetched from DB), output JSON schema:

```json
{
  "category_slug": "plumbing",
  "cost_min": 100, "cost_max": 300,
  "duration_minutes": 120,
  "structured_description": "...",
  "confidence": 0.85
}
```

- Map `category_slug` → `category_id`; if no match → return top-level suggestions for user edit
- Query top 3 providers: same category, within radius, sort by rating × trust_score (trust_score defaults to rating until Week 10)
- `POST /ai/assist` orchestrates all of the above (FR-59–62)
- Fallback: on API error return 503 + `{ fallback: "manual" }` (NFR-22)
- Store `ai_generated`, estimates on `JobRequest` when posted from AI flow

**AI Smart Assistant — Frontend**
- "Describe your problem" entry on customer home (Section 5.2.1)
- AI result screen: editable category dropdown, cost/duration display, top 3 provider cards, editable description textarea (Section 5.2.4)
- "AI-matched" badge on provider job feed (Section 5.3.3)
- Never auto-submit — explicit "Post Job" or "Book Provider" confirmation

**Escrow enhancements — start**
- Add `revision_requested` booking status, `revision_notes`, `revision_count`
- On provider `complete` → set `payment.auto_release_at = now + config hours`
- Customer escrow decision panel UI shell (Section 5.2.7)

#### Week 10 — Escrow revision/auto-release (FR-63–65) + Reputation Score (FR-66–68)

**Escrow — Backend**
- `POST accept-work` → payment `released`, set `released_at`
- `POST request-revision` → status `revision_requested`, store notes, pause auto-release timer
- `POST resubmit-complete` → back to `completed`, increment `revision_count`, reset `auto_release_at` (FR-65)
- `POST open-dispute` → create dispute, hold payment (integrate with Week 11)
- Scheduler (`app/tasks/auto_release.py`): poll every 5 min (or `arq` worker):

```python
# Pseudocode
payments = db.query(Payment).filter(status=="held", auto_release_at <= now())
for p in payments:
    if booking.status == "completed" and not open_dispute:
        p.status = "auto_released"
        notify(customer, provider)
```

- Admin config endpoint for auto_release hours (Section 5.4.8)

**Escrow — Frontend**
- Full escrow panel: Accept / Request Revision / Open Dispute + countdown timer (FR-63–64)
- Provider "Revision Requested" state on active jobs (Section 5.3.6)
- Earnings line items: released vs auto_released (Section 5.3.8)

**Reputation — Backend (`app/services/reputation.py`)**
- Incremental metric updates on events (NFR-23):
  - On booking `en_route` vs `scheduled_datetime` → on-time tracking
  - On offer/message created → response time rolling average
  - On booking `completed` → completion_rate, completed_jobs_count
  - On cancel → cancellation_rate
  - On review → fold into trust formula
- Trust Score formula (document in business-rules.md):

```
trust = w1*norm_rating + w2*on_time_rate + w3*completion_rate + w4*norm_response + w5*(1-cancellation_rate)
```

- Tier assignment from thresholds (FR-68)
- Hook: call `reputation.update(provider_id)` after booking complete + review

**Reputation — Frontend**
- Trust Score panel on provider profile (Section 5.2.3)
- Tier badge on provider cards (Section 5.2.2)
- Provider dashboard widget + progress to next tier (Section 5.3.2)
- Provider reputation detail page (Section 5.3.10)

**Tests (critical):** auto-release timer with 1-minute test config; revision loop resets timer; trust score incremental update

#### Week 11 — Remaining Should-Haves

**Priority A — Tiered commission + Urgent negotiation (FR-11, FR-32–33 upgrade)**
- Commission tiers JSON on category: `[{ min, max, rate }]`
- Urgent: customer proposes premium → provider accept/decline/counter API

**Priority B — In-app chat + live location (FR-40, FR-42)**
- WebSocket connection manager (in-memory — no Redis)
- Message persistence, photo attachments
- Provider publishes location while `en_route`; customer map via Leaflet

**Priority C — Verification + Disputes (FR-46, FR-49, FR-52)**
- Verified badge when `verification_status == approved`
- Dispute model with evidence uploads; pre-populate revision history for admin (Section 5.4.6)
- Admin resolve: refund / warn / suspend / reject

**Priority D — Multi-criteria reviews (FR-44) + Favorites (FR-57)**
- Upgrade review form: criteria_ratings JSON (quality, punctuality, communication)
- Provider public review response
- Customer favorites list in settings

**Phase 2 exit criteria (M2):**
- Demo script: AI assist → post job → offers → book → complete → revision → accept OR auto-release
- Provider tier visible and changes after seeded completed jobs
- Re-run Phase 1 exit criteria — no regressions

**Compression rule:** If Week 11 is tight, defer Priority D and partial Priority B (chat without photos) to Phase 3 — never cut AI, Escrow, or Reputation.

---

### Phase 3 — Testing, Polish & Optional (Weeks 12–13)

**Goal:** Stable, demo-ready with seed data (Milestone M3).

#### Week 12 — Testing & edge cases
- Finalize all business rule values in `docs/business-rules.md`
- **Unit tests (pytest):**
  - Booking state transition guards (all invalid transitions rejected)
  - Commission calculation (flat + tiered)
  - Best-match scoring (deterministic fixtures)
  - Trust score formula + tier boundaries
  - Auto-release scheduler (mock datetime)
  - Haversine distance accuracy
- **Manual E2E test matrix:**

| Scenario | Expected |
|----------|----------|
| No offers on job | Job stays open, customer notified at expiry |
| Double-book attempt | 409 Conflict |
| Cancel inside free window | Full refund simulation |
| Cancel late | Fee deducted |
| AI API down | Manual form fallback |
| Customer no action after complete | Auto-release fires |
| Revision loop 2× | Timer resets each time |
| Dispute during escrow hold | Payment stays held |
| Provider below min rating | Flagged in admin |

- Performance spot-check: search < 2s, page load < 3s on demo data (NFR-5, NFR-6)
- Graceful error pages (NFR-7)

#### Week 13 — Seed data + Could-Have (if time)
- Run seed script; verify demo flows without live data entry
- **Could-Have (pick by priority):**
  - FR-47 Report/block user
  - FR-48 SOS button (logs + notifies admin)
  - FR-53 Review moderation queue
  - FR-54 Admin analytics charts (Chart.js/Recharts)
  - FR-55 Announcements
  - FR-56 Multi-admin scoped permissions
- UI polish: loading skeletons, empty states, mobile responsive pass (NFR-2)
- Browser compatibility check: Chrome, Firefox, Safari, Edge (NFR-19)

---

### Phase 4 — Deployment & Documentation (Weeks 14–15)

**Goal:** Production deployment + written report (Milestone M4).

#### Week 14 — Local production-ready build
- Finalize all env vars; document in `.env.example` and README
- Run migrations + seed locally (or separate seed command)
- File upload directory persisted locally
- Scheduler running as background thread
- Full user journey smoke test on local environment
- Security checklist: CORS locked, JWT secret rotated, input validation audit (NFR-11)
- **Note:** Cloud deployment is out of scope for this build cycle; deployment is local only.

#### Week 14–15 — Report & documentation
Report sections to produce (map to department template if required — Section 13.2):
1. Introduction & problem statement
2. Requirements traceability matrix (all FR/NFR → implementation reference)
3. System architecture diagram (Section 1.3)
4. ERD (from Section 10)
5. API documentation (link to `/docs` OpenAPI)
6. Key algorithms: best-match weights, trust score formula, commission tiers
7. AI Smart Assistant: prompt design, fallback strategy
8. Escrow flow diagram (Section 11.1 steps 6–8)
9. Testing summary (Week 12 results)
10. Deployment guide (README)
11. Related work / competitor comparison
12. Conclusion, limitations, future work (Section 13.3)

Parallel deliverables:
- README: local setup, env vars, seed command, demo accounts
- Demo script document (step-by-step for defense)

---

### Phase 5 — Buffer & Defense Prep (Week 16)

**Goal:** Defense-ready (Milestone M5).

- 3 days buffer for any Phase 1–4 slippage
- Record backup demo video (full happy path + AI + escrow + reputation)
- Rehearse live demo twice with scripted personas:
  - Customer "Sara" — AI assist → custom quote → escrow revision → accept
  - Provider "Ahmed" — onboarding → offer → complete → tier upgrade
  - Admin — approve provider, resolve dispute
- Prepare slides: architecture, differentiators, live demo, Q&A appendix (formula weights, legal acknowledgment NFR-21)
- Prepare answers for committee questions on trust score transparency, escrow legal rationale, AI error handling

---

## 7. Cross-Cutting Concerns (apply throughout)

### 7.1 Security (NFR-9–13)
- bcrypt password hashing; never log passwords
- JWT in httpOnly cookie or Authorization header (pick one, document in README)
- Server-side validation on all inputs; Pydantic schemas + extra sanitization for text fields
- File type verification via magic bytes, not just extension
- Rate limit `/auth/login` and `/ai/assist` (simple in-memory counter)
- Audit log table: payment release, admin suspend, document approval

### 7.2 Real-time (FR-40–42)
- Single WebSocket manager class; rooms keyed by `booking_id`
- Reconnect handling on frontend
- Authorization: only booking customer/provider may join room

### 7.3 Error handling (NFR-7–8)
- Global exception handlers returning `{ error, code, detail }`
- DB transactions for multi-step operations (accept offer, checkout, status change)
- Optimistic UI disabled for payment and booking confirmation

### 7.4 Performance (NFR-5–6, NFR-18)
- Pagination on all list endpoints (default limit 20)
- Eager loading for offer comparison queries
- Trust score read from `provider_profiles` column, never recalculated on GET (NFR-23)

### 7.5 Maintainability (NFR-16–17)
- One router + service + schema file per domain
- No business logic in route handlers — services only
- FastAPI auto-docs kept accurate with response models

---

## 8. Requirements Traceability Summary

| Phase | FR Coverage |
|-------|-------------|
| Phase 0 | FR-1–4 (partial 3) |
| Phase 1 | FR-5–8, 10, 13–15, 17–29, 31–32 (fixed), 34–38, 41, 43 (simple), 45, 50–51 |
| Phase 2 | FR-9, 11–12, 16, 30, 33, 39–40, 42, 44, 46–49, 52, 57, 59–68 |
| Phase 3 | FR-47–48, 53–56 (Could-Have) |
| Won't Have | FR-58, real payments, push/SMS, native apps, full i18n |

| Phase | NFR Coverage |
|-------|-------------|
| All | NFR-1–3, 5–13, 15–19, 22–23 |
| Phase 3 | NFR-4 (partial if time), NFR-20–21 (docs) |

---

## 9. Environment Variables

```
# Database — PostgreSQL only
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/hiring_renting

# Auth
JWT_SECRET=
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

# AI — Google Gemini (replaces Anthropic Claude)
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.0-flash

# File storage
UPLOAD_DIR=./uploads
MAX_UPLOAD_SIZE_MB=10

# CORS
CORS_ORIGINS=http://localhost:3000

# Business rules
AUTO_RELEASE_HOURS=72
BEST_MATCH_WEIGHTS=0.4,0.3,0.2,0.1
TRUST_SCORE_WEIGHTS=0.3,0.25,0.2,0.15,0.1
TIER_THRESHOLDS=50,70,85
COMMISSION_TIERS=0:500:0.20,501:2000:0.15,2001:999999:0.10
SCHEDULER_POLL_SECONDS=300

# Environment
ENV=development
```

---

## 10. Defense Demo Script (15 minutes)

1. **Landing** — show category grid, trust strip (1 min)
2. **AI Smart Assistant** — "My kitchen sink is leaking" → category, estimate, top 3, edit description → post job (3 min)
3. **Provider** — receive AI-matched job notification → submit offer (1 min)
4. **Customer** — compare offers, highlight best match reasoning → accept → checkout (2 min)
5. **Live job** — provider en route (map) → in progress → complete (2 min)
6. **Escrow** — customer requests revision → provider resubmits → customer accepts (2 min)
7. **Reputation** — show provider tier + metrics on profile (1 min)
8. **Admin** — quick dashboard, provider approval, dispute queue (2 min)
9. **Architecture Q&A backup slide** — modular monolith, escrow timer, incremental trust score (1 min)

---

## 11. Risk Register (expanded)

| Risk | Impact | Mitigation | Trigger to act |
|------|--------|------------|------------------|
| Phase 1 slips past Week 8 | No time for signature features | Cut urgent negotiation, defer chat to Phase 3 | Week 7 mid-week review |
| Claude API costs | Budget | Cache, mock mode env flag | Daily spend > threshold |
| Auto-release bug | Wrong payout | Unit tests + 1-min timer in staging | Any failed test |
| WebSocket complexity | Delays Phase 2 | REST polling fallback for location | Week 11 day 2 |
| File storage on free hosting | Uploads lost on redeploy | Railway volume or document in report as limitation | First deploy |
| Scope creep | Miss defense date | MoSCoW gate at start of each week | Any "quick add" request |

---

## 12. Definition of Done (per feature)

- [ ] Backend endpoint(s) with Pydantic validation and RBAC
- [ ] Service layer unit tests for business logic
- [ ] SQLModel model + Alembic migration
- [ ] Frontend page/component wired to API
- [ ] Notification emitted for user-visible events
- [ ] Manual test step added to E2E matrix
- [ ] OpenAPI docs updated
- [ ] FR ID(s) noted in PR/commit message

---

## 13. Deliverable Artifacts Checklist

| Artifact | Target Week |
|----------|-------------|
| Live deployed skeleton | 2 |
| business-rules.md | 1 |
| Full MVP | 8 |
| AI + Escrow + Reputation | 10 |
| pytest suite | 12 |
| Seed/demo data script | 13 |
| Final production deploy | 14 |
| Graduation report | 15 |
| Demo video + slides | 16 |
