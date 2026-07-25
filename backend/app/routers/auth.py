from typing import Annotated
from fastapi import APIRouter, Depends, status
from sqlmodel.ext.asyncio.session import AsyncSession

from app.db.session import get_session
from app.core.deps import CurrentUser
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    RefreshTokenRequest,
    TokenResponse,
    UserPublic,
    MessageResponse,
)
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["Auth"])

Session = Annotated[AsyncSession, Depends(get_session)]


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new Customer or Provider account",
)
async def register(data: RegisterRequest, session: Session):
    """
    FR-1: Register as Customer or Provider.
    NFR-20: accepted_terms must be true.
    NFR-9: Password is stored hashed (bcrypt).
    """
    user = await auth_service.register_user(data, session)
    from app.core.security import create_access_token, create_refresh_token

    token_data = {"sub": str(user.id), "role": user.role.value}
    return TokenResponse(
        access_token=create_access_token(token_data),
        refresh_token=create_refresh_token(token_data),
        user=UserPublic.model_validate(user),
    )


@router.post("/login", response_model=TokenResponse, summary="Log in and receive JWT tokens")
async def login(data: LoginRequest, session: Session):
    """FR-2: Secure login returning access + refresh tokens."""
    access_token, refresh_token, user = await auth_service.login_user(data, session)
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserPublic.model_validate(user),
    )


@router.post("/refresh", response_model=TokenResponse, summary="Refresh the access token")
async def refresh(data: RefreshTokenRequest, session: Session):
    """Issue a new access token using a valid refresh token."""
    access_token, refresh_token, user = await auth_service.refresh_access_token(
        data.refresh_token, session
    )
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserPublic.model_validate(user),
    )


@router.post("/logout", response_model=MessageResponse, summary="Log out (client-side)")
async def logout():
    """
    FR-2: Logout. Since we use stateless JWTs, the client simply discards tokens.
    In Phase 2 we can add a token blocklist for stricter invalidation.
    """
    return MessageResponse(message="Logged out successfully.")


@router.get("/me", response_model=UserPublic, summary="Get the current authenticated user")
async def get_me(current_user: CurrentUser):
    """Return the authenticated user's profile."""
    return UserPublic.model_validate(current_user)


@router.post(
    "/forgot-password",
    response_model=MessageResponse,
    summary="Request a password reset code",
)
async def forgot_password(data: ForgotPasswordRequest, session: Session):
    """
    FR-3: Sends a 6-digit reset code.
    In DEV mode the code is printed to the console log.
    Always returns 200 to avoid email enumeration.
    """
    await auth_service.request_password_reset(data.email, session)
    return MessageResponse(
        message="If that email is registered, a reset code has been sent. Check the server logs in development."
    )


@router.post("/reset-password", response_model=MessageResponse, summary="Reset password with code")
async def reset_password(data: ResetPasswordRequest, session: Session):
    """FR-3: Verify the reset code and set the new password."""
    await auth_service.reset_password(data.email, data.code, data.new_password, session)
    return MessageResponse(message="Password reset successfully. Please log in with your new password.")
