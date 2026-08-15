from sqlmodel import SQLModel
from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine
from app.core.config import settings

engine: AsyncEngine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    future=True,
)


async def init_db() -> None:
    """Create all tables (used in development; production uses Alembic)."""
    from sqlalchemy import text
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
        await conn.execute(text("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_method VARCHAR(20) DEFAULT 'card';"))
        await conn.execute(text("ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_method VARCHAR(20) DEFAULT 'card';"))
        await conn.execute(text("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS location_address VARCHAR(500);"))
        await conn.execute(text("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS latitude FLOAT;"))
        await conn.execute(text("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS longitude FLOAT;"))
