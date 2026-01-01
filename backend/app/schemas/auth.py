from pydantic import BaseModel, EmailStr, field_serializer
from typing import Optional
from datetime import datetime
from decimal import Decimal
from uuid import UUID


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    monthly_income: Optional[Decimal] = None
    fixed_expenses: Optional[Decimal] = None


class UserUpdate(BaseModel):
    name: Optional[str] = None
    monthly_income: Optional[Decimal] = None
    fixed_expenses: Optional[Decimal] = None


class UserResponse(BaseModel):
    id: UUID
    email: str
    name: str
    monthly_income: Decimal
    fixed_expenses: Decimal
    created_at: datetime
    
    @field_serializer('id')
    def serialize_id(self, value: UUID, _info):
        return str(value)
    
    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
