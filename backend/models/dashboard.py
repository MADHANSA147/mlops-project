"""
Dashboard Pydantic models.
"""

from pydantic import BaseModel


class DashboardSummary(BaseModel):
    """Summary data shown on the main dashboard page."""
    postsAnalyzed: str      # "1.28M" formatted
    activeTrends: int
    fakeNewsFlagged: int
    modelAccuracy: str      # "94.2%" formatted
    postsAnalyzedTrend: str
    activeTrendsTrend: str
    fakeNewsFlaggedTrend: str
    modelAccuracyTrend: str
