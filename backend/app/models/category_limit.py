from sqlalchemy import Column, String, Numeric, Date, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from app.core.database import Base


class CategoryLimit(Base):
    __tablename__ = "category_limits"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    category = Column(String, nullable=False)
    monthly_limit = Column(Numeric(10, 2), nullable=False, default=0)
    spent = Column(Numeric(10, 2), nullable=False, default=0)
    reset_date = Column(Date, nullable=False, server_default=func.current_date())
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
