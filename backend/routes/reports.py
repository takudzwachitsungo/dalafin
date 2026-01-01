from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import and_, func, case
from datetime import date, timedelta
from typing import Dict, Any
from database import get_db
from models.user import User
from models.transaction import Transaction
from models.reflection import Reflection
from utils.deps import get_current_user

router = APIRouter(prefix="/api/reports", tags=["reports"])

@router.get("/weekly-summary")
def get_weekly_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get Weekly Wins summary data"""
    today = date.today()
    week_start = today - timedelta(days=6)
    
    daily_limit = current_user.daily_limit
    
    # Get this week's transactions
    transactions = db.query(Transaction).filter(
        and_(
            Transaction.user_id == current_user.id,
            Transaction.date >= week_start,
            Transaction.date <= today
        )
    ).all()
    
    # Calculate metrics
    total_spent = sum(t.amount for t in transactions)
    weekly_budget = daily_limit * 7
    saved = weekly_budget - total_spent
    
    impulse_count = sum(1 for t in transactions if t.is_impulse)
    
    # Count safe days (under budget)
    daily_spending = {}
    for t in transactions:
        daily_spending[t.date] = daily_spending.get(t.date, 0) + t.amount
    
    safe_days = sum(1 for spent in daily_spending.values() if spent <= daily_limit)
    
    # Get streak from database
    from models.streak import UserStreak
    streak = db.query(UserStreak).filter(
        UserStreak.user_id == current_user.id
    ).first()
    
    current_streak = streak.current_streak if streak else 0
    
    # Compare to last week
    last_week_end = week_start - timedelta(days=1)
    last_week_start = last_week_end - timedelta(days=6)
    
    last_week_spent = db.query(func.sum(Transaction.amount)).filter(
        and_(
            Transaction.user_id == current_user.id,
            Transaction.date >= last_week_start,
            Transaction.date <= last_week_end
        )
    ).scalar() or 0.0
    
    last_week_saved = weekly_budget - last_week_spent
    savings_improvement = saved - last_week_saved
    
    return {
        "period": {
            "start": week_start,
            "end": today
        },
        "metrics": {
            "saved": saved,
            "impulse_count": impulse_count,
            "safe_days": safe_days,
            "current_streak": current_streak
        },
        "comparison": {
            "last_week_saved": last_week_saved,
            "savings_improvement": savings_improvement,
            "improved": savings_improvement > 0
        },
        "details": {
            "total_spent": total_spent,
            "weekly_budget": weekly_budget,
            "daily_limit": daily_limit
        }
    }

@router.get("/monthly-summary")
def get_monthly_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get monthly spending summary"""
    today = date.today()
    month_start = today.replace(day=1)
    
    # Get this month's transactions
    transactions = db.query(Transaction).filter(
        and_(
            Transaction.user_id == current_user.id,
            Transaction.date >= month_start
        )
    ).all()
    
    total_spent = sum(t.amount for t in transactions)
    
    # Spending by category
    category_spending = {}
    for t in transactions:
        category_spending[t.category] = category_spending.get(t.category, 0) + t.amount
    
    # Sort categories by spending
    top_categories = sorted(
        [{"category": k, "amount": v} for k, v in category_spending.items()],
        key=lambda x: x["amount"],
        reverse=True
    )
    
    # Impulse purchases
    impulse_transactions = [t for t in transactions if t.is_impulse]
    impulse_total = sum(t.amount for t in impulse_transactions)
    impulse_count = len(impulse_transactions)
    
    # Days data
    days_in_month = (today - month_start).days + 1
    monthly_budget = current_user.daily_limit * days_in_month
    
    return {
        "period": {
            "start": month_start,
            "end": today,
            "days": days_in_month
        },
        "totals": {
            "spent": total_spent,
            "budget": monthly_budget,
            "remaining": monthly_budget - total_spent,
            "percentage_used": (total_spent / monthly_budget * 100) if monthly_budget > 0 else 0
        },
        "impulses": {
            "count": impulse_count,
            "total": impulse_total,
            "average": impulse_total / impulse_count if impulse_count > 0 else 0
        },
        "categories": top_categories,
        "daily_average": total_spent / days_in_month if days_in_month > 0 else 0
    }

