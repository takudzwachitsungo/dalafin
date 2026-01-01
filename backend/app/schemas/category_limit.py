from datetime import datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class CategoryLimitBase(BaseModel):
    category: str = Field(..., min_length=1, max_length=50)
    monthly_limit: Decimal = Field(..., gt=0, description="Monthly spending limit")


class CategoryLimitCreate(CategoryLimitBase):
    pass


class CategoryLimitUpdate(BaseModel):
    monthly_limit: Optional[Decimal] = Field(None, gt=0)


class CategoryLimitResponse(CategoryLimitBase):
    id: str
    user_id: str
    spent: Decimal
    reset_date: datetime
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class CategoryLimitStatusResponse(BaseModel):
    category: str
    monthly_limit: Decimal
    spent: Decimal
    remaining: Decimal
    percentage_used: float
    is_exceeded: bool


from typing import Optional
