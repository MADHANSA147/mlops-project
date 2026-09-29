"""
Trend repository – manages trending_topics and trend_windows collections.
"""

from datetime import datetime, timezone
from database.mongodb import get_collection

TOPICS_COLLECTION = "trending_topics"
WINDOWS_COLLECTION = "trend_windows"


# ── Trending Topics ──────────────────────────────────────────────

async def upsert_trending_topic(topic_data: dict) -> None:
    """Upsert a trending topic by its topic name."""
    topic_data["last_updated"] = datetime.now(timezone.utc)
    await get_collection(TOPICS_COLLECTION).update_one(
        {"topic": topic_data["topic"]},
        {"$set": topic_data},
        upsert=True,
    )


async def get_top_trends(limit: int = 10) -> list[dict]:
    """Return topics sorted by trend_score descending."""
    cursor = (
        get_collection(TOPICS_COLLECTION)
        .find()
        .sort("trend_score", -1)
        .limit(limit)
    )
    return await cursor.to_list(length=limit)


async def get_all_trends() -> list[dict]:
    """Return all trending topics sorted by trend_score descending."""
    cursor = get_collection(TOPICS_COLLECTION).find().sort("trend_score", -1)
    return await cursor.to_list(length=100)


async def get_trend_by_id(topic_id: str) -> dict | None:
    """Find a trending topic by its string id field."""
    return await get_collection(TOPICS_COLLECTION).find_one({"id": topic_id})


async def get_trend_by_topic(topic: str) -> dict | None:
    """Find a trending topic by name."""
    return await get_collection(TOPICS_COLLECTION).find_one({"topic": topic})


async def count_trends() -> int:
    """Total number of trending topics tracked."""
    return await get_collection(TOPICS_COLLECTION).count_documents({})


# ── Trend Windows ────────────────────────────────────────────────

async def save_trend_window(window: dict) -> None:
    """Store a snapshot of the trend analysis window."""
    window["timestamp"] = datetime.now(timezone.utc)
    await get_collection(WINDOWS_COLLECTION).insert_one(window)


async def get_latest_window() -> dict | None:
    """Return the most recent trend window."""
    return await get_collection(WINDOWS_COLLECTION).find_one(
        sort=[("timestamp", -1)]
    )


async def get_recent_windows(limit: int = 24) -> list[dict]:
    """Return recent trend windows for time-series display."""
    cursor = (
        get_collection(WINDOWS_COLLECTION)
        .find()
        .sort("timestamp", -1)
        .limit(limit)
    )
    return await cursor.to_list(length=limit)
