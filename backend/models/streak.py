from sqlalchemy import Column, Integer, Numeric, ForeignKey, Date, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from database import Base

class UserStreak(Base):
    __tablename__ = "user_streaks"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, unique=True, index=True)
    current_streak = Column(Integer, default=0)
    longest_streak = Column(Integer, default=0)
    impulses_avoided = Column(Integer, default=0)
    last_streak_date = Column(Date)
    rollover_budget = Column(Numeric(10, 2), default=0)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User", backref="streak", uselist=False)
