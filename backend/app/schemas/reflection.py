from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class ReflectionBase(BaseModel):
    date: date
    completed: bool = True
    regret_purchase: Optional[str] = Field(None, max_length=500)
    good_purchase: Optional[str] = Field(None, max_length=500)


class ReflectionCreate(BaseModel):
    regret_purchase: Optional[str] = Field(None, max_length=500)
    good_purchase: Optional[str] = Field(None, max_length=500)


class ReflectionUpdate(BaseModel):
    completed: Optional[bool] = None
    regret_purchase: Optional[str] = Field(None, max_length=500)
    good_purchase: Optional[str] = Field(None, max_length=500)


class ReflectionResponse(ReflectionBase):
    id: str
    user_id: str
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class ReflectionStatusResponse(BaseModel):
    date: date
    has_reflected: bool
    reflection: Optional[ReflectionResponse] = None
