from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_, extract
from typing import List
from datetime import datetime

from app.core.database import get_db
from app.api.v1.endpoints.auth import get_current_user
from app.models.user import User
from app.models.avoided_impulse import AvoidedImpulse
from app.models.transaction import Transaction
from app.schemas.avoided_impulse import AvoidedImpulseCreate, AvoidedImpulseResponse

router = APIRouter()


@router.post("/", response_model=AvoidedImpulseResponse)
def create_avoided_impulse(
    impulse_data: AvoidedImpulseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Save an avoided impulse purchase"""
    impulse = AvoidedImpulse(
        user_id=current_user.id,
        amount=impulse_data.amount,
        category=impulse_data.category,
        description=impulse_data.description
    )
    
    db.add(impulse)
    db.commit()
    db.refresh(impulse)
    
    return impulse


@router.get("/", response_model=List[AvoidedImpulseResponse])
def get_avoided_impulses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all avoided impulses for the current user"""
    impulses = db.query(AvoidedImpulse).filter(
        AvoidedImpulse.user_id == current_user.id
    ).order_by(AvoidedImpulse.avoided_at.desc()).all()
    
    return impulses


@router.delete("/{impulse_id}")
def delete_avoided_impulse(
    impulse_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete an avoided impulse"""
    impulse = db.query(AvoidedImpulse).filter(
        and_(
            AvoidedImpulse.id == impulse_id,
            AvoidedImpulse.user_id == current_user.id
        )
    ).first()
    
    if not impulse:
        raise HTTPException(status_code=404, detail="Impulse not found")
    
    db.delete(impulse)
    db.commit()
    
    return {"message": "Impulse deleted successfully"}


@router.post("/{impulse_id}/proceed")
def proceed_with_impulse(
    impulse_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Convert an avoided impulse into an actual transaction"""
    impulse = db.query(AvoidedImpulse).filter(
        and_(
            AvoidedImpulse.id == impulse_id,
            AvoidedImpulse.user_id == current_user.id
        )
    ).first()
    
    if not impulse:
        raise HTTPException(status_code=404, detail="Impulse not found")
    
    # Create transaction from the impulse
    transaction = Transaction(
        user_id=current_user.id,
        amount=impulse.amount,
        category=impulse.category,
        note=impulse.description or "Proceeded with impulse",
        date=datetime.utcnow(),
        is_impulse=True
    )
    
    db.add(transaction)
    
    # Delete the impulse
    db.delete(impulse)
    
    db.commit()
    db.refresh(transaction)
    
    return {
        "message": "Transaction created successfully",
        "transaction_id": transaction.id
    }
