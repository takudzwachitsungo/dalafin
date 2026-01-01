from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from datetime import date, timedelta
from database import SessionLocal
from models.user import User
from models.transaction import Transaction
from models.streak import UserStreak
from models.budget_rollover import BudgetRollover
from models.category_limit import CategoryLimit
from models.wishlist import WishlistItem
from dateutil.relativedelta import relativedelta

scheduler = AsyncIOScheduler()

def get_db():
    """Get database session"""
    db = SessionLocal()
    try:
        return db
    finally:
        db.close()

async def midnight_rollover_task():
    """
    Run at midnight every day:
    - Calculate yesterday's rollover
    - Validate streaks
    - Update wishlist item statuses
    """
    print("Running midnight rollover task...")
    db = get_db()
    
    try:
        yesterday = date.today() - timedelta(days=1)
        
        # Get all users
        users = db.query(User).all()
        
        for user in users:
            # Calculate rollover
            yesterday_spent = db.query(func.sum(Transaction.amount)).filter(
                and_(
                    Transaction.user_id == user.id,
                    Transaction.date == yesterday
                )
            ).scalar() or 0.0
            
            daily_limit = user.daily_limit
            unused = max(0, daily_limit - yesterday_spent)
            
            # Get or create streak
            streak = db.query(UserStreak).filter(
                UserStreak.user_id == user.id
            ).first()
            
            if not streak:
                streak = UserStreak(
                    user_id=user.id,
                    current_streak=0,
                    longest_streak=0,
                    impulses_avoided=0,
                    rollover_budget=0.0
                )
                db.add(streak)
            
            # Update streak
            under_budget = yesterday_spent <= daily_limit
            if under_budget:
                streak.current_streak += 1
                if streak.current_streak > streak.longest_streak:
                    streak.longest_streak = streak.current_streak
            else:
                streak.current_streak = 0
            
            # Apply rollover (max 3 days)
            if unused > 0:
                max_rollover = daily_limit * 3
                new_rollover = min(streak.rollover_budget + unused, max_rollover)
                rollover_applied = new_rollover - streak.rollover_budget
                
                streak.rollover_budget = new_rollover
                
                # Record rollover history
                rollover_record = BudgetRollover(
                    user_id=user.id,
                    date=yesterday,
                    unused_amount=unused,
                    rollover_applied=rollover_applied
                )
                db.add(rollover_record)
        
        # Update wishlist items (mark ready items)
        waiting_items = db.query(WishlistItem).filter(
            WishlistItem.status == "waiting"
        ).all()
        
        for item in waiting_items:
            if item.days_remaining <= 0:
                item.status = "ready"
        
        db.commit()
        print(f"Midnight rollover completed for {len(users)} users")
        
    except Exception as e:
        print(f"Error in midnight rollover task: {e}")
        db.rollback()
    finally:
        db.close()

async def monthly_reset_task():
    """
    Run on 1st of every month:
    - Reset category limits
    """
    print("Running monthly reset task...")
    db = get_db()
    
    try:
        today = date.today()
        next_month = today + relativedelta(months=1)
        
        # Get all category limits
        limits = db.query(CategoryLimit).all()
        
        for limit in limits:
            # Reset spent amount
            limit.spent = 0.0
            # Update reset date
            limit.reset_date = next_month
        
        db.commit()
        print(f"Monthly reset completed for {len(limits)} category limits")
        
    except Exception as e:
        print(f"Error in monthly reset task: {e}")
        db.rollback()
    finally:
        db.close()

async def reflection_reminder_task():
    """
    Run at 9 PM every day:
    - Send reflection reminders (in production, integrate with notification system)
    """
    print("Running reflection reminder task...")
    db = get_db()
    
    try:
        today = date.today()
        
        from models.reflection import Reflection
        
        # Find users who haven't reflected today
        users = db.query(User).all()
        users_without_reflection = []
        
        for user in users:
            has_reflected = db.query(Reflection).filter(
                and_(
                    Reflection.user_id == user.id,
                    Reflection.date == today
                )
            ).first() is not None
            
            if not has_reflected:
                users_without_reflection.append(user)
        
        print(f"Found {len(users_without_reflection)} users needing reflection reminder")
        
        # In production: Send push notifications or emails here
        # For now, just log
        
    except Exception as e:
        print(f"Error in reflection reminder task: {e}")
    finally:
        db.close()

def init_scheduler():
    """Initialize and start the scheduler"""
    
    # Midnight rollover (12:00 AM every day)
    scheduler.add_job(
        midnight_rollover_task,
        CronTrigger(hour=0, minute=0),
        id="midnight_rollover",
        name="Midnight budget rollover and streak validation",
        replace_existing=True
    )
    
    # Monthly reset (1st of every month at 12:01 AM)
    scheduler.add_job(
        monthly_reset_task,
        CronTrigger(day=1, hour=0, minute=1),
        id="monthly_reset",
        name="Monthly category limit reset",
        replace_existing=True
    )
    
    # Reflection reminder (9 PM every day)
    scheduler.add_job(
        reflection_reminder_task,
        CronTrigger(hour=21, minute=0),
        id="reflection_reminder",
        name="Daily reflection reminder",
        replace_existing=True
    )
    
    scheduler.start()
    print("Scheduler initialized with tasks:")
    print("  - Midnight rollover (12:00 AM)")
    print("  - Monthly reset (1st at 12:01 AM)")
    print("  - Reflection reminder (9:00 PM)")

def shutdown_scheduler():
    """Shutdown the scheduler"""
    if scheduler.running:
        scheduler.shutdown()
        print("Scheduler shut down")
