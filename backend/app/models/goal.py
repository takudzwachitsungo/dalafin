from sqlalchemy import Column, String, Numeric, Date, DateTime, ForeignKey, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from app.core.database import Base


class Goal(Base):
    __tablename__ = "goals"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    name = Column(String, nullable=False)
    current = Column(Numeric(10, 2), nullable=False, default=0)
    target = Column(Numeric(10, 2), nullable=False)
    color = Column(String, nullable=False, default="bg-blue-500")
    deadline = Column(Date, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    __table_args__ = (
        CheckConstraint('target > 0', name='positive_target'),
        CheckConstraint('current >= 0', name='non_negative_current'),
    )
