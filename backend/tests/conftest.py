import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlmodel import SQLModel
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from app.main import app
from app.db.session import get_session

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

engine = create_async_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    future=True
)
TestingSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False
)

@pytest_asyncio.fixture(scope="session", autouse=True)
async def init_test_db():
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.drop_all)

@pytest_asyncio.fixture(scope="function")
async def session():
    async with TestingSessionLocal() as session:
        yield session

@pytest_asyncio.fixture(scope="function")
async def client(session: AsyncSession):
    async def override_get_session():
        yield session

    app.dependency_overrides[get_session] = override_get_session
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://testserver"
    ) as c:
        yield c
    app.dependency_overrides.clear()

@pytest_asyncio.fixture(scope="function")
async def auth_client_factory(client: AsyncClient, session: AsyncSession):
    from app.models.user import User, UserRole
    from app.core.security import hash_password
    import uuid
    
    async def _factory(role: str) -> AsyncClient:
        # Create a unique user for this client
        email = f"{role}_{uuid.uuid4().hex[:8]}@example.com"
        password = "Password123!"
        user = User(
            name=f"Test {role.capitalize()}",
            email=email,
            phone=f"12345678{uuid.uuid4().hex[:2]}",
            role=UserRole(role),
            language_pref="en",
            password_hash=hash_password(password),
            accepted_terms=True,
            is_active=True,
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)

        # Login to get token
        response = await client.post("/api/v1/auth/login", json={"email": email, "password": password})
        token = response.json()["access_token"]
        
        # Create a new authenticated client
        async def override_get_session():
            yield session
            
        app.dependency_overrides[get_session] = override_get_session
        c = AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://testserver",
            headers={"Authorization": f"Bearer {token}"}
        )
        return c

    return _factory

@pytest_asyncio.fixture(scope="function")
async def customer_client(auth_client_factory) -> AsyncClient:
    client = await auth_client_factory("customer")
    yield client
    await client.aclose()
    
@pytest_asyncio.fixture(scope="function")
async def provider_client(auth_client_factory) -> AsyncClient:
    client = await auth_client_factory("provider")
    yield client
    await client.aclose()

@pytest_asyncio.fixture(scope="function")
async def admin_client(auth_client_factory) -> AsyncClient:
    client = await auth_client_factory("admin")
    yield client
    await client.aclose()
