from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, status
from pydantic import BaseModel
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.core.deps import get_current_user, require_role
from app.core.exceptions import AppException
from app.models.user import User
from app.models.report import Report, ReportStatus

router = APIRouter(tags=["Safety & Reports"])


class ReportCreate(BaseModel):
    reported_user_id: int
    booking_id: Optional[int] = None
    reason: str
    details: Optional[str] = None


class ReportOut(BaseModel):
    id: int
    reporter_id: int
    reported_user_id: int
    booking_id: Optional[int]
    reason: str
    details: Optional[str]
    status: ReportStatus
    admin_notes: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


@router.post("/reports", response_model=ReportOut, status_code=status.HTTP_201_CREATED, summary="Submit safety report (FR-47)")
async def create_report(
    data: ReportCreate,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    if data.reported_user_id == current_user.id:
        raise AppException(status.HTTP_400_BAD_REQUEST, "INVALID_REPORT", "You cannot report yourself.")

    report = Report(
        reporter_id=current_user.id,
        reported_user_id=data.reported_user_id,
        booking_id=data.booking_id,
        reason=data.reason,
        details=data.details,
    )
    db.add(report)
    await db.commit()
    await db.refresh(report)
    return report


@router.get("/admin/reports", response_model=List[ReportOut], summary="Admin list safety reports (FR-47)")
async def admin_list_reports(
    db: AsyncSession = Depends(get_session),
    admin_user: User = Depends(require_role("admin")),
):
    result = await db.execute(select(Report).order_by(Report.created_at.desc()))
    return list(result.scalars().all())


@router.patch("/admin/reports/{report_id}", response_model=ReportOut, summary="Admin resolve safety report")
async def admin_resolve_report(
    report_id: int,
    status_update: ReportStatus,
    admin_notes: Optional[str] = None,
    db: AsyncSession = Depends(get_session),
    admin_user: User = Depends(require_role("admin")),
):
    report = await db.get(Report, report_id)
    if not report:
        raise AppException(status.HTTP_404_NOT_FOUND, "NOT_FOUND", "Report not found.")

    report.status = status_update
    if admin_notes:
        report.admin_notes = admin_notes
    report.updated_at = datetime.utcnow()

    db.add(report)
    await db.commit()
    await db.refresh(report)
    return report
