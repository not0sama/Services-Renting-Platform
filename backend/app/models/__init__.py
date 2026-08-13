# Import all models so Alembic can discover them for autogenerate.
# Order matters for readability, not for FK resolution (Alembic handles that).

from app.models.user import User, Address, UserRole, LanguagePref  # noqa: F401
from app.models.category import Category, BookingMode  # noqa: F401
from app.models.provider import (  # noqa: F401
    ProviderProfile, ProviderCategory, Document,
    VerificationStatus, ProviderTier, DocumentType,
)
from app.models.service import Service, Availability  # noqa: F401
from app.models.job import JobRequest, Offer, JobStatus, OfferStatus  # noqa: F401
from app.models.booking import Booking, BookingStatus, BookingType, VALID_TRANSITIONS  # noqa: F401
from app.models.payment import Payment, PaymentStatus  # noqa: F401
from app.models.review import Review  # noqa: F401
from app.models.notification import Notification, NotificationType  # noqa: F401
from app.models.audit import AuditLog, Favorite  # noqa: F401
# Phase 2 models
from app.models.dispute import Dispute, DisputeStatus  # noqa: F401
from app.models.message import Message, ProviderLocation  # noqa: F401
from app.models.report import Report, ReportStatus  # noqa: F401
from app.models.announcement import Announcement, TargetRole  # noqa: F401
