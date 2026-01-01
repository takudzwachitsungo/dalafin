from sqlalchemy import Column, String, Numeric, ForeignKey, Date, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from database import Base

class Goal(Base):
    __tablename__ = "goals"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    current = Column(Numeric(10, 2), default=0)
    target = Column(Numeric(10, 2), nullable=False)
    color = Column(String, default="bg-blue-500")
    deadline = Column(Date)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User", backref="goals")
    
    @property
    def progress_percentage(self):
        """Calculate progress percentage"""
        if self.target > 0:
            return min(100, (float(self.current) / float(self.target)) * 100)
        return 0
