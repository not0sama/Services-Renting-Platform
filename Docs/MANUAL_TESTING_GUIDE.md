# End-to-End Manual Testing Guide

**Project:** Multi-Service Hiring & Renting Platform  
**Target Application:** Frontend (`http://localhost:3000`), Backend API (`http://localhost:8000`)  
**Specification References:** [`Docs/Project_Documentation.md`](file:///Users/osama/Desktop/Hiring%20&%20Renting%20Platform/Docs/Project_Documentation.md), [`Docs/REQUIREMENTS_IMPLEMENTATION_TRACKER.md`](file:///Users/osama/Desktop/Hiring%20&%20Renting%20Platform/Docs/REQUIREMENTS_IMPLEMENTATION_TRACKER.md)  
**Date:** August 2026  

---

## 🛠 1. Environment & Prerequisites Setup

### 1.1 Start Backend API Server
```bash
cd "backend"
venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
- **Health Check**: Open `http://127.0.0.1:8000/health` in your browser. Result should be `{"status":"ok","version":"0.1.0"}`.
- **Swagger Documentation**: Open `http://127.0.0.1:8000/docs` to inspect interactive API docs.

### 1.2 Start Frontend Application
```bash
cd "frontend"
npm run dev
```
- Open `http://localhost:3000` in your web browser.

### 1.3 Pre-Seeded Test Credentials
The system contains pre-seeded test accounts for instant manual testing:

| User Type | Email | Password | Role / Account Details |
| :--- | :--- | :--- | :--- |
| **Customer** | `customer@platform.com` | `Password123` | Active customer with bookings history |
| **Provider (Platinum)** | `provider@platform.com` | `Password123` | Gold/Platinum Plumbing & Repair Provider |
| **Provider (Silver)** | `provider2@platform.com` | `Password123` | Silver Tier Verified Provider |
| **Admin** | `admin@platform.com` | `Password123` | Platform Super Admin |

---

## 🚀 2. Manual Test Suites & Step-by-Step Scenarios

---

### Module 1: Public Landing Page & Dual-Path Chooser

#### Test Scenario 1.1: Landing Hero & Language Toggle
- **URL**: `http://localhost:3000`
- **Steps**:
  1. Navigate to `http://localhost:3000`.
  2. Verify top Navigation Bar displays logo, links ("Browse Services", "How it Works"), Language Switcher (`EN | العربية`), and Login/Register buttons.
  3. Click **العربية** in the top navigation bar.
  4. **Expected Result**: Page text switches to Arabic immediately while maintaining LTR structural layout. Numerals remain in standard Western digits (`10,000+`, `LYD 280`).
  5. Click **English** to return to English copy.

#### Test Scenario 1.2: Dual-Path Chooser Hero Component
- **URL**: `http://localhost:3000`
- **Steps**:
  1. Observe the Split Hero Card.
  2. Left Panel: **Instant Book** (Fixed price, instant slot confirmation).
  3. Right Panel: **Custom Quote** (Post job details, receive competitive provider bids).
  4. Click **Instant Book** -> Redirects to Service Categories browse page.
  5. Return to Home and click **Custom Quote** -> Redirects to Job Posting page.

---

### Module 2: Authentication, Role-Based Guards & Referrals (FR-1 – FR-5, FR-58)

#### Test Scenario 2.1: Register New Customer Account & Referral Code
- **URL**: `http://localhost:3000/register`
- **Steps**:
  1. Click **Get Started** / navigate to `/register`.
  2. Select role tab: **I need a service**.
  3. Fill form:
     - Full Name: `Test Customer`
     - Email: `testcust101@example.com`
     - Password: `Password123`
     - Confirm Password: `Password123`
     - Referral Code: `HR789X` (Optional referral code test)
     - Check **I accept the Terms of Service & Privacy Policy**.
  4. Click **Create Account**.
  5. **Expected Result**: Account created, JWT tokens issued, redirected to Customer Dashboard (`/customer`).

#### Test Scenario 2.2: Verify Referral Program in Customer Settings (FR-58)
- **URL**: `http://localhost:3000/customer/settings`
- **Steps**:
  1. Logged in as customer, navigate to **Settings** (`/customer/settings`).
  2. Scroll down to **🎁 Referral Program (FR-58)**.
  3. Verify unique referral code (e.g. `A1B2C3D4`) and copyable referral link `http://localhost:3000/register?ref=...`.
  4. Click **Copy Link** -> Toast confirms link copied to clipboard.

#### Test Scenario 2.3: Role Guards Protection (FR-4)
- **URL**: `http://localhost:3000/admin`
- **Steps**:
  1. Logged in as Customer (`customer@platform.com`), type `http://localhost:3000/admin` in address bar.
  2. **Expected Result**: Blocked from admin panel, redirected automatically to `/login` or customer home.

---

### Module 3: Provider Onboarding & Document Verification (FR-6, FR-7, FR-46)

#### Test Scenario 3.1: Multi-Step Provider Onboarding Wizard
- **URL**: `http://localhost:3000/register?role=provider`
- **Steps**:
  1. Register a new Provider: `newprovider@example.com` / `Password123`.
  2. Redirected to Provider Onboarding (`/provider/onboarding`).
  3. **Step 1 (Personal Info)**: Enter Bio, Years of Experience (e.g., `5`), Service Radius (`25 km`), City (`Riyadh`). Click Next.
  4. **Step 2 (Categories & Skills)**: Select Plumbing / Electrical. Click Next.
  5. **Step 3 (Document Upload)**: Upload National ID / Commercial Register mock file. Click Submit Verification.
  6. **Expected Result**: Verification status set to `pending`. Dashboard displays "Verification Pending Admin Review" banner.

#### Test Scenario 3.2: Admin Verification Document Review & Approval (FR-7)
- **URL**: `http://localhost:3000/admin/providers`
- **Steps**:
  1. Log out, log in as Admin (`admin@platform.com` / `Password123`).
  2. Navigate to Admin Providers list (`/admin/providers`).
  3. Locate `newprovider@example.com` under **Pending Approvals**.
  4. Review uploaded document links and click **Approve Application**.
  5. **Expected Result**: Provider status changes to `approved`. Provider profile displays the **Verified Badge** (FR-46).

---

### Module 4: Flagship Feature: AI Smart Assistant (FR-59 – FR-62)

#### Test Scenario 4.1: Natural Language Problem Analysis & Matching
- **URL**: `http://localhost:3000/customer/ai-assist`
- **Steps**:
  1. Log in as Customer (`customer@platform.com`).
  2. Navigate to **AI Smart Assist** (`/customer/ai-assist`).
  3. In the free-text description box, type:  
     `"My kitchen sink is leaking heavily under the cabinet and water is dripping on the wooden floor."`
  4. Click **Analyze & Match Providers** (`تحليل ومطابقة المحترفين`).
  5. **Expected Result** (Live Google Gemini 2.5 Flash execution):
     - **AI Badge**: `AI Generated · 95% confidence`
     - **Detected Service Category**: `Plumbing Services`
     - **Estimated Cost & Duration**: `LYD 200–500` (90 min est.)
     - **Professional Job Rewrite**: *"Kitchen sink leak repair. Water is dripping from under the cabinet onto the floor, requiring immediate attention."*
     - **Top Matched Providers**: Ranked #1 Platinum, #2 Gold, #3 Gold.
  6. Click **Post as Job Request** -> Auto-populates job posting form with AI generated details.

---

### Module 5: Custom Quote & Bidding Loop (FR-13 – FR-20)

#### Test Scenario 5.1: Customer Post Custom Job Request (+ Urgent Surcharge)
- **URL**: `http://localhost:3000/customer/jobs/new`
- **Steps**:
  1. Select Category: `Plumbing`.
  2. Title: `Emergency Water Pipe Leak Repair`.
  3. Description: `Pipe leaking in master bathroom.`
  4. Budget Range: `LYD 150 - 300`.
  5. Toggle **Urgent Request (+25% surcharge preview)** ON (FR-14).
  6. Click **Post Job Request**.
  7. **Expected Result**: Job created with status `open`.

#### Test Scenario 5.2: Provider Submit Bidding Offer & Best Match Calculation (FR-17, FR-20)
- **URL**: `http://localhost:3000/provider/jobs`
- **Steps**:
  1. Log in as Provider (`provider@platform.com`).
  2. Navigate to Open Jobs Feed (`/provider/jobs`).
  3. Click on the open job `Emergency Water Pipe Leak Repair`.
  4. Submit Bidding Offer:
     - Price: `LYD 250`
     - Estimated Arrival Time: `30 minutes`
     - Estimated Completion: `1 hour`
     - Message: `I am nearby in Riyadh with full repair equipment.`
  5. Click **Submit Offer**.
  6. Log in as Customer (`customer@platform.com`) and open the job details page.
  7. **Expected Result**: Offers list displays the submitted bid side-by-side with an auto-calculated **Best Match** badge detailing weighted score reasoning (Price 40%, Distance 30%, Rating 20%, ETA 10%).

---

### Module 6: Instant Booking & Availability Calendar (FR-21 – FR-24)

#### Test Scenario 6.1: Provider Service Package & Availability Setup
- **URL**: `http://localhost:3000/provider/services`
- **Steps**:
  1. Log in as Provider (`provider@platform.com`).
  2. Create Fixed-Price Service Package:
     - Title: `Standard Drain Unclogging`
     - Price: `LYD 180`
     - Duration: `60 mins`
  3. Navigate to Availability Calendar (`/provider/availability`).
  4. Set Working Hours (Mon–Fri, 08:00–18:00) and block unavailable dates.

#### Test Scenario 6.2: Customer Instant Booking & Collision Prevention (FR-23, FR-24)
- **URL**: `http://localhost:3000/customer/categories`
- **Steps**:
  1. Log in as Customer, browse Instant Book packages.
  2. Select `Standard Drain Unclogging`.
  3. Choose date & available time slot (e.g., Tomorrow at 10:00 AM).
  4. Click **Confirm & Pay Escrow**.
  5. **Expected Result**: Booking created directly in `confirmed` status. The selected 10:00 AM slot is locked to prevent double-booking collisions (FR-24).

---

### Module 7: Booking Lifecycle & Live Tracking (FR-28 – FR-31, FR-42)

#### Test Scenario 7.1: Provider Job Lifecycle Status Progression
- **URL**: `http://localhost:3000/provider/bookings/active`
- **Steps**:
  1. Log in as Provider (`provider@platform.com`).
  2. Open Active Job dashboard.
  3. Update status: Click **Start Journey (En Route)**.
  4. Update status: Click **Arrived & Start Work (In Progress)**.
  5. Update status: Click **Mark Job Completed**.
  6. **Expected Result**: Booking status advances: `Confirmed` -> `En Route` -> `In Progress` -> `Completed`.

#### Test Scenario 7.2: Live Provider Location Map Tracking (FR-42)
- **URL**: `http://localhost:3000/customer/bookings/[id]`
- **Steps**:
  1. While job status is `En Route`, log in as Customer.
  2. Open the active booking detail page.
  3. **Expected Result**: Interactive Map (`MapTracker`) renders provider's live GPS coordinates moving toward customer location.

---

### Module 8: Flagship Feature: Escrow Decision Panel & Auto-Release (FR-35 – FR-38, FR-63 – FR-65)

#### Test Scenario 8.1: Escrow Decision Panel (Accept / Revision / Dispute) (FR-63)
- **URL**: `http://localhost:3000/escrow-demo` or `http://localhost:3000/customer/bookings/escrow-demo`
- **Steps**:
  1. Open the Escrow Decision Panel after provider marks job completed.
  2. Observe Header context card displaying invoice number, provider tier, category, and held payment status (`LYD 280 Held`).
  3. Test **Request Revision** flow (FR-65):
     - Click **Request Revision**.
     - Enter reason: `"The drain is still leaking slightly around the main joint."`
     - Click Submit. Status changes to **Revision Requested**.
  4. Test Provider Resubmission: Log in as Provider, click **Resubmit Work as Completed**.
  5. Test **Accept & Release Payment**:
     - Customer returns to Escrow Panel.
     - Click **Accept Work & Release Payment**.
     - **Expected Result**: Held funds released to provider. Invoice receipt generated.

#### Test Scenario 8.2: Auto-Release Timer & Caution State (FR-64)
- **URL**: `http://localhost:3000/escrow-demo`
- **Steps**:
  1. Observe the top countdown bar (*"Payment auto-releases in 71h 59m"*).
  2. Test Caution Mode (< 4 hours remaining):
     - Click dev test button **"Click to test < 4h Caution Mode"**.
     - **Expected Result**: Countdown bar turns caution-red (`#EF4444`), drain progress bar updates, and text changes to `⚠ Auto-releases soon: 3h 45m remaining`.

---

### Module 9: Reviews, Rating & Reputation Trust Score (FR-43 – FR-46, FR-66 – FR-68)

#### Test Scenario 9.1: Multi-Criteria Review Submission (FR-43)
- **URL**: `http://localhost:3000/customer/bookings/[id]/review`
- **Steps**:
  1. Post completion, Customer opens review form.
  2. Rate Quality (5/5), Punctuality (5/5), Communication (4/5).
  3. Enter comment: `"Great work! Clean and professional."`
  4. Submit review.

#### Test Scenario 9.2: Provider Public Response & Incremental Trust Score Recalculation (FR-44, FR-67, FR-68, NFR-23)
- **URL**: `http://localhost:3000/provider/reviews`
- **Steps**:
  1. Log in as Provider, open `/provider/reviews`.
  2. Click **Respond to Review**, enter: `"Thank you for your feedback!"`.
  3. Check Provider Profile Trust Score Panel.
  4. **Expected Result**: Trust Score incrementally recalculated (e.g. 92.5) and Tier badge (**Gold / Platinum**) displayed on profile.

---

### Module 10: Admin Operations, Moderation & Announcements (FR-50 – FR-56)

#### Test Scenario 10.1: Review Moderation Panel (FR-53)
- **URL**: `http://localhost:3000/admin/reviews`
- **Steps**:
  1. Log in as Admin (`admin@platform.com`).
  2. Open `/admin/reviews`.
  3. Switch to **Flagged Reviews** tab.
  4. Test **Approve Review** (clears flagged status) or **Remove / Delete Review** (deletes post & recalculates rating).

#### Test Scenario 10.2: Platform Announcements Broadcast System (FR-55)
- **URL**: `http://localhost:3000/admin/announcements`
- **Steps**:
  1. Log in as Admin, open `/admin/announcements`.
  2. Fill form:
     - Title: `Scheduled Maintenance Notice`
     - Message: `Platform services will undergo scheduled maintenance tonight at 02:00 AM AST.`
     - Target Audience: `All Users`
  3. Click **Publish Announcement Now**.
  4. Log in as Customer (`/customer`) or Provider (`/provider`).
  5. **Expected Result**: Dynamic blue Announcement Banner displayed prominently at the top of the user dashboard.

#### Test Scenario 10.3: Scoped Admin Permissions Management (FR-56)
- **URL**: `http://localhost:3000/admin/roles`
- **Steps**:
  1. Log in as Admin, open `/admin/roles`.
  2. Select an admin account.
  3. Toggle permission scope checkboxes:
     - `User Management (FR-50)`
     - `Booking Management (FR-51)`
     - `Review Moderation (FR-53)`
     - `Dispute Resolution (FR-52)`
     - `Platform Announcements (FR-55)`
  4. Click **Save Permissions**.

---

## 📝 Summary Checklist for Defense / Demo

- [x] **Landing Page & Dual-Path Hero**: Switch EN/AR, test Instant Book vs Custom Quote choices.
- [x] **AI Smart Assistant**: Submit free-text problem, verify category detection, cost estimate, and top 3 providers.
- [x] **Bidding & Offers**: Submit provider offer, view side-by-side comparison & Best Match score.
- [x] **Live GPS Tracking**: Verify en-route map coordinates updating.
- [x] **Escrow Decision Panel**: Request revision, resubmit, test < 4h caution mode, accept and release payment.
- [x] **Reputation & Tier Badges**: Check Trust Score panel and Bronze/Silver/Gold/Platinum badges.
- [x] **Admin Governance**: Test review moderation, broadcast announcements, and scoped admin permissions.
