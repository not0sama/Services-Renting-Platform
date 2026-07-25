# 📊 Development Tracker — Multi-Service Hiring & Renting Platform

> **Rule:** This file must be updated after **every** change an agent makes to the codebase. No exceptions.
>
> - Mark tasks `[/]` when work begins, `[x]` when fully done.
> - Add the date of completion next to each finished item.
> - Record every new file created or modified under the relevant phase.

---

## 🗓️ Last Updated
**Date:** 2026-07-26
**Current Phase:** Phase 1 (Core Marketplace)
**Overall Progress:** 10% — Phase 0 Complete

---

## ✅ Confirmed Tech Stack (locked before build)

| Layer | Choice |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS + shadcn/ui |
| Backend | FastAPI (Python), modular monolith |
| ORM | SQLModel |
| Database | PostgreSQL only |
| AI | Google Gemini API (`gemini-2.0-flash`) |
| Maps | Leaflet.js + OpenStreetMap |
| Real-time | FastAPI native WebSockets |
| File storage | Local filesystem |
| Payments | Simulated (no real gateway) |
| Languages | Arabic + English (no RTL for now) |
| Deployment | Local only |

---

## 📋 Phase Progress Overview

| Phase | Weeks | Status | % Done |
|---|---|---|---|
| Phase 0 — Foundation & Setup | 1–2 | 🟢 Complete | 100% |
| Phase 1 — Core Marketplace (Must-Have) | 3–8 | 🔴 Not Started | 0% |
| Phase 2 — Signature Features (Should-Have) | 9–11 | 🔴 Not Started | 0% |
| Phase 3 — Testing & Polish | 12–13 | 🔴 Not Started | 0% |
| Phase 4 — Documentation | 14–15 | 🔴 Not Started | 0% |
| Phase 5 — Defense Prep | 16 | 🔴 Not Started | 0% |

**Status Legend:** 🔴 Not Started · 🟡 In Progress · 🟢 Complete

---

## 🏗️ Phase 0 — Foundation & Setup (Weeks 1–2)

**Goal:** Deployed skeleton with auth and role routing.
**Exit Criteria (M0):** Local URL accessible, register → login → role dashboard works for all 3 roles.

### Repo & Project Structure
- [x] Initialize monorepo (`backend/` + `frontend/` + `docs/`)
- [x] `.gitignore` configured
- [x] `.env.example` created with all required variables
- [x] `README.md` with local setup instructions

### Backend — FastAPI Setup
- [x] FastAPI project initialized (`backend/app/main.py`)
- [x] SQLModel + Alembic configured
- [x] PostgreSQL connection established
- [x] Health check endpoint `GET /health`
- [x] `core/config.py` — env var loading
- [x] `core/security.py` — bcrypt hashing, JWT issue/verify
- [x] `core/deps.py` — RBAC dependency (`require_role`)

### Backend — Auth Module
- [x] `User` model + Alembic migration #1
- [x] `POST /api/v1/auth/register` (customer / provider)
- [x] `POST /api/v1/auth/login` → access + refresh JWT
- [x] `POST /api/v1/auth/logout`
- [x] `GET /api/v1/auth/me`
- [x] Password reset flow (simulated — log code to console)
  - [x] `POST /api/v1/auth/forgot-password`
  - [x] `POST /api/v1/auth/reset-password`

### Backend — Database Migrations
- [x] Migration 1: `users` table
- [x] Migration 2: `addresses` table

### Frontend — Next.js Setup
- [x] Next.js 14 App Router initialized
- [x] Tailwind CSS configured
- [x] shadcn/ui installed and configured
- [x] ESLint + Prettier configured
- [x] TypeScript path aliases configured
- [x] `lib/api.ts` — API client with JWT refresh logic
- [x] `lib/auth.ts` — token storage helpers
- [x] `hooks/useAuth.ts` — auth context hook
- [x] `context/AuthContext.tsx` — auth provider
- [x] Middleware for protected routes (role guard)

### Frontend — Language Constants
- [x] `lib/i18n/strings.en.ts` — English UI strings
- [x] `lib/i18n/strings.ar.ts` — Arabic UI strings
- [x] `lib/i18n/index.ts` — language switcher utility

### Frontend — Public Pages
- [x] Landing page (`/`) — hero, category grid, how-it-works, trust strip
- [x] Login page (`/login`) — role toggle, form, validation
- [x] Register page (`/register`) — role toggle, full form, ToS checkbox
- [x] Forgot password page (`/forgot-password`)
- [x] Reset password page (`/reset-password`)
- [x] Admin login page (`/admin/login`) — unlisted route

