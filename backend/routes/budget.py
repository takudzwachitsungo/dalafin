from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from datetime import date, timedelta, datetime
from typing import List
from database import get_db
from models.user import User
from models.transaction import Transaction
from models.budget_rollover import BudgetRollover
from models.streak import UserStreak
from utils.deps import get_current_user

router = APIRouter(prefix="/api/budget", tags=["budget"])

@router.get("/today")
def get_today_budget(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get today's available budget (daily limit + rollover)"""
    # Get user's daily limit
    daily_limit = current_user.daily_limit
    
    # Get rollover budget from streak
    streak = db.query(UserStreak).filter(
        UserStreak.user_id == current_user.id
    ).first()
    
    rollover_budget = streak.rollover_budget if streak else 0.0
    
    # Get today's spending
    today = date.today()
    today_spent = db.query(func.sum(Transaction.amount)).filter(
        and_(
            Transaction.user_id == current_user.id,
            Transaction.date == today
        )
    ).scalar() or 0.0
    
    available = daily_limit + rollover_budget - today_spent
    
    return {
        "date": today,
        "daily_limit": daily_limit,
        "rollover_budget": rollover_budget,
        "total_budget": daily_limit + rollover_budget,
        "spent": today_spent,
        "available": available,
        "status": "over" if available < 0 else "warning" if available < daily_limit * 0.2 else "ok"
    }

@router.get("/history")
def get_budget_history(
    days: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get spending history for heat map (last N days)"""
    end_date = date.today()
    start_date = end_date - timedelta(days=days - 1)
    
    # Get daily limit
    daily_limit = current_user.daily_limit
    
    # Get all transactions in range
    transactions = db.query(
        Transaction.date,
        func.sum(Transaction.amount).label("spent")
    ).filter(
        and_(
            Transaction.user_id == current_user.id,
            Transaction.date >= start_date,
            Transaction.date <= end_date
        )
    ).group_by(Transaction.date).all()
    
    # Create dict for easy lookup
    spending_by_date = {t.date: t.spent for t in transactions}
    
    # Build array for each day
    history = []
    for i in range(days):
        day = start_date + timedelta(days=i)
        spent = spending_by_date.get(day, 0.0)
        percentage = (spent / daily_limit * 100) if daily_limit > 0 else 0
        
        history.append({
            "date": day,
            "spent": spent,
            "daily_limit": daily_limit,
            "percentage": percentage,
            "status": "over" if spent > daily_limit else 
                     "warning" if percentage > 80 else 
                     "safe" if percentage <= 50 else "ok"
        })
    
    return history

@router.get("/rollover/history")
def get_rollover_history(
    days: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get rollover history"""
    end_date = date.today()
    start_date = end_date - timedelta(days=days - 1)
    
    rollovers = db.query(BudgetRollover).filter(
        and_(
            BudgetRollover.user_id == current_user.id,
            BudgetRollover.date >= start_date,
            BudgetRollover.date <= end_date
        )
    ).order_by(BudgetRollover.date.desc()).all()
    
    return rollovers

@router.post("/rollover/calculate")
def calculate_and_apply_rollover(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Calculate yesterday's unused budget and apply to rollover
    (Max 3 days of rollover allowed)
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
    unused = max(0, daily_limit - yesterday_spent)
    
    if unused <= 0:
        return {"message": "No unused budget to rollover", "unused": 0, "rollover_applied": 0}
    
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
    
    # Calculate new rollover (max 3 days)
    max_rollover = daily_limit * 3
    new_rollover = min(streak.rollover_budget + unused, max_rollover)
    rollover_applied = new_rollover - streak.rollover_budget
    
    streak.rollover_budget = new_rollover
    
    # Record rollover history
    rollover_record = BudgetRollover(
        user_id=current_user.id,
        date=yesterday,
        unused_amount=unused,
        rollover_applied=rollover_applied
    )
    db.add(rollover_record)
    
    db.commit()
    
    return {
        "message": "Rollover calculated and applied",
        "date": yesterday,
        "unused": unused,
        "rollover_applied": rollover_applied,
        "total_rollover": new_rollover,
        "max_rollover": max_rollover
    }

@router.get("/weekly-savings")
def get_weekly_savings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Calculate savings for this week vs last week"""
    today = date.today()
    
    # This week (last 7 days)
    week_start = today - timedelta(days=6)
    this_week_spent = db.query(func.sum(Transaction.amount)).filter(
        and_(
            Transaction.user_id == current_user.id,
            Transaction.date >= week_start,
            Transaction.date <= today
        )
    ).scalar() or 0.0
    
    # Last week (days 7-13 ago)
    last_week_end = week_start - timedelta(days=1)
    last_week_start = last_week_end - timedelta(days=6)
    last_week_spent = db.query(func.sum(Transaction.amount)).filter(
        and_(
            Transaction.user_id == current_user.id,
            Transaction.date >= last_week_start,
            Transaction.date <= last_week_end
        )
    ).scalar() or 0.0
    
    savings = last_week_spent - this_week_spent
    percentage_change = ((last_week_spent - this_week_spent) / last_week_spent * 100) if last_week_spent > 0 else 0
    
    return {
        "this_week_spent": this_week_spent,
        "last_week_spent": last_week_spent,
        "savings": savings,
        "percentage_change": percentage_change,
        "improved": savings > 0
    }
