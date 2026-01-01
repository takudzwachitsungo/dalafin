from sqlalchemy import Column, String, Numeric, Integer, DateTime, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
import enum
from app.core.database import Base


class WishlistStatus(str, enum.Enum):
    WAITING = "waiting"
    READY = "ready"
    PURCHASED = "purchased"
    REMOVED = "removed"


class WishlistItem(Base):
    __tablename__ = "wishlist_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    name = Column(String, nullable=False)
    price = Column(Numeric(10, 2), nullable=False)
    image_url = Column(String, nullable=True)
    cooldown_days = Column(Integer, nullable=False)
    status = Column(Enum(WishlistStatus), default=WishlistStatus.WAITING, index=True)
    
    added_date = Column(DateTime(timezone=True), server_default=func.now())
    purchased_date = Column(DateTime(timezone=True), nullable=True)
    removed_date = Column(DateTime(timezone=True), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
