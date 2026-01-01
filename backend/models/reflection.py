from sqlalchemy import Column, String, ForeignKey, Date, Text, DateTime, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from database import Base

class Reflection(Base):
    __tablename__ = "reflections"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)
    regret_purchase = Column(Text)
    good_purchase = Column(Text)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", backref="reflections")
    
    __table_args__ = (
        UniqueConstraint('user_id', 'date', name='unique_reflection_per_day'),
    )
