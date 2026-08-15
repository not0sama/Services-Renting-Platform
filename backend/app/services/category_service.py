"""
Category service — CRUD + category tree builder (FR-8, FR-9, FR-10, FR-11, FR-12).
"""
from typing import List, Optional, Any
from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryOut
from app.core.exceptions import AppException
from fastapi import status


async def get_tree(db: AsyncSession, parent_id: Optional[int] = None) -> List[CategoryOut]:
    """Return categories as a nested tree."""
    result = await db.execute(
        select(Category)
        .where(Category.parent_id == parent_id, Category.is_active == True)
        .order_by(Category.sort_order, Category.name_en)
    )
    cats = result.scalars().all()
    tree = []
    for cat in cats:
        cat_out = CategoryOut.model_validate(cat)
        cat_out.children = await get_tree(db, parent_id=cat.id)
        tree.append(cat_out)
    return tree


async def get_all_flat(db: AsyncSession) -> List[Category]:
    result = await db.execute(select(Category).order_by(Category.sort_order, Category.name_en))
    return list(result.scalars().all())


async def get_by_id(db: AsyncSession, category_id: int) -> Category:
    cat = await db.get(Category, category_id)
    if not cat:
        raise AppException(status.HTTP_404_NOT_FOUND, "CATEGORY_NOT_FOUND", "Category not found.")
    return cat


async def create(db: AsyncSession, data: CategoryCreate) -> Category:
    # Check slug uniqueness
    existing = await db.execute(select(Category).where(Category.slug == data.slug))
    if existing.scalar_one_or_none():
        raise AppException(status.HTTP_409_CONFLICT, "SLUG_TAKEN", "A category with this slug already exists.")

    cat = Category(**data.model_dump())
    db.add(cat)
    await db.commit()
    await db.refresh(cat)
    return cat


async def update(db: AsyncSession, category_id: int, data: CategoryUpdate) -> Category:
    cat = await get_by_id(db, category_id)
    update_data = data.model_dump(exclude_none=True)
    for k, v in update_data.items():
        setattr(cat, k, v)
    cat.updated_at = datetime.utcnow()
    db.add(cat)
    await db.commit()
    await db.refresh(cat)
    return cat


async def delete(db: AsyncSession, category_id: int) -> None:
    cat = await get_by_id(db, category_id)
    cat.is_active = False  # soft delete
    cat.updated_at = datetime.utcnow()
    db.add(cat)
    await db.commit()
