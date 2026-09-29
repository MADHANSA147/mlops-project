"""
Fake news detection API routes.

POST /api/detection/analyze  – Analyze text for fake news
GET  /api/detection/history  – Get recent detection history
"""

from fastapi import APIRouter, Depends
from models.detection import DetectionRequest, DetectionResponse, DetectionHistoryResponse
from services import detection_service
from utils.security import get_current_user

router = APIRouter(prefix="/detection", tags=["Fake News Detection"])


@router.post("/analyze", response_model=DetectionResponse)
async def analyze(body: DetectionRequest, current_user: dict = Depends(get_current_user)):
    """Run the fake news detection model on the provided text."""
    return await detection_service.analyze_text(body.text, user_id=current_user["user_id"])


@router.get("/history", response_model=DetectionHistoryResponse)
async def history(current_user: dict = Depends(get_current_user)):
    """Return the user's recent detection history."""
    predictions = await detection_service.get_detection_history(
        user_id=current_user["user_id"]
    )
    return DetectionHistoryResponse(predictions=predictions, total=len(predictions))
