from sqlalchemy import Column, String, Numeric, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from database import Base

class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    amount = Column(Numeric(10, 2), nullable=False)
    category = Column(String, nullable=False, index=True)
    date = Column(DateTime, nullable=False, default=datetime.utcnow, index=True)
    is_impulse = Column(Boolean, default=False, index=True)
    note = Column(Text)
    emergency_reason = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", backref="transactions")
