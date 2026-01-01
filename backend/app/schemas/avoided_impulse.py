from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from uuid import UUID

class AvoidedImpulseCreate(BaseModel):
    amount: float
    category: str
    description: Optional[str] = None

class AvoidedImpulseResponse(BaseModel):
    id: int
    user_id: UUID
    amount: float
    category: str
    description: Optional[str]
    avoided_at: datetime

    class Config:
        from_attributes = True
