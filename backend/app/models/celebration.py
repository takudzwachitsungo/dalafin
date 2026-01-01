from sqlalchemy import Column, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
import enum
from app.core.database import Base


class MilestoneType(str, enum.Enum):
    STREAK_7 = "streak_7"
    STREAK_30 = "streak_30"
    SAVED_100 = "saved_100"
    SAVED_500 = "saved_500"
    IMPULSES_5 = "impulses_5"
    IMPULSES_20 = "impulses_20"


class Celebration(Base):
    __tablename__ = "celebrations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    milestone_type = Column(Enum(MilestoneType), nullable=False, index=True)
    achieved_at = Column(DateTime(timezone=True), server_default=func.now())
    shown = Column(Boolean, default=False, index=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
