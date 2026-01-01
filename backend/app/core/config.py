from pydantic_settings import BaseSettings
from typing import Optional, List


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str
    
    # Redis (optional for now)
    REDIS_URL: Optional[str] = "redis://localhost:6379/0"
    
    # JWT
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Minimax API
    MINIMAX_API_KEY: str
    MINIMAX_API_URL: str = "https://api.minimax.chat/v1/text/chatcompletion_v2"
    
    # Application
    ENVIRONMENT: str = "development"
    FRONTEND_URL: str = "http://localhost:5173"
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"
    
    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
    
    # Rate Limiting
    RATE_LIMIT_TRANSACTIONS: int = 100
    RATE_LIMIT_AUTH_ATTEMPTS: int = 5
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"  # Allow extra fields in .env


settings = Settings()