### Frontend — Role Dashboard Shells (empty states)
- [x] Customer dashboard shell (`/customer`)
- [x] Provider dashboard shell (`/provider`)
- [x] Admin dashboard shell (`/admin`)

### Documentation
- [x] `docs/business-rules.md` created with all default values

---

## 🛒 Phase 1 — Core Marketplace Loop / Must-Have (Weeks 3–8)

**Goal:** Full MVP — both booking models, payments, reviews, admin core.
**Exit Criteria (M1):** Customer completes Instant Book AND Custom Quote paths end-to-end.

### Week 3 — Categories, Provider Onboarding, Admin Approval

#### Backend
- [ ] `Category` model + migration
- [ ] `ProviderProfile` model + migration
- [ ] `ProviderCategory` join table + migration
- [ ] `Document` model + migration
- [ ] Admin category CRUD (FR-8)
- [ ] Dynamic fields schema (JSON) per category (FR-9)
- [ ] Per-category config: `booking_mode`, `commission_rate`, `urgent_enabled` (FR-10–12)
- [ ] Provider onboarding 5-step API (FR-6)
- [ ] Document upload endpoint (local filesystem)
- [ ] Admin approve/reject provider with reason (FR-7)

#### Frontend
- [ ] Admin: Category management UI with dynamic field builder
- [ ] Provider: Onboarding wizard (5 steps)
- [ ] Admin: Provider approval queue

### Week 3–4 — Instant Book Flow

#### Backend
- [ ] `Service` model + migration
- [ ] `Availability` model + migration
- [ ] Provider service package CRUD (FR-21)
- [ ] Availability calendar — working hours + blocked dates (FR-22)
- [ ] Slot generation algorithm
- [ ] `POST /api/v1/bookings/instant` — atomic booking creation (FR-23–24)

#### Frontend
- [ ] Provider: My Services CRUD page
- [ ] Provider: Availability calendar component
- [ ] Customer: Browse services, select slot, confirm address (FR-23)

### Week 4–5 — Booking Lifecycle + Payments

#### Backend
- [ ] `Booking` model + migration (full status machine)
- [ ] `Payment` model + migration
- [ ] Provider status update endpoints (FR-29)
- [ ] Cancellation policy service (FR-30)
- [ ] Reschedule request endpoint (FR-31)
- [ ] Payment checkout → `held` + commission calculation (FR-35–37)
- [ ] Invoice generation — HTML template (FR-38)
- [ ] Audit log for payment actions (NFR-13)

#### Frontend
- [ ] Customer: Active job view with status timeline
- [ ] Provider: Active job view with status controls
- [ ] Checkout page with price breakdown
- [ ] Provider: Earnings stub page

### Week 5 — Reviews + Notifications

#### Backend
- [ ] `Review` model + migration (completed-booking-only guard)
- [ ] Recalculate `average_rating` on review create (FR-45)
- [ ] `Notification` model + service (FR-41)
- [ ] Notification types enum

#### Frontend
- [ ] Review submission form (single star + text — Phase 1 simplified)
- [ ] Notification bell + panel

### Week 5–6.5 — Custom Quote / Bidding Flow

#### Backend
- [ ] `JobRequest` model + migration
- [ ] `Offer` model + migration
- [ ] Job posting with dynamic form data (FR-13–14)
- [ ] Provider job feed with filters (FR-15–16)
- [ ] Offer CRUD: submit, edit, withdraw (FR-17–18)
- [ ] Accept offer → create booking, decline others (FR-19)

#### Frontend
- [ ] Customer: Post a Job page (manual path)
- [ ] Provider: Job feed with filters
- [ ] Provider: Submit offer form
- [ ] Customer: Pending Offers tab with side-by-side cards

### Week 6.5–7 — Search, Best-Match, Urgent Broadcast

#### Backend
- [ ] `GET /api/v1/services/search` with filters (FR-25–27)
- [ ] Best-match scoring service (weighted formula) (FR-20)
- [ ] Urgent broadcast — sort online providers first (FR-34)

#### Frontend
- [ ] Category browse page with filter panel
- [ ] "AI Best Match" badge on offer cards
- [ ] Urgent toggle on job post page

### Week 7–8 — Admin Core + Hardening

#### Backend
- [ ] Admin: user search, suspend, ban (FR-50)
- [ ] Admin: booking list, force cancel (FR-51)
- [ ] Global error handling middleware (NFR-7)
- [ ] OpenAPI tags and descriptions complete (NFR-17)

