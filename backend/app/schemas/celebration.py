from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field, ConfigDict


class MilestoneType(str, Enum):
    STREAK_7 = "streak_7"
    STREAK_30 = "streak_30"
    SAVED_100 = "saved_100"
    SAVED_500 = "saved_500"
    SAVED_1000 = "saved_1000"
    IMPULSES_5 = "impulses_5"
    IMPULSES_20 = "impulses_20"
    IMPULSES_50 = "impulses_50"


class CelebrationResponse(BaseModel):
    id: str
    user_id: str
    milestone_type: MilestoneType
    shown: bool
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
