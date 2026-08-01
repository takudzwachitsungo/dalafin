from sqlalchemy import Column, String, Numeric, DateTime, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from database import Base

class Account(Base):
    __tablename__ = "accounts"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String, nullable=False) # e.g. "USD Cash", "EcoCash", "CBZ Bank"
    account_type = Column(String, nullable=False) # "cash", "mobile_money", "bank", "card"
    currency = Column(String, default="USD")
    current_balance = Column(Numeric(12, 2), default=0.00)
    fee_tariff_type = Column(String, default="none") # "ecocash_usd", "ecocash_zig", "imtt_2percent", "custom", "none"
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", backref="accounts")
