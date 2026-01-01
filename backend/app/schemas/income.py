from datetime import date, datetime
from decimal import Decimal
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, Field, field_serializer, ConfigDict


# Common income sources
INCOME_SOURCES = [
    "Gift",
    "Freelance",
    "Side Job",
    "Bonus",
    "Refund",
    "Investment",
    "Cashback",
    "Sold Item",
    "Other"
]


class IncomeBase(BaseModel):
    amount: Decimal = Field(..., gt=0, description="Income amount (must be positive)")
    source: str = Field(..., min_length=1, description="Source of income")
    description: Optional[str] = None
    date: datetime


class IncomeCreate(IncomeBase):
    pass


class IncomeUpdate(BaseModel):
    amount: Optional[Decimal] = Field(None, gt=0)
    source: Optional[str] = None
    description: Optional[str] = None
    date: Optional[datetime] = None


class IncomeResponse(IncomeBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
    
    @field_serializer('id', 'user_id')
    def serialize_uuid(self, value: UUID, _info):
        return str(value)


class IncomeListResponse(BaseModel):
    incomes: List[IncomeResponse]
    total: int
    total_amount: Decimal


class IncomeSummaryResponse(BaseModel):
    total_this_month: Decimal
    total_this_year: Decimal
    by_source: dict[str, Decimal]
    recent_incomes: List[IncomeResponse]
