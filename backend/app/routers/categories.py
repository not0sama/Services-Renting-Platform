"""Category router — admin writes, all roles read (FR-8, FR-9, FR-10, FR-11, FR-12)."""
from typing import List

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user, require_role
from app.db.session import get_session
from app.models.user import User
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryOut
from app.services import category_service

router = APIRouter(prefix="/categories", tags=["Categories"])


@router.get("", response_model=List[CategoryOut], summary="Get category tree")
async def get_categories(db: AsyncSession = Depends(get_session)):
    return await category_service.get_tree(db)


@router.get("/{category_id}", response_model=CategoryOut, summary="Get a category")
async def get_category(category_id: int, db: AsyncSession = Depends(get_session)):
    cat = await category_service.get_by_id(db, category_id)
    return CategoryOut.model_validate(cat)


@router.post("", response_model=CategoryOut, status_code=status.HTTP_201_CREATED, summary="Create category (admin)")
async def create_category(
    data: CategoryCreate,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_role("admin")),
):
    cat = await category_service.create(db, data)
    return CategoryOut.model_validate(cat)


@router.patch("/{category_id}", response_model=CategoryOut, summary="Update category (admin)")
async def update_category(
    category_id: int,
    data: CategoryUpdate,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_role("admin")),
):
    cat = await category_service.update(db, category_id, data)
    return CategoryOut.model_validate(cat)


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Deactivate category (admin)")
async def delete_category(
    category_id: int,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_role("admin")),
):
    await category_service.delete(db, category_id)
