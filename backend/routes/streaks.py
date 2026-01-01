from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from datetime import date, timedelta
from database import get_db
from models.user import User
from models.streak import UserStreak
from models.transaction import Transaction
from utils.deps import get_current_user

router = APIRouter(prefix="/api/streaks", tags=["streaks"])

@router.get("/")
def get_streak_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user's streak data"""
    streak = db.query(UserStreak).filter(
        UserStreak.user_id == current_user.id
    ).first()
    
    if not streak:
        # Create initial streak record
        streak = UserStreak(
            user_id=current_user.id,
            current_streak=0,
            longest_streak=0,
            impulses_avoided=0,
            rollover_budget=0.0
        )
        db.add(streak)
        db.commit()
        db.refresh(streak)
    
    return streak

@router.post("/impulse-avoided")
def record_impulse_avoided(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Increment impulses avoided counter"""
    streak = db.query(UserStreak).filter(
        UserStreak.user_id == current_user.id
    ).first()
    
    if not streak:
        streak = UserStreak(
            user_id=current_user.id,
            current_streak=0,
            longest_streak=0,
            impulses_avoided=0,
            rollover_budget=0.0
        )
        db.add(streak)
    
    streak.impulses_avoided += 1
    db.commit()
    db.refresh(streak)
    
    return {
        "message": "Impulse avoided recorded",
        "impulses_avoided": streak.impulses_avoided
    }

@router.post("/validate-day")
def validate_streak_day(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Check if yesterday was under budget and update streak
    Called by scheduled task at midnight
    """
    yesterday = date.today() - timedelta(days=1)
    
    # Get yesterday's spending
    yesterday_spent = db.query(func.sum(Transaction.amount)).filter(
        and_(
            Transaction.user_id == current_user.id,
            Transaction.date == yesterday
        )
    ).scalar() or 0.0
    
    daily_limit = current_user.daily_limit
    under_budget = yesterday_spent <= daily_limit
    
    # Get or create streak
    streak = db.query(UserStreak).filter(
        UserStreak.user_id == current_user.id
    ).first()
    
    if not streak:
        streak = UserStreak(
            user_id=current_user.id,
            current_streak=0,
            longest_streak=0,
            impulses_avoided=0,
            rollover_budget=0.0
        )
        db.add(streak)
    
    if under_budget:
        # Increment streak
        streak.current_streak += 1
        if streak.current_streak > streak.longest_streak:
            streak.longest_streak = streak.current_streak
    else:
        # Break streak
        streak.current_streak = 0
    
    db.commit()
    db.refresh(streak)
    
    return {
        "date": yesterday,
        "spent": yesterday_spent,
        "daily_limit": daily_limit,
        "under_budget": under_budget,
        "current_streak": streak.current_streak,
        "longest_streak": streak.longest_streak
    }

@router.get("/milestones")
def get_milestone_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get milestone achievement status"""
    streak = db.query(UserStreak).filter(
        UserStreak.user_id == current_user.id
    ).first()
    
    if not streak:
        return {
            "streak_7_days": False,
            "streak_30_days": False,
            "savings_100": False,
            "savings_500": False,
            "impulses_5": False,
            "impulses_20": False
        }
    
    # Get total savings (rollover budget is accumulated savings)
    total_savings = streak.rollover_budget
    
    # Get impulses avoided from transactions
    impulse_count = db.query(func.count(Transaction.id)).filter(
        and_(
            Transaction.user_id == current_user.id,
            Transaction.is_impulse == True
        )
    ).scalar() or 0
    
    return {
        "streak_7_days": streak.current_streak >= 7,
        "streak_30_days": streak.current_streak >= 30,
        "savings_100": total_savings >= 100,
        "savings_500": total_savings >= 500,
        "impulses_5": streak.impulses_avoided >= 5,
        "impulses_20": streak.impulses_avoided >= 20,
        "current_values": {
            "current_streak": streak.current_streak,
            "longest_streak": streak.longest_streak,
            "total_savings": total_savings,
            "impulses_avoided": streak.impulses_avoided,
            "impulse_purchases": impulse_count
        }
    }

@router.post("/reset")
def reset_streak(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Manually reset streak (admin/debug only)"""
    streak = db.query(UserStreak).filter(
        UserStreak.user_id == current_user.id
    ).first()
    
    if not streak:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Streak not found"
        )
    
    streak.current_streak = 0
    db.commit()
    
    return {"message": "Streak reset to 0"}
