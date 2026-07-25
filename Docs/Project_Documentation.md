# Multi-Service Hiring & Renting Platform — Full Project Documentation

Graduation Project — Consolidated Reference (Markdown)

---

## Table of Contents

1. [Introduction & Project Overview](#1-introduction--project-overview)
2. [Scope, Business Model & Key Decisions](#2-scope-business-model--key-decisions)
3. [User Roles](#3-user-roles)
4. [Requirements Specification](#4-requirements-specification)
5. [User Interface Specification](#5-user-interface-specification)
6. [Technology Stack](#6-technology-stack)
7. [Feature Overview](#7-feature-overview)
8. [MVP Scope & Prioritization (MoSCoW)](#8-mvp-scope--prioritization-moscow)
9. [System Architecture](#9-system-architecture)
10. [Database Design](#10-database-design)
11. [Key Process Flows](#11-key-process-flows)
12. [Development Plan](#12-development-plan)
13. [Open Items, Business Rules & Future Work](#13-open-items-business-rules--future-work)

---

## 1. Introduction & Project Overview

### 1.1 Overview
This project is a web-based marketplace platform for hiring and renting workers and services — spanning home and trade services, personal care, events, professional services, and other gig-economy categories. A customer looking for help (e.g., a plumber) browses a category, compares offers from available providers using multiple criteria (price, location, arrival time, completion time, and rating), and books the one that best fits their needs, assisted by AI-driven matching.

### 1.2 Core Concept
- Three distinct user roles, each with a dedicated interface: **Customer** (buys services), **Provider** (offers services), and **Admin** (manages the platform).
- Two booking models, supported side by side per category: **Instant Book** (fixed-price, immediate confirmation) and **Custom Quote / Bidding** (customer posts a job, providers submit offers).
- An **AI Smart Assistant** that lets a customer just describe their problem in plain language instead of manually searching, and does the rest automatically (see Section 7.1).
- An **Escrow & Protection system** that holds payment until the customer actively accepts the work, requests a revision, or opens a dispute (see Section 7.1).
- A **Professional Reputation Score** that gives each provider a data-driven trust score and tier, not just a star average (see Section 7.1).
- An **Urgent** feature allowing a customer to request a faster response for a higher, mutually agreed price.

### 1.3 Objectives
- Design and build a functioning multi-category service marketplace demonstrating a complete, realistic system architecture.
- Demonstrate practical, substantive use of AI (via the Anthropic Claude API) — not as a buzzword, but as a feature that measurably reduces customer effort and error.
- Demonstrate consideration of business/legal aspects of a marketplace (escrow, dispute handling, trust scoring), not just the technical layer.
- Produce a system that is scoped and buildable by a solo developer within a one-semester timeline.

---

## 2. Scope, Business Model & Key Decisions

| Decision | Choice | Notes |
|---|---|---|
| Service scope | Broad — all types of gig services | Not limited to home/trade services; category taxonomy is extensible |
| Monetization model | Commission per completed job | Tiered by price range rather than a flat percentage |
| Booking model | Both Instant Book and Custom Quote | Configurable per category by Admin |
| Launch ambition (product vision) | Full country | Graduation project build targets a single demo deployment rather than production multi-region infrastructure |
| Development team | Solo developer | Shapes MVP prioritization and the 16-week development plan |

### 2.1 Structural Considerations
- Booking mode (Instant Book / Custom Quote / Both) is a property of the **category**, not a global rule — e.g., house cleaning is Instant Book only, home renovation is Custom Quote only, plumbing supports both.
- The Urgent feature behaves differently per booking model: a priority queue-jump for Instant Book, versus a broadcast-with-urgency-flag for Custom Quote.
- Anti-circumvention: warranty/dispute protection is valid only for bookings made on-platform, discouraging customers and providers from moving transactions off-platform to avoid fees.
- The Escrow & Protection system (Section 7.1.2) and the Reputation Score (Section 7.1.3) reinforce this on-platform incentive — both only apply to platform-booked jobs.

---

## 3. User Roles

### 3.1 Customer
Browses or posts for services, compares offers, books, pays, tracks the job, and leaves a review. Can describe a problem in plain language and let the AI Smart Assistant do the rest. Has a dedicated interface covering search, booking, payment, chat, and account management.

### 3.2 Provider
Offers services either as fixed-price listings (Instant Book) or by bidding on posted jobs (Custom Quote). Builds a Reputation Score and tier over time based on tracked performance metrics. Has a dedicated interface covering onboarding, job/offer management, scheduling, earnings, and reviews.

### 3.3 Admin
Manages the platform: approves providers, configures categories, oversees bookings, resolves disputes, and monitors platform analytics. Has a dedicated interface separate from the consumer-facing app.

---

## 4. Requirements Specification

Requirements are numbered for traceability. FR = Functional Requirement, NFR = Non-Functional Requirement. FR-1 through FR-58 and NFR-1 through NFR-21 were defined in the original specification; FR-59 onward and NFR-22/23 formalize the three new signature features.

### 4.1 Functional Requirements

#### 4.1.1 Authentication & User Management
| ID | Requirement |
|---|---|
| FR-1 | The system shall allow a user to register as a Customer or a Provider. |
| FR-2 | The system shall allow users to log in and log out securely. |
| FR-3 | The system shall support password reset via email/phone verification. |
| FR-4 | The system shall enforce role-based access control (Customer, Provider, Admin), restricting each interface and API endpoint to its authorized role. |
| FR-5 | The system shall allow users to view and edit their profile information. |
| FR-6 | The system shall guide new Providers through a multi-step onboarding process (personal info, category/skills, document upload, service area, initial pricing). |
| FR-7 | The system shall allow Admins to review Provider-submitted documents and approve or reject applications with a stated reason. |

#### 4.1.2 Category & Configuration Management
| ID | Requirement |
|---|---|
| FR-8 | The system shall allow Admins to create, edit, and delete service categories and subcategories. |
| FR-9 | The system shall allow Admins to define a custom set of form fields per category (for job posting and service listing). |
| FR-10 | The system shall allow Admins to configure, per category, whether it supports Instant Book, Custom Quote, or both. |
| FR-11 | The system shall allow Admins to set a commission rate (including tiered rates by price range) per category. |
| FR-12 | The system shall allow Admins to enable or disable the Urgent option per category. |

#### 4.1.3 Job Posting & Custom Quote (Bidding) Flow
| ID | Requirement |
|---|---|
| FR-13 | The system shall allow a Customer to post a job request, including category-specific dynamic fields, description, photos, budget range, location, and preferred date/time. |
| FR-14 | The system shall allow a Customer to flag a job request as Urgent. |
| FR-15 | The system shall display open job requests to Providers whose category and service area match the request. |
| FR-16 | The system shall allow Providers to filter job requests by urgency, budget, and distance. |
| FR-17 | The system shall allow a Provider to submit an offer on a job request (price, estimated arrival time, estimated completion time, message). |
| FR-18 | The system shall allow a Provider to edit or withdraw a pending offer. |
| FR-19 | The system shall allow a Customer to view all offers received on a job side by side and accept or decline any of them. |
| FR-20 | The system shall automatically calculate a "best match" recommendation among offers, based on a weighted score of price, distance, provider rating, and estimated time, and display the reasoning to the Customer. |

#### 4.1.4 Instant Booking Flow
| ID | Requirement |
|---|---|
| FR-21 | The system shall allow a Provider to create, edit, and delete fixed-price service packages (name, description, price, duration, category). |
| FR-22 | The system shall allow a Provider to manage their availability calendar (working hours, blocked dates). |
| FR-23 | The system shall allow a Customer to browse Instant Book services, select a date/time slot, and confirm a booking. |
| FR-24 | The system shall prevent a time slot from being double-booked once confirmed. |

#### 4.1.5 Search & Matching
| ID | Requirement |
|---|---|
| FR-25 | The system shall allow Customers to search and filter listings by price range, distance, minimum rating, availability, and verification status. |
| FR-26 | The system shall calculate the distance between a Customer's location and each Provider's location. |
| FR-27 | The system shall rank/sort results by the criteria selected by the Customer (price, rating, distance). |

#### 4.1.6 Booking Lifecycle
| ID | Requirement |
|---|---|
| FR-28 | The system shall track and display booking status through defined states: Pending → Confirmed → En Route → In Progress → Completed → Cancelled. |
| FR-29 | The system shall allow a Provider to update the status of an active job. |
| FR-30 | The system shall allow either party to cancel a booking, subject to a cancellation policy. |
| FR-31 | The system shall allow a Customer to request a reschedule of a confirmed booking. |

#### 4.1.7 Urgent Requests
| ID | Requirement |
|---|---|
| FR-32 | The system shall allow a Customer to request urgent service, with the system displaying an expected price premium. |
| FR-33 | The system shall allow a Provider to accept, decline, or counter-propose the price/time for an urgent request. |
| FR-34 | The system shall broadcast urgent requests preferentially to Providers marked as currently available. |

#### 4.1.8 Payments & Escrow
| ID | Requirement |
|---|---|
| FR-35 | The system shall allow a Customer to pay for a confirmed booking through the platform. |
| FR-36 | The system shall hold payment status as "escrowed" until the job is marked complete and the Customer takes (or fails to take) an action per FR-63/FR-64. |
| FR-37 | The system shall automatically calculate and deduct the platform commission from each transaction. |
| FR-38 | The system shall generate an invoice/receipt for each completed booking. |
| FR-39 | The system shall allow a Provider to view their earnings history and request a payout. |

#### 4.1.9 Communication
| ID | Requirement |
|---|---|
| FR-40 | The system shall allow a Customer and Provider to exchange text and photo messages within the context of a specific job. |
| FR-41 | The system shall send in-app notifications for key events (offer received, booking confirmed, provider en route, job completed, review received, etc.). |
| FR-42 | The system shall display the Provider's live location on a map to the Customer during an active, en-route job. |

#### 4.1.10 Reviews & Ratings
| ID | Requirement |
|---|---|
| FR-43 | The system shall allow a Customer to rate and review a Provider after a job is marked complete, using multiple criteria plus free text and optional photos. |
| FR-44 | The system shall allow a Provider to publicly respond to a review. |
| FR-45 | The system shall calculate and display each Provider's aggregate rating. |

#### 4.1.11 Trust & Safety
| ID | Requirement |
|---|---|
| FR-46 | The system shall display a "Verified" badge on Provider profiles that have completed document verification. |
| FR-47 | The system shall allow a user to report or block another user. |
| FR-48 | The system shall provide an in-app safety/SOS action during an active job. |
| FR-49 | The system shall allow a user to open a dispute on a job, attaching evidence (photos, chat excerpts). |

#### 4.1.12 Admin Operations
| ID | Requirement |
|---|---|
| FR-50 | The system shall allow Admins to search, filter, and view all Customer and Provider accounts, and to suspend or ban an account. |
| FR-51 | The system shall allow Admins to view and manage all bookings platform-wide, including cancellation or reassignment. |
| FR-52 | The system shall allow Admins to review and resolve disputes, with actions including refund, warning, or account suspension. |
| FR-53 | The system shall allow Admins to moderate (approve/remove) flagged reviews. |
| FR-54 | The system shall provide Admins with analytics on bookings, revenue, category performance, and top providers. |
| FR-55 | The system shall allow Admins to send announcements to Customers and/or Providers. |
| FR-56 | The system shall support multiple admin accounts with scoped permissions (e.g., regional/category-limited access). |

#### 4.1.13 Engagement Features
| ID | Requirement |
|---|---|
| FR-57 | The system shall allow a Customer to save Providers to a favorites list. |
| FR-58 | The system shall generate a unique referral code per user and track referral-based signups. |

#### 4.1.14 AI Smart Assistant *(new)*
| ID | Requirement |
|---|---|
| FR-59 | The system shall allow a Customer to describe a problem in free-form natural language and use AI to identify the appropriate service category. |
| FR-60 | The system shall use AI to estimate an expected cost range and job duration from the Customer's free-form description. |
| FR-61 | The system shall use AI to suggest the top 3 matching Providers based on the identified category, location, and job details. |
| FR-62 | The system shall use AI to auto-generate a structured, professional job description from the Customer's free-form input, which the Customer can review and edit before posting. |

#### 4.1.15 Escrow Enhancements — Revision & Auto-Release *(new)*
| ID | Requirement |
|---|---|
| FR-63 | After a Provider marks a job complete, the system shall require the Customer to choose one of: Accept the work (releasing payment), Request a Revision, or Open a Dispute. |
| FR-64 | If the Customer does not respond within a configurable time window after job completion, the system shall automatically release the held payment to the Provider. |
| FR-65 | The system shall allow a Provider to address a revision request and resubmit the job as complete, restarting the Customer's response window. |

#### 4.1.16 Reputation & Trust Score *(new)*
| ID | Requirement |
|---|---|
| FR-66 | The system shall track per-provider performance metrics: on-time rate, average response time, completion rate, cancellation rate, and total completed jobs. |
| FR-67 | The system shall calculate a composite Trust Score for each Provider derived from their tracked metrics and rating history. |
| FR-68 | The system shall assign each Provider a tier (Bronze / Silver / Gold / Platinum) based on their Trust Score and display it on their profile. |

### 4.2 Non-Functional Requirements

#### 4.2.1 Usability
| ID | Requirement |
|---|---|
| NFR-1 | The interface shall be usable by a first-time user without requiring a tutorial, following common web UX conventions. |
| NFR-2 | The layout shall be responsive and usable on both desktop and mobile browser widths, since no native mobile app is planned initially. |
| NFR-3 | Job-posting and service-listing forms shall adapt their fields dynamically based on the selected category, without requiring separate hardcoded pages per category. |
| NFR-4 | The system shall support at least two languages (e.g., Arabic and English), including right-to-left layout where applicable. |

#### 4.2.2 Performance
| ID | Requirement |
|---|---|
| NFR-5 | Search/filter results shall be returned within 2 seconds under normal (single-instance, demo-scale) load. |
| NFR-6 | Page load time for primary pages shall not exceed 3 seconds under normal load. |
| NFR-23 | *(new)* Provider Trust Score shall be recalculated incrementally after each completed booking or review, not recomputed from scratch on every page load. |

#### 4.2.3 Reliability & Availability
| ID | Requirement |
|---|---|
| NFR-7 | The system shall handle invalid input and failed operations gracefully, showing clear error messages rather than failing silently or crashing. |
| NFR-8 | Booking state transitions shall be atomic — a booking shall never be left in an inconsistent or undefined status due to a failed operation. |
| NFR-22 | *(new)* If the AI Smart Assistant (Anthropic API) is unavailable, the system shall allow the Customer to fall back to manual category selection and the standard job-posting form without blocking job posting. |

#### 4.2.4 Security
| ID | Requirement |
|---|---|
| NFR-9 | User passwords shall be stored hashed (never in plain text). |
| NFR-10 | All authenticated endpoints shall require a valid session/JWT token and shall enforce role-based authorization. |
| NFR-11 | All user-submitted input shall be validated and sanitized server-side to prevent injection attacks. |
| NFR-12 | Uploaded documents/photos shall be validated for file type and size before storage. |
| NFR-13 | Sensitive actions (payments, document approval, account suspension) shall be logged for auditability. |

#### 4.2.5 Data Integrity
| ID | Requirement |
|---|---|
| NFR-14 | The database schema shall enforce referential integrity between related entities via constraints. |
| NFR-15 | A review shall only be creatable after the associated booking has reached "Completed" status. |

#### 4.2.6 Maintainability
| ID | Requirement |
|---|---|
| NFR-16 | The backend shall be organized into clearly separated modules to support future extraction into independent services if needed. |
| NFR-17 | API endpoints shall be self-documented (leveraging FastAPI's automatic OpenAPI documentation). |

#### 4.2.7 Scalability
| ID | Requirement |
|---|---|
| NFR-18 | The system's architecture shall not preclude future horizontal scaling, even though the current deployment is single-instance. |

#### 4.2.8 Compatibility
| ID | Requirement |
|---|---|
| NFR-19 | The web application shall function correctly on the latest versions of major browsers. |

#### 4.2.9 Legal & Compliance
| ID | Requirement |
|---|---|
| NFR-20 | The system shall require users to accept Terms of Service and a Privacy Policy at signup. |
| NFR-21 | The system's design should acknowledge that Provider classification (independent contractor vs. platform-employed) may carry legal implications depending on jurisdiction. |

---

## 5. User Interface Specification

Every screen across all three interfaces. Additions for the three new features are marked *(new)*.

### 5.1 Shared / Public Pages (before login)

**5.1.1 Public Landing Page**
- Hero section: search bar (service keyword + location), primary CTAs ("Find a Service" / "Become a Provider")
- Category grid (icons)
- "How it works" 3-step visual
- Trust strip: verified providers, ratings, escrow-protected payments
- Footer: About, Help Center, Terms, Become a Provider, Contact

**5.1.2 Login / Sign Up**
- Role toggle: "I need a service" (Customer) vs "I offer a service" (Provider)
- Fields: name, email/phone, password (or OTP-based login)
- Admin login is a separate, unlisted route

**5.1.3 Forgot / Reset Password**
- Email/phone entry → verification code → new password

**5.1.4 Help Center / FAQ**
- Searchable FAQ, contact support link, link to Terms/Privacy

### 5.2 Customer Interface

**5.2.1 Home Page (post-login)**
- Search bar, category grid, "Urgent Request" quick-access button
- *(new)* Prominent **"Describe your problem"** entry point for the AI Smart Assistant, positioned alongside the search bar as an alternative way to start
- "Recommended for you" row, "Book again" row

**5.2.2 Category Browse / Listing Page**
- Filter panel: price range, distance, minimum rating, verified-only, sort by
- Toggle (if category supports both): "Instant Book" | "Post a Job for Quotes"
- Provider/offer cards with photo, rating, price, distance, ETA, verified badge
- One card auto-flagged "AI Best Match" with reasoning
- *(new)* Where relevant, provider cards show their **Reputation tier badge** (Bronze/Silver/Gold/Platinum)

**5.2.3 Provider Profile Page**
- Header: photo, name, category/skills, verification badges, overall rating
- *(new)* **Reputation & Trust Score panel**: overall Trust Score, tier badge, and a breakdown of on-time rate, response speed, completion rate, cancellation rate, and total completed jobs
- Reviews list, portfolio/gallery, pricing/menu or "Request a Quote", availability preview
- "Message" button, "Report/Block" option

**5.2.4 Post a Job Page (Custom Quote flow)** *(significantly extended)*
- *(new)* **AI Smart Assistant entry mode**: a free-text box where the Customer types their problem in plain language (e.g., "My AC isn't cooling" or "I want to renovate my kitchen"). On submit, the system displays:
  - The identified service category (editable if wrong)
  - An estimated cost range
  - An estimated job duration
  - The top 3 matching Providers, shown immediately
  - An auto-generated, professional job description, editable before posting
- Standard path (unchanged): category/subcategory selector, dynamic form fields, description, photo upload, budget range, location picker, preferred date/time, Urgent toggle
- Submit → confirmation screen

**5.2.5 Instant Book Flow**
- Select service package → pick date/time → confirm address → price summary → checkout → confirmation

**5.2.6 My Jobs / Bookings Dashboard**
- Tabs: Pending Offers | Upcoming | In Progress | Completed | Cancelled
- Pending Offers: comparable offer cards with AI "Best Match" highlight
- Upcoming/In Progress: status tracker, live map, chat shortcut

**5.2.7 Job Details / Live Tracking Page** *(extended)*
- Status timeline, live map, provider info card, embedded chat
- *(new)* **Escrow decision panel**, shown once the Provider marks the job complete:
  - ✅ **Accept & Release Payment**
  - 🔄 **Request a Revision** (with a text field for what needs fixing)
  - ⚠️ **Open a Dispute**
  - A visible countdown/notice: "Payment will be automatically released to the Provider in [X hours] if no action is taken."
- Safety button (SOS)

**5.2.8 Chat / Messages**
- Conversation list, chat window with text/photo sharing

**5.2.9 Checkout / Payment Page**
- Price breakdown, payment method, "Pay Now" → simulated escrow hold

**5.2.10 Reviews Page**
- Star rating per criteria, text review, optional photos

**5.2.11 Profile & Settings**
- Personal info, saved addresses, payment methods, notification preferences, language, favorites, referral code

**5.2.12 Notifications Panel**
- *(new)* Includes notifications for: revision requested/resolved, payment auto-released, AI-suggested providers ready

### 5.3 Provider Interface

**5.3.1 Provider Onboarding**
- Personal/business info → category & skills → ID/certification upload → service area → initial pricing → pending approval

**5.3.2 Provider Dashboard (Home)** *(extended)*
- Stats: earnings, completed jobs, average rating, response rate, acceptance rate
- *(new)* **Trust Score & Tier widget**: current tier badge, Trust Score, and progress toward the next tier
- Online/Offline toggle, new job requests feed, active job alerts

**5.3.3 Job Feed (Custom Quote requests)**
- *(new)* Jobs originating from the AI Smart Assistant are marked with a small "AI-matched" indicator, since the Provider was proactively suggested to the Customer
- Filters: urgency, budget, distance; "Submit Offer" form

**5.3.4 My Offers**
- List of submitted offers with status

**5.3.5 My Services (Instant Book menu management)**
- Service packages CRUD, availability calendar

**5.3.6 Active Jobs** *(extended)*
- Current confirmed bookings, status action buttons
- *(new)* **Revision Requested** state: shows the Customer's revision note; Provider resubmits as complete when addressed

**5.3.7 Job History**
- Completed/cancelled jobs, earnings, reviews received

**5.3.8 Earnings & Payouts**
- Earnings summary, transaction history, payout requests
- *(new)* Line items distinguish "released" vs "auto-released" payments for transparency

**5.3.9 Reviews & Ratings**
- Reviews received, rating breakdown, response option

**5.3.10 Profile & Verification** *(extended)*
- Edit profile, manage certifications
- *(new)* **Reputation metrics detail**: full breakdown of the tracked stats feeding the Trust Score, so Providers understand how to improve their tier

**5.3.11 Chat / Messages**

**5.3.12 Notifications Panel**
- *(new)* Includes: new AI-matched job, revision requested, payment auto-released, tier upgraded

**5.3.13 Settings**
- Service area, category opt-in, urgent opt-in, notifications, language

### 5.4 Admin Interface

**5.4.1 Admin Dashboard (Home)**
- KPI cards, charts (signups, bookings, revenue, top categories/cities)

**5.4.2 User Management**

**5.4.3 Provider Management**
- Approval queue, profile view with activity/earnings/ratings

**5.4.4 Category Management**
- CRUD, dynamic fields, booking mode, commission rate, urgent enabled

**5.4.5 Bookings / Jobs Management**
- All jobs, filters, detail view, intervention actions

**5.4.6 Disputes & Reports** *(extended)*
- *(new)* Disputes opened after a Customer used "Open a Dispute" from the escrow panel are pre-populated with the revision-request history, if any, giving the Admin fuller context

**5.4.7 Reviews Moderation**

**5.4.8 Payments & Commission** *(extended)*
- Transaction log, commission summary
- *(new)* Configuration for the **auto-release time window** (FR-64), adjustable globally or per category

**5.4.9 Analytics / Reports** *(extended)*
- *(new)* Distribution of Providers across Reputation tiers (Bronze/Silver/Gold/Platinum), and Trust Score trends over time

**5.4.10 Admin Roles & Settings**

**5.4.11 Announcements**

---

## 6. Technology Stack

| Layer | Choice | Rationale |
|---|---|---|
| Frontend | Next.js (React + TypeScript), Tailwind CSS | SSR for SEO; one codebase serves all three interfaces |
| Backend | FastAPI (Python), modular monolith | Matches team's strongest ecosystem; async suits chat/live-tracking |
| ORM | SQLModel | Built for FastAPI |
| Database | PostgreSQL or SQLite | Relational integrity; SQLite viable for zero-setup demo |
| Geospatial | Plain Haversine formula in Python | PostGIS is unnecessary overhead at this scale |
| Real-time | FastAPI native WebSockets, in-memory manager | No Redis needed for single-instance deployment |
| Search/filter | Plain SQL queries | No dedicated search engine needed at this scale |
| Maps | Leaflet.js + OpenStreetMap tiles | Free, no API key required |
| File storage | Local filesystem | Served as static files from FastAPI |
| AI features | Anthropic Claude API | Powers the AI Smart Assistant (category ID, cost/duration estimate, description generation), best-match scoring, and support chatbot |
| Matching logic | Weighted-scoring Python function | Transparent, explainable, no ML infra required |
| Reputation scoring | Deterministic formula (Python) | Composite score from tracked metrics — transparent and easy to defend, no ML needed |
| Payments | Simulated (Stripe test mode optional) | No real money movement required |
| Scheduled jobs | Simple polling task or `arq`/cron-style job | Needed for the escrow **auto-release timer** (FR-64) |
| Notifications | In-app notification table + UI list | Push/SMS/WhatsApp out of scope |
| Hosting | Render or Railway (free tier) | No containerization required |

---

## 7. Feature Overview

### 7.1 Signature Differentiators

These three features are the project's core differentiators — the parts most worth emphasizing in a defense, since they go beyond a generic listings-and-booking marketplace.

#### 7.1.1 AI Smart Assistant ⭐⭐⭐⭐⭐

Instead of the Customer searching for a worker manually, they simply describe the problem in plain language, for example:
- *"My AC isn't cooling."*
- *"I want to renovate my kitchen."*

The system then automatically:
- Identifies the type of service needed
- Suggests the appropriate category
- Estimates the expected cost
- Estimates the job duration
- Suggests the best 3 matching Providers
- Generates a professional description of the request

**Why it stands out**
- Uses AI in a genuinely practical way, not just as a buzzword
- Reduces Customer input errors (wrong category, vague or incomplete descriptions)
- Differentiates the platform from any generic service marketplace

*(Formalized as FR-59 to FR-62 in Section 4.1.14; UI in Section 5.2.4.)*

#### 7.1.2 Escrow & Protection System ⭐⭐⭐⭐⭐

Instead of transferring payment directly to the Provider:
1. The Customer pays.
2. The amount is held by the platform.
3. The Provider completes the job.
4. The Customer then chooses one of:
   - ✅ **Accept the work**
   - 🔄 **Request a revision**
   - ⚠️ **Open a dispute**
5. If the Customer doesn't respond within a defined time window, the payment is **automatically released** to the Provider.

**Why it stands out**
- Increases trust for both Customers and Providers
- Demonstrates consideration of business and legal aspects, not just the technical layer
- Adds real professionalism to the project

> This builds directly on the escrow concept already defined in FR-35/FR-36 — here it's developed further with an explicit revision-request step and an automatic release timer. *(Formalized as FR-63 to FR-65 in Section 4.1.15; UI in Section 5.2.7.)*

#### 7.1.3 Professional Reputation Score ⭐⭐⭐⭐

Instead of showing just a star count, a Provider's profile displays:
- ⭐ Overall rating
- ⏱️ On-time / punctuality rate
- 💬 Response speed
- ✅ Completion rate
- ❌ Cancellation rate
- 🛠️ Number of completed jobs
- 🏅 Provider tier (**Bronze → Silver → Gold → Platinum**)

The system calculates a composite **Trust Score** for each Provider from these signals.

**Why it stands out**
- Makes Provider selection meaningfully more accurate than a simple star average
- Signals to a defense committee that the system is data/analytics-driven, not just a list of simple ratings

*(Formalized as FR-66 to FR-68 in Section 4.1.16; UI in Sections 5.2.3 and 5.3.2/5.3.10.)*

### 7.2 Trust & Verification
- ID verification / background checks for providers, with a "Verified" badge
- Skill/certification uploads, admin-reviewed
- Two-way ratings & reviews (customers rate providers and vice versa)
- Dispute resolution workflow with evidence upload

### 7.3 Additional AI-Assisted Features
- Weighted "best match" offer recommendation (price, distance, rating, ETA) — complements the AI Smart Assistant during offer comparison
- Support chatbot for FAQs

### 7.4 Booking & Scheduling
- Real-time provider availability calendar
- Instant Book and Custom Quote / Bidding, configurable per category

### 7.5 Payments & Financial
- Escrow-style payment with revision/dispute/auto-release handling (Section 7.1.2)
- Tiered commission by price range
- Auto-generated digital invoices/receipts

### 7.6 Communication & Tracking
- In-app chat (text + photos) per booking
- Live "en route" location display
- In-app notifications for status changes

### 7.7 Admin & Operations
- Provider approval workflow, category configuration
- Platform-wide booking oversight and dispute resolution
- Analytics: revenue, top categories, provider performance, reputation tier distribution

### 7.8 Engagement
- Favorites list for repeat bookings
- Referral codes (future extension)

### 7.9 Other Differentiators
- Urgent requests with a price premium, negotiable per booking
- Multi-language / RTL support for the target region

---

## 8. MVP Scope & Prioritization (MoSCoW)

Prioritized for a solo developer working within a one-semester (~16-week) timeline. FR numbers reference Section 4.1.

### 8.1 Must Have (Phase 1 — the working spine)
- FR-1 to FR-7 — Registration/login, provider onboarding, manual admin approval
- FR-8, FR-9, FR-10 — Category CRUD, dynamic field config, booking-mode toggle
- FR-13, FR-15 to FR-19 — Job posting, provider job feed, submit/compare/accept offers
- FR-20 — AI "best match" recommendation (weighted-scoring formula)
- FR-21 to FR-24 — Instant Book: service menu, availability, slot booking
- FR-25 to FR-27 — Basic search/filter/sort
- FR-28 to FR-31 — Booking status lifecycle
- FR-32 to FR-34 — Urgent requests (simplified: fixed surcharge)
- FR-35 to FR-38 — Simulated payment, basic escrow hold, commission calculation, invoice
- FR-43, FR-45 — Reviews: single overall rating + text
- FR-41 — Basic in-app notifications
- FR-50, FR-51 — Admin: user/provider management, booking oversight

### 8.2 Should Have (Phase 2)
- FR-11 — Tiered commission (vs. flat rate)
- Upgrade FR-32–34 — negotiable Urgent pricing instead of fixed surcharge
- FR-40 — In-app chat per booking
- FR-42 — Live location display (static "en route" pin)
- FR-6/7, FR-46 — Fuller document-verification workflow + verified badge
- FR-49, FR-52 — Dispute submission + admin resolution
- FR-44 — Multi-criteria review breakdown
- **FR-59 to FR-62 — AI Smart Assistant** *(new — high priority within Should-Have given its role as a signature differentiator)*
- **FR-63 to FR-65 — Escrow revision request + auto-release timer** *(new)*
- **FR-66 to FR-68 — Reputation & Trust Score, provider tiers** *(new)*
- FR-57 — Favorites list

### 8.3 Could Have (Phase 3, only if time remains)
- FR-47 — Report/block user
- FR-48 — SOS button
- FR-53 — Review moderation queue
- FR-54 — Admin analytics/charts
- FR-55 — Announcements
- FR-56 — Multi-admin/regional roles

### 8.4 Won't Have (this iteration)
- FR-58 — Referral codes / loyalty points
- Real payment gateway integration
- Real push notifications / SMS / WhatsApp
- Native mobile apps
- Multi-language / RTL support
- Redis, Docker, microservices split

> **Note on the three new features:** all three are placed in Should-Have rather than Must-Have. They depend on infrastructure that's built during Phase 1 (Custom Quote flow, escrow hold, reviews) and are meaningfully easier to build correctly once that foundation is stable. Given their importance as differentiators, they should be tackled **first** within Phase 2, ahead of the other Should-Have items.

---

## 9. System Architecture

The system is a modular monolith: a single Next.js frontend, a single FastAPI backend organized into internal modules, one relational database, and external services used only where self-hosting isn't worth the effort.

```
Client (Browser)
   Next.js Web App — Customer / Provider / Admin UIs
        |  REST API (HTTPS) + WebSocket
        v
FastAPI Backend (modular monolith, single process)
   Auth | Bookings | Jobs & Offers | Payments
   Chat/WebSocket | Admin | AI Assistant & Matching
   Reputation Scoring | Escrow Auto-Release Scheduler   <-- new modules
        |                              |
        v                              v
Data Layer                      External Services
   PostgreSQL/SQLite               Anthropic Claude API
   Local File Storage              OpenStreetMap Tiles (Leaflet.js, client-side)
```

### 9.1 Component Notes
- **Client**: Next.js web app serving all three role-based interfaces via route-based access control.
- **Backend**: FastAPI, structured as routers/modules per domain. Two modules are new relative to the original design:
  - **AI Assistant & Matching** — handles free-text problem parsing, category identification, cost/duration estimation, and top-3 provider suggestion (all via the Claude API), plus the existing weighted best-match scoring.
  - **Escrow Auto-Release Scheduler** — a lightweight scheduled task (polling or cron-style) that checks for bookings past their response window and releases payment automatically.
- **Data layer**: PostgreSQL/SQLite for structured data; local filesystem for uploaded photos/documents.
- **External services**: Anthropic Claude API for AI-assisted features; OpenStreetMap tiles for maps, fetched client-side.

---

## 10. Database Design

### 10.1 Core Entity Relationships (simplified)

```
USER ──extends──> PROVIDER_PROFILE ──offers──> SERVICE
  │                     │                          │
  posts                 submits                     │
  │                     │                          │
  v                     v                          │
JOB_REQUEST ──receives──> OFFER ──becomes──> BOOKING <──booked as──┘
                                                │
                                    ┌───────────┼───────────┐
                                    v           v           v
                                PAYMENT      REVIEW    (revision / dispute)
```

### 10.2 Data Dictionary

Fields marked *(new)* were added to support the three signature features.

**USER** — base account for every person on the platform.
| Field | Type | Description |
|---|---|---|
| id | int (PK) | Unique identifier |
| name | string | Full name |
| email | string (UK) | Login email, unique |
| phone | string | Contact phone number |
| password_hash | string | Hashed password |
| role | string | customer / provider / admin |
| language_pref | string | Preferred UI language |
| created_at | datetime | Account creation timestamp |

**PROVIDER_PROFILE** — extends a USER with provider-specific data.
| Field | Type | Description |
|---|---|---|
| id | int (PK) | Unique identifier |
| user_id | int (FK) | References USER |
| bio | string | Provider description |
| service_radius_km | float | Max distance willing to travel |
| latitude / longitude | float | Base location |
| average_rating | float | Calculated from REVIEW records |
| verification_status | string | pending / approved / rejected |
| is_online | boolean | Current availability |
| *(new)* trust_score | float | Composite reputation score (FR-67) |
| *(new)* tier | string | bronze / silver / gold / platinum (FR-68) |
| *(new)* on_time_rate | float | % of jobs started/arrived on time (FR-66) |
| *(new)* avg_response_minutes | float | Average time to respond to offers/messages (FR-66) |
| *(new)* completion_rate | float | % of accepted jobs completed (FR-66) |
| *(new)* cancellation_rate | float | % of accepted jobs cancelled (FR-66) |
| *(new)* completed_jobs_count | int | Total completed jobs (FR-66) |

**ADDRESS** — saved addresses for a Customer.
| Field | Type | Description |
|---|---|---|
| id | int (PK) | Unique identifier |
| user_id | int (FK) | References USER |
| label | string | e.g. "Home", "Office" |
| latitude / longitude | float | Geolocation |
| full_address | string | Human-readable address |

**CATEGORY** — service category or subcategory.
| Field | Type | Description |
|---|---|---|
| id | int (PK) | Unique identifier |
| parent_category_id | int (FK, nullable) | Self-reference for subcategories |
| name | string | Category name |
| booking_mode | string | instant / custom / both |
| commission_rate | float | Platform commission for this category |
| urgent_enabled | boolean | Whether Urgent is available |
| dynamic_fields_schema | json | Defines extra form fields for this category |

**PROVIDER_CATEGORY** — join table.
| Field | Type | Description |
|---|---|---|
| provider_id | int (FK) | References PROVIDER_PROFILE |
| category_id | int (FK) | References CATEGORY |

**SERVICE** — fixed-price Instant Book package.
| Field | Type | Description |
|---|---|---|
| id | int (PK) | Unique identifier |
| provider_id | int (FK) | References PROVIDER_PROFILE |
| category_id | int (FK) | References CATEGORY |
| name / description | string | Service listing details |
| price | float | Fixed price |
| duration_minutes | int | Expected duration |

**AVAILABILITY** — a Provider's bookable slots.
| Field | Type | Description |
|---|---|---|
| id | int (PK) | Unique identifier |
| provider_id | int (FK) | References PROVIDER_PROFILE |
| date | date | Calendar date |
| start_time / end_time | time | Slot boundaries |
| is_blocked | boolean | Manually blocked |

**JOB_REQUEST** — a Custom Quote job posted by a Customer.
| Field | Type | Description |
|---|---|---|
| id | int (PK) | Unique identifier |
| customer_id | int (FK) | References USER |
| category_id | int (FK) | References CATEGORY |
| description | string | Free-text job description |
| dynamic_fields | json | Category-specific field values |
| budget_min / budget_max | float | Optional guide budget |
| latitude / longitude | float | Job location |
| is_urgent | boolean | Urgent flag |
| status | string | open / awarded / expired / cancelled |
| preferred_datetime | datetime | Requested timing |
| created_at | datetime | Posting timestamp |
| *(new)* ai_generated | boolean | Whether the AI Smart Assistant produced this request (FR-62) |
| *(new)* estimated_cost_min / estimated_cost_max | float | AI-estimated cost range (FR-60) |
| *(new)* estimated_duration_minutes | int | AI-estimated job duration (FR-60) |

**OFFER** — a Provider's bid on a JOB_REQUEST.
| Field | Type | Description |
|---|---|---|
| id | int (PK) | Unique identifier |
| job_request_id | int (FK) | References JOB_REQUEST |
| provider_id | int (FK) | References PROVIDER_PROFILE |
| price | float | Proposed price |
| eta_minutes | int | Estimated arrival time |
| estimated_completion | datetime | Estimated finish time |
| message | string | Note to the Customer |
| status | string | pending / accepted / declined / withdrawn / expired |
| created_at | datetime | Submission timestamp |

**BOOKING** — a confirmed job.
| Field | Type | Description |
|---|---|---|
| id | int (PK) | Unique identifier |
| type | string | instant / custom |
| customer_id / provider_id | int (FK) | References USER / PROVIDER_PROFILE |
| category_id | int (FK) | References CATEGORY |
| service_id | int (FK, nullable) | Set when type = instant |
| offer_id | int (FK, nullable) | Set when type = custom |
| price | float | Final agreed price |
| status | string | pending/confirmed/en_route/in_progress/completed/**revision_requested**/cancelled |
| scheduled_datetime | datetime | Planned start time |
| latitude / longitude | float | Job location |
| is_urgent | boolean | Urgent flag |
| created_at / completed_at | datetime | Lifecycle timestamps |
| *(new)* revision_notes | string | Customer's note when requesting a revision (FR-63) |
| *(new)* revision_count | int | Number of times a revision was requested (FR-65) |

**PAYMENT** — simulated payment/escrow record.
| Field | Type | Description |
|---|---|---|
| id | int (PK) | Unique identifier |
| booking_id | int (FK) | References BOOKING |
| amount | float | Total charged |
| commission_amount | float | Platform's cut |
| provider_payout | float | Amount owed to Provider |
| status | string | held / released / auto_released / refunded |
| method | string | Payment method used (simulated) |
| created_at | datetime | Transaction timestamp |
| *(new)* auto_release_at | datetime | When payment auto-releases if the Customer takes no action (FR-64) |
| *(new)* released_at | datetime | When payment was actually released (manually or automatically) |

**REVIEW** — Customer's rating and feedback.
| Field | Type | Description |
|---|---|---|
| id | int (PK) | Unique identifier |
| booking_id | int (FK) | References BOOKING |
| customer_id / provider_id | int (FK) | Parties involved |
| overall_rating | float | Star rating |
| criteria_ratings | json | Multi-criteria breakdown |
| text | string | Written review |
| photo_urls | json | Attached photos |
| provider_response | string | Optional Provider reply |
| created_at | datetime | Submission timestamp |

**MESSAGE**, **NOTIFICATION**, **DOCUMENT**, **DISPUTE**, **FAVORITE** — unchanged from the original schema; each continues to reference USER, PROVIDER_PROFILE, and BOOKING as previously defined.

---

## 11. Key Process Flows

### 11.1 Main Booking Flow (Flow of Events)

| Step | Description |
|---|---|
| 1 | Customer selects a category, or starts from the **AI Smart Assistant** by describing their problem in free text. |
| 1a *(new)* | If using the AI Smart Assistant: the system identifies the category, estimates cost and duration, suggests the top 3 Providers, and drafts a professional description — all editable before the Customer proceeds. |
| 2a | Instant Book path: Customer browses services and picks a date/time; the Backend checks slot availability and creates the booking as "confirmed." |
| 2b | Custom Quote path: Customer posts the job (manually or via the AI-drafted version); the Backend saves it as "open" and notifies matching Providers. |
| 3b | A Provider submits an offer; the Backend saves it as "pending" and notifies the Customer. |
| 4b | Customer compares offers (AI best-match highlighted) and accepts one; the Backend creates the booking and declines the others. |
| 5 | Provider updates the booking status as work progresses (en route → in progress → completed). |
| 6 | Customer pays (simulated); the Backend marks the payment "held" and sets an **auto_release_at** timestamp. |
| 7 *(new)* | Once the Provider marks the job complete, the Customer must choose: **Accept** (payment released), **Request Revision** (booking status → "revision_requested," Provider addresses it and resubmits, restarting the window), or **Open a Dispute** (routes to Section 11.2). |
| 8 *(new)* | If the Customer takes no action before `auto_release_at`, the scheduler automatically marks the payment "auto_released" and notifies both parties. |
| 9 | Customer submits a review; the Backend saves it and recalculates the Provider's average rating **and Trust Score** (Section 4.1.16). |

### 11.2 Dispute Resolution Flow (Flow of Events)

| Step | Description |
|---|---|
| 1 | Customer opens a dispute on a booking (from the escrow decision panel or Job Details page), submitting a reason and evidence. |
| 2 | The Backend saves the dispute as "open" and notifies the Admin. If the booking had prior revision requests, they're included automatically for context. |
| 3 | Admin reviews the booking, chat log, and evidence. |
| 4a | Admin refunds the Customer → payment marked "refunded." |
| 4b | Admin warns/suspends the Provider → verification status updated. |
| 4c | Admin rejects the dispute → Customer notified. |
| 5 | Dispute marked "resolved." |

### 11.3 AI Smart Assistant Flow (Flow of Events) *(new)*

| Step | Description |
|---|---|
| 1 | Customer types a free-text description of their problem. |
| 2 | The Backend sends the description to the Claude API with a prompt requesting category identification, cost/duration estimation, and a structured description. |
| 3 | The Backend maps the AI's category suggestion to the platform's existing category taxonomy and queries for the top 3 matching, available Providers (by category, distance, and rating). |
| 4 | The Customer is shown: suggested category (editable), estimated cost range, estimated duration, top 3 Providers, and the AI-drafted description (editable). |
| 5 | The Customer confirms, adjusting anything needed, and proceeds to post the job (2b in Section 11.1) or book one of the suggested Providers directly. |
| Fallback | If the AI service is unavailable, the Customer is routed to the standard manual category-selection form (NFR-22). |

---

## 12. Development Plan

### 12.1 Methodology
Development is sequenced into six phases over 16 weeks. Instant Book is built before Custom Quote (simpler transactional loop first, reducing risk), and a skeleton app is deployed in Week 2 to validate the deployment pipeline early. The three signature features are placed at the **start of Phase 2**, immediately after the MVP spine is working, since they're the highest-value additions for the defense.

### 12.2 Phase Summary

| Phase | Weeks | Focus | Key Outcome |
|---|---|---|---|
| Phase 0 | 1–2 | Foundation & Setup | Auth working, skeleton deployed live |
| Phase 1 | 3–8 | Core Marketplace Loop (Must-Have) | Full MVP working end-to-end |
| Phase 2 | 9–11 | Should-Have Enhancements, **led by the AI Smart Assistant, Escrow revision/auto-release, and Reputation Score** | Signature differentiators complete |
| Phase 3 | 12–13 | Testing, Polish & Optional Features | Stable, demo-ready |
| Phase 4 | 14–15 | Deployment & Documentation | Live deployment + full report |
| Phase 5 | 16 | Buffer & Defense Preparation | Rehearsed demo + backup recording |

### 12.3 Phase 2 Detail (updated)

**Objective:** Layer in the features that differentiate this from a generic CRUD marketplace, prioritized by defense impact.

**Key activities, in order:**
1. **AI Smart Assistant** (FR-59–62) — free-text problem parsing, category ID, cost/duration estimation, top-3 provider suggestion, description generation
2. **Escrow Revision & Auto-Release** (FR-63–65) — decision panel, revision loop, scheduled auto-release task
3. **Reputation & Trust Score** (FR-66–68) — metric tracking, scoring formula, tier assignment and display
4. Urgent Negotiation + Tiered Commission
5. In-App Chat + Live Location
6. Verification Workflow + Disputes
7. Favorites

> Note: adding the three new feature groups to Phase 2 increases its workload compared to the original plan. If time is tight, items 4–7 above are the ones to compress or partially defer into Phase 3's Could-Have bucket — the three signature features should not be cut.

### 12.4 Risk Management

| Risk | Mitigation |
|---|---|
| Scope creep | Strict MoSCoW discipline; Could-Have is explicitly droppable |
| Custom Quote/bidding underestimated | Instant Book built first |
| Anthropic API cost/rate limits | Cache responses; mock fallback path; integrate AI features early, not last-minute |
| AI Smart Assistant produces a wrong category or unusable estimate | Every AI suggestion (category, cost, duration, description) is shown as editable, never auto-submitted without Customer confirmation |
| Auto-release timer logic has bugs (pays out incorrectly) | Cover with unit tests specifically in Phase 3; test with short artificial timers before using real-world durations |
| Trust Score formula feels arbitrary in the defense | Document the exact formula and weighting in the report, and make it configurable/explainable, not a black box |
| Deployment issues discovered late | Skeleton deployed in Week 2 |
| Falling behind schedule | Week 16 buffer; Could-Have items are fully droppable |

---

## 13. Open Items, Business Rules & Future Work

### 13.1 Business Rule Values to Finalize Before Coding
- Urgent surcharge percentage
- Cancellation policy — free-cancellation window and fee
- Offer expiry duration before auto-expiring
- Minimum rating threshold before a provider is flagged/deactivated
- Which categories require document verification
- AI matching formula weights (e.g., 40% price / 30% distance / 20% rating / 10% ETA)
- **Escrow auto-release time window** (e.g., 48 or 72 hours after completion) *(new)*
- **Trust Score formula weights** (e.g., how much each of on-time rate, response speed, completion rate, cancellation rate, and job count contributes) *(new)*
- **Tier thresholds** — the Trust Score cutoffs for Bronze / Silver / Gold / Platinum *(new)*

### 13.2 Items to Confirm With Program/Advisor
- Whether the department requires a specific SRS/report format (e.g., IEEE template)
- Whether a proposal document or midterm checkpoint is due separately from the final defense
- Any restriction on using a third-party AI API as part of the graded deliverable

### 13.3 Future Work / Production Considerations
- Real payment gateway integration (e.g., Stripe Connect) replacing simulated payments and escrow
- Redis-backed caching and pub/sub, enabling horizontal scaling
- Containerization (Docker) and orchestration for production deployment
- Native mobile apps (React Native)
- Real push notifications (Firebase Cloud Messaging) and SMS/WhatsApp integration
- Multi-language / RTL support and multi-currency handling
- Formal legal review of Provider worker-classification and platform liability
- **Machine-learned Trust Score** — replacing the deterministic formula with a model trained on outcome data, once enough historical data exists *(new, long-term)*
- **AI Smart Assistant fine-tuning** — using accumulated job/category data to improve category-identification accuracy over time *(new, long-term)*
