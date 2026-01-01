from fastapi import APIRouter
from app.api.v1.endpoints import auth, transactions, reflections, goals, budget, income, wishlist, upload, avoided_impulses, reports, health

api_router = APIRouter()

api_router.include_router(health.router, tags=["health"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(transactions.router, prefix="/transactions", tags=["transactions"])
api_router.include_router(reflections.router, prefix="/reflections", tags=["reflections"])
api_router.include_router(goals.router, prefix="/goals", tags=["goals"])
api_router.include_router(budget.router, prefix="/budget", tags=["budget"])
api_router.include_router(income.router, prefix="/income", tags=["income"])
api_router.include_router(wishlist.router, prefix="/wishlist", tags=["wishlist"])
api_router.include_router(upload.router, prefix="/upload", tags=["upload"])
api_router.include_router(avoided_impulses.router, prefix="/avoided-impulses", tags=["avoided-impulses"])
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])
