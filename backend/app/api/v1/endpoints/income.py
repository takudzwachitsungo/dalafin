from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from typing import Optional
from datetime import date, datetime
from decimal import Decimal
from uuid import UUID

from app.core.database import get_db
from app.models.income import Income
from app.models.user import User
from app.schemas.income import (
    IncomeCreate, 
    IncomeUpdate, 
    IncomeResponse, 
    IncomeListResponse,
    IncomeSummaryResponse,
    INCOME_SOURCES
)
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter()


@router.get("/sources", response_model=list[str])
async def get_income_sources():
    """Get list of common income sources"""
    return INCOME_SOURCES


@router.post("/", response_model=IncomeResponse, status_code=status.HTTP_201_CREATED)
async def create_income(
    income_data: IncomeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Record a new income"""
    income = Income(
        user_id=current_user.id,
        amount=income_data.amount,
        source=income_data.source,
        description=income_data.description,
        date=income_data.date if income_data.date else datetime.now()
    )
    
    db.add(income)
    db.commit()
    db.refresh(income)
    
    return income


@router.get("/", response_model=IncomeListResponse)
async def get_incomes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    source: Optional[str] = None,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """Get user's income records with optional filters"""
    query = db.query(Income).filter(Income.user_id == current_user.id)
    
    if start_date:
        query = query.filter(Income.date >= start_date)
    if end_date:
        query = query.filter(Income.date <= end_date)
    if source:
        query = query.filter(Income.source == source)
    
    total = query.count()
    total_amount = db.query(func.sum(Income.amount)).filter(
        Income.user_id == current_user.id
    ).scalar() or Decimal("0")
    
    incomes = query.order_by(Income.date.desc()).offset(offset).limit(limit).all()
    
    return IncomeListResponse(
        incomes=incomes,
        total=total,
        total_amount=total_amount
    )


@router.get("/summary", response_model=IncomeSummaryResponse)
async def get_income_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get income summary for current month and year"""
    today = date.today()
    
    # Total this month
    total_this_month = db.query(func.sum(Income.amount)).filter(
        Income.user_id == current_user.id,
        extract('month', Income.date) == today.month,
        extract('year', Income.date) == today.year
    ).scalar() or Decimal("0")
    
    # Total this year
    total_this_year = db.query(func.sum(Income.amount)).filter(
        Income.user_id == current_user.id,
        extract('year', Income.date) == today.year
    ).scalar() or Decimal("0")
    
    # By source
    by_source_results = db.query(
        Income.source,
        func.sum(Income.amount)
    ).filter(
        Income.user_id == current_user.id,
        extract('year', Income.date) == today.year
    ).group_by(Income.source).all()
    
    by_source = {source: amount for source, amount in by_source_results}
    
    # Recent incomes
    recent_incomes = db.query(Income).filter(
        Income.user_id == current_user.id
    ).order_by(Income.date.desc()).limit(5).all()
    
    return IncomeSummaryResponse(
        total_this_month=total_this_month,
        total_this_year=total_this_year,
        by_source=by_source,
        recent_incomes=recent_incomes
    )


@router.get("/{income_id}", response_model=IncomeResponse)
async def get_income(
    income_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific income record"""
    income = db.query(Income).filter(
        Income.id == income_id,
        Income.user_id == current_user.id
    ).first()
    
    if not income:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Income not found"
        )
    
    return income


@router.put("/{income_id}", response_model=IncomeResponse)
async def update_income(
    income_id: UUID,
    income_data: IncomeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update an income record"""
    income = db.query(Income).filter(
        Income.id == income_id,
        Income.user_id == current_user.id
    ).first()
    
    if not income:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Income not found"
        )
    
    update_data = income_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(income, field, value)
    
    db.commit()
    db.refresh(income)
    
    return income


@router.delete("/{income_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_income(
    income_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete an income record"""
    income = db.query(Income).filter(
        Income.id == income_id,
        Income.user_id == current_user.id
    ).first()
    
    if not income:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Income not found"
        )
    
    db.delete(income)
    db.commit()
