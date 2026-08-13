from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # App
    APP_NAME: str = "Hiring & Renting Platform"
    ENV: str = "development"
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:password@localhost:5432/hiring_renting"

    # JWT
    JWT_SECRET: str = "change-me-in-production-use-a-long-random-string"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # AI — Google Gemini
    GEMINI_API_KEY: str = "AIzaSyBkehNgBponQCJFrn-sKckFrASEDVksCWY"
    GEMINI_MODEL: str = "gemini-2.5-flash"

    # File Storage
    UPLOAD_DIR: str = "./uploads"
    MAX_UPLOAD_SIZE_MB: int = 10

    # CORS
    CORS_ORIGINS: str = "http://localhost:3000"

    # Business Rules
    AUTO_RELEASE_HOURS: int = 72
    URGENT_SURCHARGE_PERCENT: float = 25.0
    OFFER_EXPIRY_DAYS: int = 7
    CANCELLATION_FREE_WINDOW_HOURS: int = 24
    CANCELLATION_FEE_PERCENT: float = 10.0
    FLAT_COMMISSION_RATE: float = 0.15

    # Best-match weights: price, distance, rating, ETA
    BEST_MATCH_WEIGHTS: str = "0.4,0.3,0.2,0.1"

    # Trust score weights: rating, on_time, completion, response, cancellation_inverted
    TRUST_SCORE_WEIGHTS: str = "0.3,0.25,0.2,0.15,0.1"

    # Tier thresholds (Bronze<50, Silver<70, Gold<85, Platinum>=85)
    TIER_THRESHOLDS: str = "50,70,85"

    # Tiered commission: min:max:rate,...
    COMMISSION_TIERS: str = "0:500:0.20,501:2000:0.15,2001:999999:0.10"

    # Scheduler
    SCHEDULER_POLL_SECONDS: int = 300

    # Security
    MIN_PASSWORD_LENGTH: int = 8

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    @property
    def best_match_weights_list(self) -> list[float]:
        return [float(w) for w in self.BEST_MATCH_WEIGHTS.split(",")]

    @property
    def trust_score_weights_list(self) -> list[float]:
        return [float(w) for w in self.TRUST_SCORE_WEIGHTS.split(",")]

    @property
    def tier_thresholds_list(self) -> list[float]:
        return [float(t) for t in self.TIER_THRESHOLDS.split(",")]

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
