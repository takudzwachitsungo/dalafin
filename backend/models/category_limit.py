from sqlalchemy import Column, String, Numeric, ForeignKey, Date, DateTime, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from database import Base

class CategoryLimit(Base):
    __tablename__ = "category_limits"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    category = Column(String, nullable=False)
    monthly_limit = Column(Numeric(10, 2), nullable=False)
    spent = Column(Numeric(10, 2), default=0)
    reset_date = Column(Date, default=datetime.utcnow)
    
    user = relationship("User", backref="category_limits")
    
    @property
    def remaining(self):
        """Calculate remaining budget"""
        return max(0, float(self.monthly_limit - self.spent))
    
    @property
    def percentage_used(self):
        """Calculate percentage of budget used"""
        if self.monthly_limit > 0:
            return min(100, (float(self.spent) / float(self.monthly_limit)) * 100)
        return 0
