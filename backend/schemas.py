from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime, date
from decimal import Decimal
from uuid import UUID

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    name: str

class UserCreate(UserBase):
    password: str = Field(min_length=8)

class UserUpdate(BaseModel):
    name: Optional[str] = None
    monthly_income: Optional[Decimal] = None
    fixed_expenses: Optional[Decimal] = None
    timezone: Optional[str] = None

class UserResponse(UserBase):
    id: UUID
    monthly_income: Decimal
    fixed_expenses: Decimal
    timezone: str
    created_at: datetime
    daily_limit: float
    
    class Config:
        from_attributes = True

# Auth schemas
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    user_id: Optional[str] = None

# Transaction schemas
class TransactionBase(BaseModel):
    amount: Decimal = Field(gt=0)
    category: str
    is_impulse: bool = False
    note: Optional[str] = None
    emergency_reason: Optional[str] = None

class TransactionCreate(TransactionBase):
    pass

class TransactionUpdate(BaseModel):
    amount: Optional[Decimal] = Field(None, gt=0)
    category: Optional[str] = None
    is_impulse: Optional[bool] = None
    note: Optional[str] = None

class TransactionResponse(TransactionBase):
    id: UUID
    user_id: UUID
    date: datetime
    created_at: datetime
    
    class Config:
        from_attributes = True

# Reflection schemas
class ReflectionBase(BaseModel):
    regret_purchase: Optional[str] = None
    good_purchase: Optional[str] = None
    notes: Optional[str] = None

class ReflectionCreate(ReflectionBase):
    pass

class ReflectionResponse(ReflectionBase):
    id: UUID
    user_id: UUID
    date: date
    created_at: datetime
    
    class Config:
        from_attributes = True

# Goal schemas
class GoalBase(BaseModel):
    name: str
    target: Decimal = Field(gt=0)
    color: str = "bg-blue-500"
    deadline: Optional[date] = None

class GoalCreate(GoalBase):
    pass

class GoalUpdate(BaseModel):
    name: Optional[str] = None
    current: Optional[Decimal] = None
    target: Optional[Decimal] = Field(None, gt=0)
    color: Optional[str] = None
    deadline: Optional[date] = None

class GoalResponse(GoalBase):
    id: UUID
    user_id: UUID
    current: Decimal
    created_at: datetime
    updated_at: datetime
    progress_percentage: float
    
    class Config:
        from_attributes = True

# Category Limit schemas
class CategoryLimitUpdate(BaseModel):
    monthly_limit: Decimal = Field(ge=0)

class CategoryLimitResponse(BaseModel):
    id: UUID
    user_id: UUID
    category: str
    monthly_limit: Decimal
    spent: Decimal
    reset_date: date
    remaining: float
    percentage_used: float
    
    class Config:
        from_attributes = True

# Wishlist schemas
class WishlistItemCreate(BaseModel):
    name: str
    price: Decimal = Field(gt=0)

class WishlistItemResponse(BaseModel):
    id: UUID
    user_id: UUID
    name: str
    price: Decimal
    cooldown_days: int
    added_date: datetime
    purchased_date: Optional[datetime]
    status: str
    ready_date: datetime
    days_remaining: int
    
    class Config:
        from_attributes = True

# Streak schemas
class StreakResponse(BaseModel):
    current_streak: int
    longest_streak: int
    impulses_avoided: int
    rollover_budget: Decimal
    last_streak_date: Optional[date]
    
    class Config:
        from_attributes = True
