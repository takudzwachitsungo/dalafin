from sqlalchemy import Column, Integer, Numeric, Date, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from app.core.database import Base


class UserStreak(Base):
    __tablename__ = "user_streaks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    
    current_streak = Column(Integer, default=0)
    longest_streak = Column(Integer, default=0)
    impulses_avoided = Column(Integer, default=0)
    last_streak_date = Column(Date, nullable=True)
    
    # Rollover budget (max 3 days worth)
    rollover_budget = Column(Numeric(10, 2), default=0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
