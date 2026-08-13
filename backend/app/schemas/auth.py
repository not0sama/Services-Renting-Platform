from typing import Optional
from pydantic import BaseModel, EmailStr, field_validator
from app.models.user import UserRole, LanguagePref


# ── Requests ──────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    password: str
    role: UserRole
    language_pref: LanguagePref = LanguagePref.en
    accepted_terms: bool
    referral_code: Optional[str] = None

    @field_validator("accepted_terms")
    @classmethod
    def must_accept_terms(cls, v: bool) -> bool:
        if not v:
            raise ValueError("You must accept the Terms of Service to register.")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    code: str
    new_password: str


class RefreshTokenRequest(BaseModel):
    refresh_token: str


# ── Responses ─────────────────────────────────────────────────────────────────

class UserPublic(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str]
    role: UserRole
    language_pref: LanguagePref
    is_active: bool
    accepted_terms: bool
    referral_code: Optional[str] = None

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserPublic


class MessageResponse(BaseModel):
    message: str
