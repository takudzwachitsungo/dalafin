from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, extract
from datetime import date, timedelta
from decimal import Decimal

from app.core.database import get_db
from app.models.user import User
from app.models.transaction import Transaction
from app.models.rollover import BudgetRollover
from app.models.streak import UserStreak
from app.models.category_limit import CategoryLimit
from app.models.wishlist import WishlistItem, WishlistStatus
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter()


@router.get("/")
async def get_budget(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get current budget information including rollover, streak, and category limits"""
    today = date.today()
    
    # Calculate rollover from unused budget
    total_rollover = db.query(func.sum(BudgetRollover.unused_amount)).filter(
        and_(
            BudgetRollover.user_id == current_user.id,
            BudgetRollover.rollover_applied == False
        )
    ).scalar() or Decimal("0")
    
    # Get current streak
    streak = db.query(UserStreak).filter(
        UserStreak.user_id == current_user.id
    ).order_by(UserStreak.created_at.desc()).first()
    
    streak_days = streak.current_streak if streak else 0
    
    # Count impulse purchases avoided (wishlist items that were removed = resisted)
    current_month = today.month
    current_year = today.year
    
    impulses_avoided = db.query(func.count(WishlistItem.id)).filter(
        and_(
            WishlistItem.user_id == current_user.id,
            WishlistItem.status == WishlistStatus.REMOVED,
            extract('month', WishlistItem.removed_date) == current_month,
            extract('year', WishlistItem.removed_date) == current_year
        )
    ).scalar() or 0
    
    # Get category limits
    category_limits = db.query(CategoryLimit).filter(
        CategoryLimit.user_id == current_user.id
    ).all()
    
    category_limits_data = []
    for limit in category_limits:
        # Calculate spent this month for this category
        spent = db.query(func.sum(Transaction.amount)).filter(
            and_(
                Transaction.user_id == current_user.id,
                Transaction.category == limit.category,
                extract('month', Transaction.date) == current_month,
                extract('year', Transaction.date) == current_year
            )
        ).scalar() or Decimal("0")
        
        category_limits_data.append({
            "category": limit.category,
            "monthlyLimit": float(limit.monthly_limit),
            "spent": float(spent)
        })
    
    return {
        "rollover_amount": float(total_rollover),
        "streak_days": streak_days,
        "impulses_avoided": impulses_avoided,
        "category_limits": category_limits_data
    }


@router.get("/today")
async def get_today_budget(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get today's available budget"""
    today = date.today()
    
    # Calculate daily limit from user's monthly income and expenses
    disposable_income = (current_user.monthly_income or 0) - (current_user.fixed_expenses or 0)
    days_in_month = 30
    daily_limit = disposable_income / days_in_month
    
    # Get today's spent amount
    spent_today = db.query(func.sum(Transaction.amount)).filter(
        and_(
            Transaction.user_id == current_user.id,
            Transaction.date == today
        )
    ).scalar() or Decimal("0")
    
    # Get rollover
    rollover = db.query(func.sum(BudgetRollover.unused_amount)).filter(
        and_(
            BudgetRollover.user_id == current_user.id,
            BudgetRollover.rollover_applied == False
        )
    ).scalar() or Decimal("0")
    
    available_today = daily_limit + float(rollover) - float(spent_today)
    
    return {
        "daily_limit": float(daily_limit),
        "spent_today": float(spent_today),
        "rollover": float(rollover),
        "available_today": available_today,
        "remaining": available_today
    }
