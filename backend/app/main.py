import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from app.core.config import settings
from app.core.exceptions import AppException
from app.db.engine import init_db

logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: startup + shutdown logic."""
    logger.info("Starting up Hiring & Renting Platform API...")
    if settings.ENV == "development":
        # In dev, auto-create tables if they don't exist (Alembic handles prod)
        await init_db()
    logger.info("Database ready.")

    # Start background scheduler for auto-release payments (FR-64)
    from app.tasks.auto_release import auto_release_loop
    task = asyncio.create_task(auto_release_loop())

    yield

    task.cancel()
    logger.info("Shutting down...")


app = FastAPI(
    title="Hiring & Renting Platform API",
    description="Multi-service marketplace for hiring and renting workers and services.",
    version="0.1.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Global Exception Handlers (NFR-7) ─────────────────────────────────────────
@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail},
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "Invalid request data.",
                "details": exc.errors(),
            }
        },
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.exception(f"Unhandled exception on {request.method} {request.url}: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"error": {"code": "INTERNAL_ERROR", "message": "An unexpected error occurred."}},
    )


# ── Health Check ──────────────────────────────────────────────────────────────
@app.get("/health", tags=["Health"], summary="Health check")
async def health_check():
    return {"status": "ok", "version": app.version, "env": settings.ENV}


# ── Routers ───────────────────────────────────────────────────────────────────
API_PREFIX = "/api/v1"

from app.routers import (  # noqa: E402
    auth as auth_router,
    categories as categories_router,
    providers as providers_router,
    services as services_router,
    jobs as jobs_router,
    bookings as bookings_router,
    payments as payments_router,
    admin as admin_router,
    ai as ai_router,
    chat as chat_router,
    disputes as disputes_router,
    favorites as favorites_router,
    location as location_router,
    reports as reports_router,
)
from app.routers.misc import reviews_router, notifications_router, users_router  # noqa: E402

app.include_router(auth_router.router, prefix=API_PREFIX)
app.include_router(categories_router.router, prefix=API_PREFIX)
app.include_router(providers_router.router, prefix=API_PREFIX)
app.include_router(services_router.router, prefix=API_PREFIX)
app.include_router(jobs_router.router, prefix=API_PREFIX)
app.include_router(bookings_router.router, prefix=API_PREFIX)
app.include_router(payments_router.router, prefix=API_PREFIX)
app.include_router(admin_router.router, prefix=API_PREFIX)
app.include_router(reviews_router, prefix=API_PREFIX)
app.include_router(notifications_router, prefix=API_PREFIX)
app.include_router(users_router, prefix=API_PREFIX)
app.include_router(ai_router.router, prefix=API_PREFIX)
app.include_router(chat_router.router, prefix=API_PREFIX)
app.include_router(disputes_router.router, prefix=API_PREFIX)
app.include_router(favorites_router.router, prefix=API_PREFIX)
app.include_router(location_router.router, prefix=API_PREFIX)
app.include_router(reports_router.router, prefix=API_PREFIX)
