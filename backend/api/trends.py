"""
Trend analysis API routes.

GET /api/trends           – Full trend page data (summary, items, charts, recent rows)
GET /api/trends/top       – Top 6 trending items only
GET /api/trends/{id}      – Detailed view for a single trend
"""

from fastapi import APIRouter, Depends
from models.trends import TrendPageResponse, TrendDetail, TrendItem
from services import trend_service
from utils.security import get_current_user

router = APIRouter(prefix="/trends", tags=["Trend Analysis"])


@router.get("", response_model=TrendPageResponse)
async def list_trends(current_user: dict = Depends(get_current_user)):
    """Return all data needed for the Trend Analysis page in one call."""
    return await trend_service.get_trend_page_data()


@router.get("/top", response_model=list[TrendItem])
async def top_trends(current_user: dict = Depends(get_current_user)):
    """Return the top 6 trending items."""
    data = await trend_service.get_trend_page_data()
    return data.items[:6]


@router.get("/{topic_id}", response_model=TrendDetail)
async def trend_detail(topic_id: str, current_user: dict = Depends(get_current_user)):
    """Return full detail for a single trend including sentiment, charts, and posts."""
    return await trend_service.get_trend_detail(topic_id)
