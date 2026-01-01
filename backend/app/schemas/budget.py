from datetime import date, datetime
from decimal import Decimal
from typing import List
from pydantic import BaseModel, Field, ConfigDict


class BudgetResponse(BaseModel):
    daily_budget: Decimal
    rollover_amount: Decimal
    available_today: Decimal
    spent_today: Decimal
    remaining_today: Decimal


class BudgetRolloverResponse(BaseModel):
    date: date
    unused_amount: Decimal
    rollover_applied: bool
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class BudgetHistoryResponse(BaseModel):
    rollovers: List[BudgetRolloverResponse]
    total_rollover: Decimal
    max_rollover: Decimal  # 3 days worth
    days_saved: int


class StreakResponse(BaseModel):
    current_streak: int
    longest_streak: int
    impulses_avoided: int
    rollover_budget: Decimal
    last_streak_date: date
    
    model_config = ConfigDict(from_attributes=True)
