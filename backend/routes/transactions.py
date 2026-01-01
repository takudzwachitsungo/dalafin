from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List
from datetime import datetime, date, timedelta
from database import get_db
from models.user import User
from models.transaction import Transaction
from models.category_limit import CategoryLimit
from schemas import TransactionCreate, TransactionUpdate, TransactionResponse
from utils.deps import get_current_user

router = APIRouter(prefix="/api/transactions", tags=["Transactions"])

@router.get("", response_model=List[TransactionResponse])
def list_transactions(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    category: str = None,
    is_impulse: bool = None,
    start_date: date = None,
    end_date: date = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List user's transactions with filters"""
    query = db.query(Transaction).filter(Transaction.user_id == current_user.id)
    
    if category:
        query = query.filter(Transaction.category == category)
    if is_impulse is not None:
        query = query.filter(Transaction.is_impulse == is_impulse)
    if start_date:
        query = query.filter(Transaction.date >= start_date)
    if end_date:
        query = query.filter(Transaction.date <= end_date)
    
    transactions = query.order_by(desc(Transaction.date)).offset(skip).limit(limit).all()
    return transactions

@router.post("", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
def create_transaction(
    transaction_data: TransactionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new transaction"""
    # Create transaction
    transaction = Transaction(
        user_id=current_user.id,
        **transaction_data.dict()
    )
    db.add(transaction)
    
    # Update category limit spent
    category_limit = db.query(CategoryLimit).filter(
        CategoryLimit.user_id == current_user.id,
        CategoryLimit.category == transaction_data.category
    ).first()
    
    if category_limit:
        category_limit.spent += transaction_data.amount
    
    db.commit()
    db.refresh(transaction)
    return transaction

@router.get("/today", response_model=List[TransactionResponse])
def get_today_transactions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get today's transactions"""
    today = date.today()
    transactions = db.query(Transaction).filter(
        Transaction.user_id == current_user.id,
        func.date(Transaction.date) == today
    ).order_by(desc(Transaction.date)).all()
    return transactions

@router.get("/stats")
def get_transaction_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get transaction statistics"""
    today = date.today()
    week_ago = today - timedelta(days=7)
    month_ago = today - timedelta(days=30)
    
    # Today's spending
    today_spent = db.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == current_user.id,
        func.date(Transaction.date) == today
    ).scalar() or 0
    
    # Week spending
    week_spent = db.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == current_user.id,
        Transaction.date >= week_ago
    ).scalar() or 0
    
    # Month spending
    month_spent = db.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == current_user.id,
        Transaction.date >= month_ago
    ).scalar() or 0
    
    # Impulse purchases count
    impulse_count = db.query(func.count(Transaction.id)).filter(
        Transaction.user_id == current_user.id,
        Transaction.is_impulse == True
    ).scalar() or 0
    
    return {
        "today_spent": float(today_spent),
        "week_spent": float(week_spent),
        "month_spent": float(month_spent),
        "impulse_count": impulse_count
    }

@router.get("/{transaction_id}", response_model=TransactionResponse)
def get_transaction(
    transaction_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific transaction"""
    transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.user_id == current_user.id
    ).first()
    
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    return transaction

@router.put("/{transaction_id}", response_model=TransactionResponse)
def update_transaction(
    transaction_id: str,
    transaction_data: TransactionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a transaction"""
    transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.user_id == current_user.id
    ).first()
    
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    for key, value in transaction_data.dict(exclude_unset=True).items():
        setattr(transaction, key, value)
    
    db.commit()
    db.refresh(transaction)
    return transaction

@router.delete("/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(
    transaction_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a transaction"""
    transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.user_id == current_user.id
    ).first()
    
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    # Adjust category limit spent
    category_limit = db.query(CategoryLimit).filter(
        CategoryLimit.user_id == current_user.id,
        CategoryLimit.category == transaction.category
    ).first()
    
    if category_limit:
        category_limit.spent = max(0, category_limit.spent - transaction.amount)
    
    db.delete(transaction)
    db.commit()
    return None
