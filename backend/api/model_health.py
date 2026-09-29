"""
Model health API routes.

GET /api/model/health – Model performance metrics and system status
"""

from fastapi import APIRouter, Depends
from models.model_health import ModelHealthResponse
from services import model_health_service
from utils.security import get_current_user

router = APIRouter(prefix="/model", tags=["Model Health"])


@router.get("/health", response_model=ModelHealthResponse)
async def model_health(current_user: dict = Depends(get_current_user)):
    """Return current model health metrics."""
    return await model_health_service.get_model_health()
