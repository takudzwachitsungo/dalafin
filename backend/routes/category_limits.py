from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import and_, extract
from typing import List
from datetime import date, datetime
from dateutil.relativedelta import relativedelta
from database import get_db
from models.user import User
from models.category_limit import CategoryLimit
from schemas import CategoryLimitCreate, CategoryLimitUpdate, CategoryLimitResponse
from utils.deps import get_current_user

router = APIRouter(prefix="/api/category-limits", tags=["category-limits"])

@router.post("/", response_model=CategoryLimitResponse, status_code=status.HTTP_201_CREATED)
def create_category_limit(
    limit: CategoryLimitCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create or update category limit for current month"""
    today = date.today()
    first_day = today.replace(day=1)
    next_month = first_day + relativedelta(months=1)
    
    # Check if limit already exists for this category this month
    existing = db.query(CategoryLimit).filter(
        and_(
            CategoryLimit.user_id == current_user.id,
            CategoryLimit.category == limit.category,
            CategoryLimit.reset_date >= first_day,
            CategoryLimit.reset_date < next_month
        )
    ).first()
    
    if existing:
        # Update existing
        existing.monthly_limit = limit.monthly_limit
        db.commit()
        db.refresh(existing)
        return existing
    
    # Create new
    db_limit = CategoryLimit(
        user_id=current_user.id,
        category=limit.category,
        monthly_limit=limit.monthly_limit,
        spent=0.0,
        reset_date=next_month  # Will reset on first of next month
    )
    db.add(db_limit)
    db.commit()
    db.refresh(db_limit)
    return db_limit

@router.get("/", response_model=List[CategoryLimitResponse])
def list_category_limits(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all category limits for current month"""
    today = date.today()
    first_day = today.replace(day=1)
    next_month = first_day + relativedelta(months=1)
    
    limits = db.query(CategoryLimit).filter(
        and_(
            CategoryLimit.user_id == current_user.id,
            CategoryLimit.reset_date >= first_day,
            CategoryLimit.reset_date < next_month
        )
    ).all()
    return limits

@router.get("/status")
def get_category_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get spending status for all categories"""
    today = date.today()
    first_day = today.replace(day=1)
    next_month = first_day + relativedelta(months=1)
    
    limits = db.query(CategoryLimit).filter(
        and_(
            CategoryLimit.user_id == current_user.id,
            CategoryLimit.reset_date >= first_day,
            CategoryLimit.reset_date < next_month
        )
    ).all()
    
    status = []
    for limit in limits:
        status.append({
            "category": limit.category,
            "spent": limit.spent,
            "monthly_limit": limit.monthly_limit,
            "remaining": limit.remaining,
            "percentage_used": limit.percentage_used,
            "status": "over" if limit.spent > limit.monthly_limit else 
                     "warning" if limit.percentage_used > 80 else "ok"
        })
    
    return status

@router.get("/{category}")
def get_category_limit(
    category: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get limit for specific category"""
    today = date.today()
    first_day = today.replace(day=1)
    next_month = first_day + relativedelta(months=1)
    
    limit = db.query(CategoryLimit).filter(
        and_(
            CategoryLimit.user_id == current_user.id,
            CategoryLimit.category == category,
            CategoryLimit.reset_date >= first_day,
            CategoryLimit.reset_date < next_month
        )
    ).first()
    
    if not limit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No limit set for category: {category}"
        )
    return limit

@router.put("/{limit_id}", response_model=CategoryLimitResponse)
def update_category_limit(
    limit_id: str,
    limit_update: CategoryLimitUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update monthly limit for category"""
    db_limit = db.query(CategoryLimit).filter(
        and_(
            CategoryLimit.id == limit_id,
            CategoryLimit.user_id == current_user.id
        )
    ).first()
    
    if not db_limit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category limit not found"
        )
    
    update_data = limit_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_limit, key, value)
    
    db.commit()
    db.refresh(db_limit)
    return db_limit

@router.delete("/{limit_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category_limit(
    limit_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete category limit"""
    db_limit = db.query(CategoryLimit).filter(
        and_(
            CategoryLimit.id == limit_id,
            CategoryLimit.user_id == current_user.id
        )
    ).first()
    
    if not db_limit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category limit not found"
        )
    
    db.delete(db_limit)
    db.commit()
    return None
