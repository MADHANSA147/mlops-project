"""
Fake news detection Pydantic models.
Matches the frontend's DetectionResult TypeScript interface.
"""

from datetime import datetime
from pydantic import BaseModel, Field


class DetectionRequest(BaseModel):
    """Request body for the analyze endpoint."""
    text: str = Field(min_length=1, max_length=50000)


class DetectionResponse(BaseModel):
    """Result returned after model inference.
    
    Shape matches the frontend's DetectionResult type:
      id, text, fakeProbability, realProbability, label, confidence, flaggedPhrases, timestamp
    """
    id: str
    text: str
    fakeProbability: float
    realProbability: float
    label: str  # "Fake" | "Real" | "Uncertain"
    confidence: float
    flaggedPhrases: list[str] = []
    timestamp: str
    model_version: str = "v1.0"


class DetectionHistoryResponse(BaseModel):
    """Wrapper for the history list."""
    predictions: list[DetectionResponse]
    total: int
