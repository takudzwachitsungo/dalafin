from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from config import settings
from database import Base, engine

# Ensure all SQLAlchemy models are registered
import models.user
import models.account
import models.transaction
import models.recurring
import models.reflection
import models.goal
import models.category_limit
import models.wishlist
import models.streak
import models.rollover

from routes import (
    auth, 
    accounts,
    transactions, 
    reflections, 
    goals, 
    category_limits, 
    wishlist, 
    budget, 
    streaks, 
    reports,
    insights
)
from services.scheduler import init_scheduler, shutdown_scheduler

# Create database tables
Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    # Startup
    init_scheduler()
    yield
    # Shutdown
    shutdown_scheduler()

app = FastAPI(
    title="Dalafin Finance API",
    description="Behavior-driven personal finance application API with Tariff Engine",
    version="1.1.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(accounts.router)
app.include_router(transactions.router)
app.include_router(reflections.router)
app.include_router(goals.router)
app.include_router(category_limits.router)
app.include_router(wishlist.router)
app.include_router(budget.router)
app.include_router(streaks.router)
app.include_router(reports.router)
app.include_router(insights.router)

@app.get("/")
def read_root():
    return {
        "message": "Dalafin API Online",
        "version": "1.1.0",
        "status": "healthy"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
