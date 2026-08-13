# Hiring & Renting Platform — Monorepo

A full-stack multi-service marketplace for hiring and renting workers and services.
Built as a graduation project with a 16-week development plan.

---

## Stack

| Layer | Choice |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS + shadcn/ui |
| Backend | FastAPI (Python), modular monolith |
| Database | PostgreSQL |
| AI | Google Gemini API |
| Maps | Leaflet.js + OpenStreetMap |
| Payments | Simulated escrow system |

---

## Local Setup

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL 15+

### 1. Clone and install

```bash
git clone <repo-url>
cd hiring-renting-platform
```

### 2. Backend

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env — set DATABASE_URL, JWT_SECRET, GEMINI_API_KEY

# Run database migrations
alembic upgrade head

# Start the server
uvicorn app.main:app --reload --port 8000
```

API docs available at: http://localhost:8000/docs

### 3. Frontend

```bash
cd frontend

# Install dependencies (already done)
npm install

# Configure environment (already done)
# NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

# Start dev server
npm run dev
```

App available at: http://localhost:3000

---

## Demo Accounts

Run the seed script to populate test data:
```bash
cd backend && venv/bin/python -m app.seed
```

Demo credentials (all passwords: `password123`):
- Customer: `customer@platform.com` (or `sara@hirerent.com`) / `password123`
- Provider: `provider@platform.com` (Platinum tier) / `password123`  
- Admin: `admin@platform.com` (Super Admin) / `password123`

---

## Project Structure

```
hiring-renting-platform/
├── backend/          # FastAPI modular monolith
│   ├── app/
│   │   ├── core/     # config, security, deps, exceptions
│   │   ├── db/       # engine, session
│   │   ├── models/   # SQLModel table definitions
│   │   ├── schemas/  # Pydantic request/response DTOs
│   │   ├── routers/  # API route handlers
│   │   ├── services/ # Business logic layer
│   │   ├── ai/       # Gemini API client
│   │   └── tasks/    # Escrow auto-release scheduler
│   └── alembic/      # Database migrations
├── frontend/         # Next.js 14 App Router
│   └── src/
│       ├── app/      # Pages (public, customer, provider, admin)
│       ├── context/  # AuthContext
│       ├── lib/      # API client, auth storage, i18n
│       └── types/    # TypeScript type definitions
└── Docs/             # Project documentation
```

---

## Development Phases

See [DEVELOPMENT_TRACKER.md](Docs/DEVELOPMENT_TRACKER.md) for full progress tracking.

| Phase | Weeks | Focus |
|---|---|---|
| Phase 0 | 1–2 | Foundation & Auth ✅ |
| Phase 1 | 3–8 | Core Marketplace MVP |
| Phase 2 | 9–11 | AI + Escrow + Reputation |
| Phase 3 | 12–13 | Testing & Polish |
| Phase 4 | 14–15 | Documentation |
| Phase 5 | 16 | Defense Prep |
