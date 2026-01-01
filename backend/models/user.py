from sqlalchemy import Column, String, Numeric, DateTime, Integer
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    monthly_income = Column(Numeric(10, 2), default=0)
    fixed_expenses = Column(Numeric(10, 2), default=0)
    timezone = Column(String, default="UTC")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    @property
    def daily_limit(self):
        """Calculate daily spending limit"""
        if self.monthly_income > self.fixed_expenses:
            return float((self.monthly_income - self.fixed_expenses) / 30)
        return 0.0