@router.get("/heat-map")
def get_heat_map_data(
    days: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get spending heat map data for last N days"""
    end_date = date.today()
    start_date = end_date - timedelta(days=days - 1)
    
    daily_limit = current_user.daily_limit
    
    # Get daily spending
    daily_spending = db.query(
        Transaction.date,
        func.sum(Transaction.amount).label("amount")
    ).filter(
        and_(
            Transaction.user_id == current_user.id,
            Transaction.date >= start_date,
            Transaction.date <= end_date
        )
    ).group_by(Transaction.date).all()
    
    spending_dict = {d.date: d.amount for d in daily_spending}
    
    # Build heat map array
    heat_map = []
    for i in range(days):
        day = start_date + timedelta(days=i)
        spent = spending_dict.get(day, 0.0)
        percentage = (spent / daily_limit * 100) if daily_limit > 0 else 0
        
        status = "safe" if percentage <= 50 else \
                "ok" if percentage <= 80 else \
                "warning" if percentage <= 100 else "over"
        
        heat_map.append({
            "date": day,
            "spent": spent,
            "percentage": percentage,
            "status": status
        })
    
    # Summary stats
    total_days = len(heat_map)
    safe_days = sum(1 for d in heat_map if d["status"] == "safe")
    over_days = sum(1 for d in heat_map if d["status"] == "over")
    
    return {
        "heat_map": heat_map,
        "summary": {
            "total_days": total_days,
            "safe_days": safe_days,
            "over_days": over_days,
            "safe_percentage": (safe_days / total_days * 100) if total_days > 0 else 0
        }
    }

@router.get("/peer-benchmarks")
def get_peer_benchmarks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get peer benchmarks (anonymized comparison with other users)
    Note: This is a simplified version. Production would need proper anonymization
    and aggregation of sufficient user data.
    """
    today = date.today()
    month_start = today.replace(day=1)
    
    # Get user's monthly spending
    user_spent = db.query(func.sum(Transaction.amount)).filter(
        and_(
            Transaction.user_id == current_user.id,
            Transaction.date >= month_start
        )
    ).scalar() or 0.0
    
    # Get user's impulse count
    user_impulses = db.query(func.count(Transaction.id)).filter(
        and_(
            Transaction.user_id == current_user.id,
            Transaction.date >= month_start,
            Transaction.is_impulse == True
        )
    ).scalar() or 0
    
    # Get user's streak
    from models.streak import UserStreak
    user_streak = db.query(UserStreak).filter(
        UserStreak.user_id == current_user.id
    ).first()
    
    current_streak = user_streak.current_streak if user_streak else 0
    rollover = user_streak.rollover_budget if user_streak else 0.0
    
    # Get all users' monthly spending for comparison
    all_users_spending = db.query(
        Transaction.user_id,
        func.sum(Transaction.amount).label("total")
    ).filter(
        Transaction.date >= month_start
    ).group_by(Transaction.user_id).all()
    
    spending_values = sorted([u.total for u in all_users_spending])
    total_users = len(spending_values)
    
    if total_users == 0:
        percentile = 50
    else:
        user_rank = sum(1 for v in spending_values if v >= user_spent)
        percentile = (user_rank / total_users * 100) if total_users > 0 else 50
    
    # Mock percentiles for other metrics (in production, calculate from real data)
    return {
        "monthly_spending": {
            "user_value": user_spent,
            "percentile": percentile,
            "interpretation": "Lower is better"
        },
        "impulse_purchases": {
            "user_value": user_impulses,
            "percentile": 45,  # Mock value
            "interpretation": "Lower is better"
        },
        "savings_streak": {
            "user_value": current_streak,
            "percentile": 60,  # Mock value
            "interpretation": "Higher is better"
        },
        "rollover_savings": {
            "user_value": rollover,
            "percentile": 55,  # Mock value
            "interpretation": "Higher is better"
        }
    }

@router.get("/reflection-insights")
def get_reflection_insights(
    days: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get insights from reflection history"""
    end_date = date.today()
    start_date = end_date - timedelta(days=days)
    
    reflections = db.query(Reflection).filter(
        and_(
            Reflection.user_id == current_user.id,
            Reflection.date >= start_date
        )
    ).order_by(Reflection.date.desc()).all()
    
    total_reflections = len(reflections)
    regret_count = sum(1 for r in reflections if r.regret_purchase)
    good_count = sum(1 for r in reflections if r.good_purchase)
    
    return {
        "period": {
            "start": start_date,
            "end": end_date,
            "days": days
        },
        "stats": {
            "total_reflections": total_reflections,
            "reflection_rate": (total_reflections / days * 100),
            "regret_count": regret_count,
            "good_count": good_count,
            "regret_percentage": (regret_count / total_reflections * 100) if total_reflections > 0 else 0
        },
        "recent_reflections": [
            {
                "date": r.date,
                "regret_purchase": r.regret_purchase,
                "good_purchase": r.good_purchase,
                "notes": r.notes
            }
            for r in reflections[:5]
        ]
    }
