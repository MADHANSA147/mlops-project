"""
Model health Pydantic models.
Matches the frontend's ModelHealth and ModelMetric TypeScript interfaces.
"""

from pydantic import BaseModel


class ModelMetric(BaseModel):
    """A single model performance metric with its target."""
    name: str
    value: float
    target: float
    unit: str
    status: str  # "healthy" | "warning" | "critical"


class ModelHealthResponse(BaseModel):
    """Full model health payload returned by GET /model/health.
    
    Matches the frontend's ModelHealth interface.
    """
    accuracy: ModelMetric
    precision: ModelMetric
    recall: ModelMetric
    f1Score: ModelMetric
    latency: ModelMetric
    uptime: ModelMetric
    lastTrained: str
    version: str
    status: str  # "operational" | "degraded" | "down"
