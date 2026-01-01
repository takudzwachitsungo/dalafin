from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import and_
from datetime import date, datetime
from typing import List, Optional
from database import get_db
from models.user import User
from models.reflection import Reflection
from schemas import ReflectionCreate, ReflectionResponse
from utils.deps import get_current_user

router = APIRouter(prefix="/api/reflections", tags=["reflections"])

@router.post("/", response_model=ReflectionResponse, status_code=status.HTTP_201_CREATED)
def create_reflection(
    reflection: ReflectionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create today's daily reflection (one per day)"""
    today = date.today()
    
    # Check if reflection already exists for today
    existing = db.query(Reflection).filter(
        and_(
            Reflection.user_id == current_user.id,
            Reflection.date == today
        )
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reflection already exists for today"
        )
    
    db_reflection = Reflection(
        **reflection.model_dump(),
        user_id=current_user.id,
        date=today
    )
    db.add(db_reflection)
    db.commit()
    db.refresh(db_reflection)
    return db_reflection

@router.get("/today", response_model=Optional[ReflectionResponse])
def get_today_reflection(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get today's reflection if it exists"""
    today = date.today()
    reflection = db.query(Reflection).filter(
        and_(
            Reflection.user_id == current_user.id,
            Reflection.date == today
        )
    ).first()
    return reflection

@router.get("/has-reflected-today")
def has_reflected_today(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Check if user has reflected today"""
    today = date.today()
    exists = db.query(Reflection).filter(
        and_(
            Reflection.user_id == current_user.id,
            Reflection.date == today
        )
    ).first() is not None
    return {"has_reflected": exists}

@router.get("/", response_model=List[ReflectionResponse])
def list_reflections(
    skip: int = 0,
    limit: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List user's reflections (most recent first)"""
    reflections = db.query(Reflection).filter(
        Reflection.user_id == current_user.id
    ).order_by(Reflection.date.desc()).offset(skip).limit(min(limit, 100)).all()
    return reflections

@router.get("/{reflection_id}", response_model=ReflectionResponse)
def get_reflection(
    reflection_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get specific reflection by ID"""
    reflection = db.query(Reflection).filter(
        and_(
            Reflection.id == reflection_id,
            Reflection.user_id == current_user.id
        )
    ).first()
    
    if not reflection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reflection not found"
        )
    return reflection

@router.put("/{reflection_id}", response_model=ReflectionResponse)
def update_reflection(
    reflection_id: str,
    reflection_update: ReflectionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update existing reflection"""
    db_reflection = db.query(Reflection).filter(
        and_(
            Reflection.id == reflection_id,
            Reflection.user_id == current_user.id
        )
    ).first()
    
    if not db_reflection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reflection not found"
        )
    
    for key, value in reflection_update.model_dump().items():
        setattr(db_reflection, key, value)
    
    db.commit()
    db.refresh(db_reflection)
    return db_reflection

@router.delete("/{reflection_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_reflection(
    reflection_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete reflection"""
    db_reflection = db.query(Reflection).filter(
        and_(
            Reflection.id == reflection_id,
            Reflection.user_id == current_user.id
        )
    ).first()
    
    if not db_reflection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reflection not found"
        )
    
    db.delete(db_reflection)
    db.commit()
    return None
