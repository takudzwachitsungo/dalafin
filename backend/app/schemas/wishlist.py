from datetime import date, datetime
from decimal import Decimal
from typing import Optional
from enum import Enum
from pydantic import BaseModel, Field, ConfigDict, field_serializer
from uuid import UUID


class WishlistStatus(str, Enum):
    WAITING = "waiting"
    READY = "ready"
    PURCHASED = "purchased"
    REMOVED = "removed"


class WishlistItemBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    price: Decimal = Field(..., gt=0, description="Item price")


class WishlistItemCreate(WishlistItemBase):
    image_url: Optional[str] = Field(None, max_length=500, description="URL to item image")
    category: Optional[str] = Field(None, min_length=1, max_length=50)
    url: Optional[str] = Field(None, max_length=500)


class WishlistItemUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    price: Optional[Decimal] = Field(None, gt=0)
    image_url: Optional[str] = Field(None, max_length=500)
    status: Optional[WishlistStatus] = None


class WishlistItemResponse(BaseModel):
    id: UUID
    user_id: UUID
    name: str
    price: float
    image_url: Optional[str] = None
    cooldown_days: int
    status: str
    added_date: datetime
    purchased_date: Optional[datetime] = None
    removed_date: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    @field_serializer('id', 'user_id')
    def serialize_uuid(self, value: UUID, _info):
        return str(value)
    
    model_config = ConfigDict(from_attributes=True)


class WishlistItemStatusResponse(BaseModel):
    item: WishlistItemResponse
    days_remaining: int
    can_purchase: bool
    cooldown_end_date: date
