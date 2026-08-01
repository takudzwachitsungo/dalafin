from sqlalchemy import Column, String, Numeric, DateTime, Boolean, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from database import Base

class RecurringExpense(Base):
    __tablename__ = "recurring_expenses"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    account_id = Column(UUID(as_uuid=True), ForeignKey("accounts.id"), nullable=True)
    name = Column(String, nullable=False) # e.g., "WiFi/Data", "ZESA Electricity", "Rent"
    amount = Column(Numeric(10, 2), nullable=False)
    category = Column(String, nullable=False)
    frequency = Column(String, default="monthly") # "weekly", "monthly", "yearly"
    due_day = Column(Integer, nullable=False) # Day of month (1-31)
    is_auto_log = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    last_logged_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", backref="recurring_expenses")
    account = relationship("Account")
