from sqlalchemy import Column, String, Numeric, DateTime, Date, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import ForeignKey
from sqlalchemy.sql import func
import uuid
from app.core.database import Base


class Income(Base):
    __tablename__ = "incomes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    
    # Income details
    amount = Column(Numeric(10, 2), nullable=False)
    source = Column(String, nullable=False)  # e.g., "Gift", "Freelance", "Side Job", "Bonus"
    description = Column(Text, nullable=True)
    date = Column(DateTime(timezone=True), nullable=False, index=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
