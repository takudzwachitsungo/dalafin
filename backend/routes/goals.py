from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List
from database import get_db
from models.user import User
from models.goal import Goal
from schemas import GoalCreate, GoalUpdate, GoalResponse
from utils.deps import get_current_user

router = APIRouter(prefix="/api/goals", tags=["goals"])

@router.post("/", response_model=GoalResponse, status_code=status.HTTP_201_CREATED)
def create_goal(
    goal: GoalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new goal"""
    db_goal = Goal(
        **goal.model_dump(),
        user_id=current_user.id
    )
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)
    return db_goal

@router.get("/", response_model=List[GoalResponse])
def list_goals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all user's goals"""
    goals = db.query(Goal).filter(
        Goal.user_id == current_user.id
    ).order_by(Goal.created_at.desc()).all()
    return goals

@router.get("/{goal_id}", response_model=GoalResponse)
def get_goal(
    goal_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get specific goal by ID"""
    goal = db.query(Goal).filter(
        and_(
            Goal.id == goal_id,
            Goal.user_id == current_user.id
        )
    ).first()
    
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )
    return goal

@router.put("/{goal_id}", response_model=GoalResponse)
def update_goal(
    goal_id: str,
    goal_update: GoalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update goal (name, target, current amount, color, deadline)"""
    db_goal = db.query(Goal).filter(
        and_(
            Goal.id == goal_id,
            Goal.user_id == current_user.id
        )
    ).first()
    
    if not db_goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )
    
    # Only update provided fields
    update_data = goal_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_goal, key, value)
    
    db.commit()
    db.refresh(db_goal)
    return db_goal

@router.patch("/{goal_id}/progress")
def update_goal_progress(
    goal_id: str,
    amount: float,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update goal progress (add to current amount)"""
    db_goal = db.query(Goal).filter(
        and_(
            Goal.id == goal_id,
            Goal.user_id == current_user.id
        )
    ).first()
    
    if not db_goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )
    
    db_goal.current += amount
    if db_goal.current > db_goal.target:
        db_goal.current = db_goal.target
    
    db.commit()
    db.refresh(db_goal)
    return {
        "id": db_goal.id,
        "current": db_goal.current,
        "target": db_goal.target,
        "progress_percentage": db_goal.progress_percentage
    }

@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_goal(
    goal_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete goal"""
    db_goal = db.query(Goal).filter(
        and_(
            Goal.id == goal_id,
            Goal.user_id == current_user.id
        )
    ).first()
    
    if not db_goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )
    
    db.delete(db_goal)
    db.commit()
    return None
