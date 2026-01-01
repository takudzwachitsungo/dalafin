from sqlalchemy import Column, String, Numeric, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    name = Column(String, nullable=False)
    
    # Financial settings
    monthly_income = Column(Numeric(10, 2), nullable=False, default=0)
    fixed_expenses = Column(Numeric(10, 2), nullable=False, default=0)
    
    # Timezone for accurate midnight calculations
    timezone = Column(String, default="UTC")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    @property
    def daily_limit(self) -> float:
        """Calculate daily spending limit"""
        if self.monthly_income <= self.fixed_expenses:
            return 0
        return float((self.monthly_income - self.fixed_expenses) / 30)
