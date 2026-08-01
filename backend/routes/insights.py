from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from datetime import date, timedelta
from pydantic import BaseModel
from typing import Optional
from database import get_db
from models.user import User
from models.transaction import Transaction
from models.reflection import Reflection
from models.streak import UserStreak
from services.llm import minimax_service
from utils.deps import get_current_user

router = APIRouter(prefix="/api/insights", tags=["insights"])

class CategorizeRequest(BaseModel):
    description: str
    amount: float

class ReflectionAnalysisRequest(BaseModel):
    reflection_text: str
    regret_purchase: bool

class ImpulseQuestionRequest(BaseModel):
    item_name: str
    price: float

class ChatCoachRequest(BaseModel):
    message: str

@router.post("/chat")
async def chat_with_coach(
    request: ChatCoachRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Conversational AI Financial Discipline Coach powered by Minimax AI"""
    today = date.today()
    today_spent = db.query(func.sum(Transaction.amount)).filter(
        and_(
            Transaction.user_id == current_user.id,
            Transaction.date == today
        )
    ).scalar() or 0.0

    streak_obj = db.query(UserStreak).filter(
        UserStreak.user_id == current_user.id
    ).first()
    
    current_streak = streak_obj.current_streak if streak_obj else 1

    user_context = {
        "daily_limit": current_user.daily_limit,
        "spent_today": today_spent,
        "streak": current_streak
    }

    reply = await minimax_service.chat_with_coach(
        user_message=request.message,
        user_context=user_context
    )
    
    return {"reply": reply}

@router.post("/categorize")
async def categorize_transaction(
    request: CategorizeRequest,
    current_user: User = Depends(get_current_user)
):
    """Auto-categorize transaction using LLM"""
    category = await minimax_service.categorize_transaction(
        description=request.description,
        amount=request.amount
    )
    return {"category": category}

@router.get("/spending-analysis")
async def analyze_spending(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get AI-powered spending analysis and insights"""
    today = date.today()
    month_start = today.replace(day=1)
    
    transactions = db.query(Transaction).filter(
        and_(
            Transaction.user_id == current_user.id,
            Transaction.date >= month_start
        )
    ).all()
    
    total_spent = sum(t.amount for t in transactions)
    
    category_spending = {}
    for t in transactions:
        category_spending[t.category] = category_spending.get(t.category, 0) + t.amount
    
    top_category = max(category_spending.items(), key=lambda x: x[1]) if category_spending else ("Other", 0)
    
    impulse_transactions = [t for t in transactions if t.is_impulse]
    impulse_count = len(impulse_transactions)
    impulse_total = sum(t.amount for t in impulse_transactions)
    
    streak = db.query(UserStreak).filter(
        UserStreak.user_id == current_user.id
    ).first()
    
    current_streak = streak.current_streak if streak else 0
    
    days_in_month = (today - month_start).days + 1
    monthly_budget = current_user.daily_limit * days_in_month
    
    spending_data = {
        "total_spent": total_spent,
        "budget": monthly_budget,
        "top_category": top_category[0],
        "top_category_amount": top_category[1],
        "impulse_count": impulse_count,
        "impulse_total": impulse_total,
        "streak": current_streak
    }
    
    insights = await minimax_service.analyze_spending_pattern(spending_data)
    
    return {
        "insights": insights,
        "data": spending_data
    }

@router.post("/analyze-reflection")
async def analyze_reflection(
    request: ReflectionAnalysisRequest,
    current_user: User = Depends(get_current_user)
):
    """Analyze reflection for emotional triggers and suggestions"""
    analysis = await minimax_service.analyze_reflection(
        reflection_text=request.reflection_text,
        regret_purchase=request.regret_purchase
    )
    return analysis

@router.post("/impulse-question")
async def generate_impulse_question(
    request: ImpulseQuestionRequest,
    current_user: User = Depends(get_current_user)
):
    """Generate thoughtful question for impulse check"""
    question = await minimax_service.generate_impulse_question(
        item_name=request.item_name,
        price=request.price
    )
    return {"question": question}
