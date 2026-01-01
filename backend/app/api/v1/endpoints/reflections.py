from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def list_reflections():
    """List user reflections"""
    return {"message": "Reflections endpoint - coming soon"}