#### Frontend
- [ ] Admin: User management page
- [ ] Admin: Booking management page
- [ ] Provider: Public profile page (rating only — Phase 1)

---

## ⭐ Phase 2 — Signature Features / Should-Have (Weeks 9–11)

**Goal:** Three differentiators + remaining Should-Haves.
**Exit Criteria (M2):** Full demo script works — AI → job → offers → book → complete → revision → accept/auto-release.

### Week 9 — AI Smart Assistant (FR-59–62)

#### Backend
- [ ] `app/ai/gemini_client.py` — Gemini API wrapper (timeout, retry, caching)
- [ ] System prompt with category taxonomy + JSON schema output
- [ ] Category slug → ID mapper
- [ ] Top-3 provider query (category + radius + rating × trust_score)
- [ ] `POST /api/v1/ai/assist` endpoint (FR-59–62)
- [ ] Fallback: 503 + `{ fallback: "manual" }` on API error (NFR-22)
- [ ] Store `ai_generated`, `estimated_cost_*`, `estimated_duration_minutes` on `JobRequest`

#### Frontend
- [ ] Customer: "Describe your problem" entry on home page
- [ ] AI result screen (editable category, cost/duration, top-3 providers, editable description)
- [ ] "AI-matched" badge on provider job feed
- [ ] Post Job — AI mode route (`/customer/jobs/new?mode=ai`)

### Week 9 (continued) — Escrow Enhancements Start

#### Backend
- [ ] Add `revision_requested` to `Booking` status enum
- [ ] Add `revision_notes`, `revision_count` to `Booking` model
- [ ] On provider `complete` → set `payment.auto_release_at`

#### Frontend
- [ ] Escrow decision panel UI shell (Section 5.2.7)

### Week 10 — Escrow Revision/Auto-Release (FR-63–65) + Reputation (FR-66–68)

#### Backend — Escrow
- [ ] `POST /bookings/{id}/accept-work` → release payment (FR-63)
- [ ] `POST /bookings/{id}/request-revision` → `revision_requested` status + pause timer
- [ ] `POST /bookings/{id}/resubmit-complete` → reset `auto_release_at` (FR-65)
- [ ] `POST /bookings/{id}/open-dispute` → create dispute, hold payment
- [ ] `GET /bookings/{id}/escrow-status` → countdown to auto_release_at (FR-64)
- [ ] Scheduler (`app/tasks/auto_release.py`) — poll every 5 min, auto-release on timeout
- [ ] Admin config for `auto_release_hours` (global + per-category)

#### Frontend — Escrow
- [ ] Full escrow panel: Accept / Revision / Dispute + countdown timer
- [ ] Provider: "Revision Requested" state on active jobs
- [ ] Earnings: released vs auto_released line items

#### Backend — Reputation
- [ ] `app/services/reputation.py` — incremental metric update function
- [ ] On-time tracking, response time, completion rate, cancellation rate
- [ ] Trust Score formula + tier assignment (FR-67–68)
- [ ] Hook: `reputation.update(provider_id)` after booking complete + review

#### Frontend — Reputation
- [ ] Trust Score panel on provider profile
- [ ] Tier badge on provider cards
- [ ] Provider dashboard: Trust Score widget + next-tier progress
- [ ] Provider: Reputation detail page

### Week 11 — Remaining Should-Haves

#### Tiered Commission + Urgent Negotiation
- [ ] Commission tiers JSON on category (FR-11)
- [ ] Urgent: customer proposes premium → provider accept/decline/counter (FR-32–33)

#### In-App Chat + Live Location (FR-40, FR-42)
- [ ] WebSocket connection manager
- [ ] Message model + persistence
- [ ] Photo attachment in chat
- [ ] Provider publishes location while `en_route`
- [ ] Customer: live map via Leaflet

#### Verification + Disputes (FR-46, FR-49, FR-52)
- [ ] "Verified" badge
- [ ] `Dispute` model + evidence uploads
- [ ] Admin: dispute resolution

#### Multi-Criteria Reviews + Favorites (FR-44, FR-57)
- [ ] Upgrade review form: `criteria_ratings` JSON
- [ ] Provider public review response
- [ ] Customer: favorites list

---

## 🧪 Phase 3 — Testing & Polish (Weeks 12–13)

### Unit Tests (pytest)
- [ ] Booking state transition guards
- [ ] Commission calculation (flat + tiered)
- [ ] Best-match scoring
- [ ] Trust score formula + tier boundaries
- [ ] Auto-release scheduler (mock datetime)
- [ ] Haversine distance accuracy

