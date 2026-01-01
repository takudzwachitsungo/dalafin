from datetime import datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class TransactionBase(BaseModel):
    amount: Decimal = Field(..., gt=0, description="Transaction amount (must be positive)")
    category: str = Field(..., min_length=1, max_length=50)
    description: Optional[str] = Field(None, max_length=255)
    is_impulse: bool = False
    emergency_reason: Optional[str] = Field(None, max_length=255)


class TransactionCreate(TransactionBase):
    pass


class TransactionUpdate(BaseModel):
    amount: Optional[Decimal] = Field(None, gt=0)
    category: Optional[str] = Field(None, min_length=1, max_length=50)
    description: Optional[str] = Field(None, max_length=255)
    is_impulse: Optional[bool] = None
    emergency_reason: Optional[str] = Field(None, max_length=255)


class TransactionResponse(TransactionBase):
    id: str
    user_id: str
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class TransactionStatsResponse(BaseModel):
    total_spent: Decimal
    impulse_count: int
    impulse_amount: Decimal
    average_transaction: Decimal
    transactions_count: int
