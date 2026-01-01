from datetime import date, datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class GoalBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    target: Decimal = Field(..., gt=0, description="Target amount")
    color: str = Field(..., min_length=1, max_length=20)
    deadline: Optional[date] = None


class GoalCreate(GoalBase):
    current: Decimal = Field(default=Decimal(0), ge=0)


class GoalUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    current: Optional[Decimal] = Field(None, ge=0)
    target: Optional[Decimal] = Field(None, gt=0)
    color: Optional[str] = Field(None, min_length=1, max_length=20)
    deadline: Optional[date] = None


class GoalResponse(GoalBase):
    id: str
    user_id: str
    current: Decimal
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class GoalProgressResponse(BaseModel):
    goal: GoalResponse
    percentage: float
    remaining: Decimal
    days_until_deadline: Optional[int] = None