### E2E Manual Test Matrix
- [ ] No offers on job → job stays open
- [ ] Double-book attempt → 409 Conflict
- [ ] Cancel inside free window → full refund
- [ ] Cancel late → fee deducted
- [ ] AI API down → manual form fallback
- [ ] Customer no action after complete → auto-release fires
- [ ] Revision loop 2× → timer resets each time
- [ ] Dispute during escrow hold → payment stays held
- [ ] Provider below min rating → admin flagged

### Seed Data
- [ ] 15–20 categories (nested hierarchy)
- [ ] 10 provider accounts (mixed states/tiers)
- [ ] 5 customer accounts + 1 admin account
- [ ] 20+ completed bookings with reviews
- [ ] 5 open job requests with offers

### Could-Have Features (time permitting)
- [ ] FR-47 — Report/block user
- [ ] FR-48 — SOS button
- [ ] FR-53 — Review moderation queue
- [ ] FR-54 — Admin analytics charts
- [ ] FR-55 — Announcements
- [ ] FR-56 — Multi-admin scoped permissions

### Polish
- [ ] Loading skeletons on all data-heavy pages
- [ ] Empty states on all list views
- [ ] Mobile responsive pass (NFR-2)
- [ ] Browser compat: Chrome, Firefox, Safari, Edge (NFR-19)

---

## 📄 Phase 4 — Documentation (Weeks 14–15)

- [ ] Final env vars + `.env.example`
- [ ] Full smoke test — local, all happy paths
- [ ] Security audit: CORS, JWT secret, input validation
- [ ] `README.md` — complete setup guide
- [ ] Graduation report (all sections)
- [ ] Demo script document
- [ ] API documentation reviewed

---

## 🎬 Phase 5 — Defense Prep (Week 16)

- [ ] Record backup demo video
- [ ] Rehearse live demo twice (Sara / Ahmed / Admin personas)
- [ ] Slides: architecture, differentiators, Q&A appendix

---

## 📁 Files Created / Modified

> Updated after every agent action.

| Date | File | Action | Notes |
|---|---|---|---|
| 2026-07-26 | `Docs/comprehensive_dev_plan_04072582.plan.md` | Modified | Updated tech stack: Gemini API, PostgreSQL, Tailwind+shadcn/ui, Arabic+English (no RTL), local deployment |
| 2026-07-26 | `Docs/DEVELOPMENT_TRACKER.md` | Created | This living tracker file |
| 2026-07-26 | `backend/requirements.txt`, `backend/.env.example` | Created | Backend dependencies and environment variables |
| 2026-07-26 | `backend/app/core/*`, `backend/app/db/*`, `backend/app/models/user.py`, `backend/app/schemas/auth.py`, `backend/app/routers/auth.py`, `backend/app/services/auth_service.py`, `backend/app/main.py` | Created | Full FastAPI backend auth module with JWT, RBAC, DB connection, and models |
| 2026-07-26 | `backend/alembic/env.py`, `backend/alembic.ini` | Configured | Async Alembic environment with SQLModel auto-detect |
| 2026-07-26 | `frontend/src/lib/*`, `frontend/src/context/AuthContext.tsx`, `frontend/src/proxy.ts` | Created | Frontend Auth integration, API Axios client, i18n string constants, Next.js routing protection proxy |
| 2026-07-26 | `frontend/src/app/page.tsx`, `frontend/src/app/login/page.tsx`, `frontend/src/app/register/page.tsx`, `frontend/src/app/forgot-password/page.tsx`, `frontend/src/app/reset-password/page.tsx`, `frontend/src/app/admin/login/page.tsx` | Created | Full suite of public and auth pages with responsive design |
| 2026-07-26 | `frontend/src/app/(customer\|provider\|admin)/page.tsx` | Created | Role-based dashboard shells with unified design system |
| 2026-07-26 | `docs/business-rules.md`, `README.md`, `.gitignore` | Created | Central business rules and repo documentation |

---

## 🐛 Known Issues / Blockers

| Date | Issue | Status | Resolution |
|---|---|---|---|
| — | No issues yet | — | — |

---

## 📝 Decision Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-07-26 | Google Gemini API instead of Anthropic Claude | Developer preference and API key availability |
| 2026-07-26 | PostgreSQL only (no SQLite fallback) | Production-ready from day one |
| 2026-07-26 | Tailwind CSS + shadcn/ui | Premium UI components faster than hand-rolled |
| 2026-07-26 | Arabic + English; RTL layout deferred | Resolves NFR-4 vs MoSCoW Section 8.4 conflict pragmatically |
| 2026-07-26 | Local deployment only (no Render/Railway) | Out of scope for this build cycle |
