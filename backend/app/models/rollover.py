from sqlalchemy import Column, Numeric, Boolean, Date, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from app.core.database import Base


class BudgetRollover(Base):
    __tablename__ = "budget_rollovers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    date = Column(Date, nullable=False, index=True)
    unused_amount = Column(Numeric(10, 2), nullable=False)
    rollover_applied = Column(Boolean, default=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
