import random
import string
import logging
from datetime import datetime, timedelta, timezone
from typing import Optional

from sqlmodel import select, func
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
    validate_password_strength,
)
from app.core.exceptions import (
    ConflictException,
    UnauthorizedException,
    BadRequestException,
    NotFoundException,
)
from app.models.user import User, UserRole
from app.schemas.auth import RegisterRequest, LoginRequest
from app.core.config import settings

logger = logging.getLogger(__name__)


async def register_user(data: RegisterRequest, session: AsyncSession) -> User:
    """Register a new customer or provider account."""
    # Prevent admin self-registration
    if data.role == UserRole.admin:
        raise BadRequestException("Admin accounts cannot be self-registered.")

    clean_email = data.email.strip().lower()

    # Check email uniqueness (case-insensitive)
    existing = await session.exec(select(User).where(func.lower(User.email) == clean_email))
    if existing.first():
        raise ConflictException(f"An account with email '{clean_email}' already exists.")

    # Validate password strength
    if not validate_password_strength(data.password):
        raise BadRequestException(
            "Password must be at least 8 characters with 1 uppercase letter and 1 number."
        )

    # Handle optional referral code
    referred_by_id: Optional[int] = None
    if data.referral_code:
        ref_user = (await session.exec(
            select(User).where(User.referral_code == data.referral_code.strip().upper())
        )).first()
        if ref_user:
            referred_by_id = ref_user.id

    # Generate unique referral code for the new user
    import secrets
    my_ref_code = secrets.token_hex(4).upper()

    user = User(
        name=data.name,
        email=clean_email,
        phone=data.phone,
        role=data.role,
        language_pref=data.language_pref,
        password_hash=hash_password(data.password),
        accepted_terms=data.accepted_terms,
        referral_code=my_ref_code,
        referred_by_id=referred_by_id,
        is_active=True,
    )
    session.add(user)
    await session.flush()  # get the id before commit

    if data.role.value == "provider":
        from app.services.provider_service import get_or_create_profile
        await get_or_create_profile(session, user.id)

    logger.info(f"New {data.role.value} registered: {clean_email} (id={user.id}, ref={my_ref_code})")
    return user


async def login_user(data: LoginRequest, session: AsyncSession) -> tuple[str, str, User]:
    """Authenticate a user, return (access_token, refresh_token, user)."""
    clean_email = data.email.strip().lower()
    result = await session.exec(select(User).where(func.lower(User.email) == clean_email))
    user = result.first()

    if not user or not verify_password(data.password, user.password_hash):
        raise UnauthorizedException("Invalid email or password.")

    if not user.is_active:
        raise UnauthorizedException("This account has been deactivated.")

    token_data = {"sub": str(user.id), "role": user.role.value}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    logger.info(f"User logged in: {user.email} (role={user.role.value})")
    return access_token, refresh_token, user


async def refresh_access_token(refresh_token: str, session: AsyncSession) -> tuple[str, str, User]:
    """Issue a new access token using a valid refresh token."""
    from jose import JWTError

    try:
        payload = decode_token(refresh_token)
        if payload.get("type") != "refresh":
            raise UnauthorizedException("Invalid token type.")
        user_id = int(payload.get("sub"))
    except (JWTError, ValueError, TypeError):
        raise UnauthorizedException("Invalid or expired refresh token.")

    user = await session.get(User, user_id)
    if not user or not user.is_active:
        raise UnauthorizedException("User not found or deactivated.")

    token_data = {"sub": str(user.id), "role": user.role.value}
    new_access = create_access_token(token_data)
    new_refresh = create_refresh_token(token_data)
    return new_access, new_refresh, user


def _generate_reset_code(length: int = 6) -> str:
    return "".join(random.choices(string.digits, k=length))


async def request_password_reset(email: str, session: AsyncSession) -> str:
    """
    Generate and store a 6-digit reset code.
    In development the code is returned (logged to console).
    In production this would send an email/SMS.
    """
    clean_email = email.strip().lower()
    result = await session.exec(select(User).where(func.lower(User.email) == clean_email))
    user = result.first()

    # Always return success to avoid email enumeration
    if not user:
        logger.info(f"Password reset requested for unknown email: {clean_email}")
        return ""

    code = _generate_reset_code()
    user.password_reset_code = code
    user.password_reset_expires = datetime.now(timezone.utc) + timedelta(minutes=30)
    session.add(user)

    # DEV: log the code to console (no email service configured)
    logger.warning(f"[DEV] Password reset code for {clean_email}: {code}")
    return code


async def reset_password(email: str, code: str, new_password: str, session: AsyncSession) -> None:
    """Verify reset code and update the user's password."""
    clean_email = email.strip().lower()
    result = await session.exec(select(User).where(func.lower(User.email) == clean_email))
    user = result.first()

    invalid_msg = "Invalid or expired reset code."
    if not user or not user.password_reset_code:
        raise BadRequestException(invalid_msg)

    # Check code and expiry
    now = datetime.now(timezone.utc)
    expires = user.password_reset_expires
    if expires and expires.tzinfo is None:
        expires = expires.replace(tzinfo=timezone.utc)

    if user.password_reset_code != code or not expires or now > expires:
        raise BadRequestException(invalid_msg)

    if not validate_password_strength(new_password):
        raise BadRequestException(
            "Password must be at least 8 characters with 1 uppercase letter and 1 number."
        )

    user.password_hash = hash_password(new_password)
    user.password_reset_code = None
    user.password_reset_expires = None
    user.updated_at = now
    session.add(user)
    logger.info(f"Password reset successful for: {email}")
