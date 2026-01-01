from sqlalchemy import Column, String, Numeric, ForeignKey, DateTime, Integer, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime, timedelta
from database import Base
import enum

class WishlistStatus(str, enum.Enum):
    waiting = "waiting"
    ready = "ready"
    purchased = "purchased"
    removed = "removed"

class WishlistItem(Base):
    __tablename__ = "wishlist_items"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    price = Column(Numeric(10, 2), nullable=False)
    cooldown_days = Column(Integer, nullable=False)
    added_date = Column(DateTime, default=datetime.utcnow, index=True)
    purchased_date = Column(DateTime)
    removed_date = Column(DateTime)
    status = Column(Enum(WishlistStatus), default=WishlistStatus.waiting, index=True)
    
    user = relationship("User", backref="wishlist_items")
    
    @property
    def ready_date(self):
        """Calculate when item becomes ready to purchase"""
        return self.added_date + timedelta(days=self.cooldown_days)
    
    @property
    def days_remaining(self):
        """Calculate days remaining in cooldown"""
        if self.status == WishlistStatus.ready:
            return 0
        remaining = (self.ready_date - datetime.utcnow()).days
        return max(0, remaining)
    
    @staticmethod
    def calculate_cooldown(price: float) -> int:
        """Calculate cooldown days based on price"""
        if price <= 50:
            return 14
        elif price <= 150:
            return 30
        else:
            return 45
