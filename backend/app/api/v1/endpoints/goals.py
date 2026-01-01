from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def list_goals():
    """List user goals"""
    return {"message": "Goals endpoint - coming soon"}
