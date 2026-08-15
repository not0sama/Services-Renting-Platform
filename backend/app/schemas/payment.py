from typing import Optional
from datetime import datetime
from pydantic import BaseModel
from app.models.payment import PaymentStatus


class CheckoutCreate(BaseModel):
    booking_id: int
    payment_method: Optional[str] = "card"


class PaymentOut(BaseModel):
    id: int
    booking_id: int
    gross_amount: float
    commission_pct: float
    commission_amount: float
    net_amount: float
    status: PaymentStatus
    payment_method: Optional[str] = "card"
    auto_release_at: Optional[datetime]
    released_at: Optional[datetime]
    invoice_number: str
    created_at: datetime

    model_config = {"from_attributes": True}


class InvoiceOut(BaseModel):
    invoice_number: str
    booking_id: int
    customer_name: str
    provider_name: str
    service_title: str
    gross_amount: float
    commission_amount: float
    net_amount: float
    status: PaymentStatus
    created_at: datetime


class EarningOut(BaseModel):
    """Provider earnings line item."""
    invoice_number: str
    booking_id: int
    customer_name: str
    service_title: str
    gross_amount: float
    commission_amount: float
    net_amount: float
    status: PaymentStatus
    released_at: Optional[datetime]
    created_at: datetime
