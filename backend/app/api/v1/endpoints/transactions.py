from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, extract
from datetime import date, datetime, timedelta
from typing import Optional, List
from decimal import Decimal

from app.core.database import get_db
from app.models.user import User
from app.models.transaction import Transaction
from app.api.v1.endpoints.auth import get_current_user
from app.schemas.transaction import TransactionCreate, TransactionResponse, TransactionUpdate
from pydantic import field_serializer, BaseModel
from uuid import UUID

router = APIRouter()


class TransactionResponseWithUUID(BaseModel):
    id: UUID
    user_id: UUID
    amount: float
    category: str
    date: datetime
    is_impulse: bool
    note: Optional[str] = None
    emergency_reason: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    @field_serializer('id', 'user_id')
    def serialize_uuid(self, value: UUID, _info):
        return str(value)
    
    class Config:
        from_attributes = True


@router.get("/", response_model=List[TransactionResponseWithUUID])
async def list_transactions(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List user transactions with optional filters"""
    query = db.query(Transaction).filter(Transaction.user_id == current_user.id)
    
    if start_date:
        query = query.filter(Transaction.date >= datetime.fromisoformat(start_date))
    if end_date:
        query = query.filter(Transaction.date <= datetime.fromisoformat(end_date))
    if category:
        query = query.filter(Transaction.category == category)
    
    transactions = query.order_by(Transaction.date.desc()).all()
    return transactions


@router.post("/", response_model=TransactionResponseWithUUID, status_code=status.HTTP_201_CREATED)
async def create_transaction(
    transaction_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new transaction"""
    try:
        # Handle different field names from frontend
        transaction = Transaction(
            user_id=current_user.id,
            amount=Decimal(str(transaction_data.get('amount'))),
            category=transaction_data.get('category'),
            date=datetime.fromisoformat(transaction_data.get('date')) if transaction_data.get('date') else datetime.now(),
            is_impulse=transaction_data.get('is_impulse_buy', transaction_data.get('is_impulse', False)),
            note=transaction_data.get('notes', transaction_data.get('note')),
            emergency_reason=transaction_data.get('emergency_reason')
        )
        
        db.add(transaction)
        db.commit()
        db.refresh(transaction)
        
        return transaction
    except Exception as e:
        db.rollback()
        print(f"Error creating transaction: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/today", response_model=List[TransactionResponseWithUUID])
async def get_today_transactions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get today's transactions"""
    today = date.today()
    transactions = db.query(Transaction).filter(
        and_(
            Transaction.user_id == current_user.id,
            func.date(Transaction.date) == today
        )
    ).order_by(Transaction.date.desc()).all()
    
    return transactions


@router.get("/{transaction_id}", response_model=TransactionResponseWithUUID)
async def get_transaction(
    transaction_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific transaction"""
    transaction = db.query(Transaction).filter(
        and_(
            Transaction.id == transaction_id,
            Transaction.user_id == current_user.id
        )
    ).first()
    
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    return transaction


@router.delete("/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_transaction(
    transaction_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a transaction"""
    transaction = db.query(Transaction).filter(
        and_(
            Transaction.id == transaction_id,
            Transaction.user_id == current_user.id
        )
    ).first()
    
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    db.delete(transaction)
    db.commit()
    
    return None
