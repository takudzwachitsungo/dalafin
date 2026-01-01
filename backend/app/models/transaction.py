from sqlalchemy import Column, String, Numeric, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from app.core.database import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    amount = Column(Numeric(10, 2), nullable=False)
    category = Column(String, nullable=False, index=True)
    date = Column(DateTime(timezone=True), nullable=False, index=True, server_default=func.now())
    
    is_impulse = Column(Boolean, default=False, index=True)
    note = Column(Text, nullable=True)
    emergency_reason = Column(Text, nullable=True)  # For emergency pause overrides
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
