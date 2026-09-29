"""
Reddit post repository – stores raw posts fetched from Reddit.
"""

from datetime import datetime, timezone
from database.mongodb import get_collection

COLLECTION = "reddit_posts"


async def bulk_insert_posts(posts: list[dict]) -> int:
    """Insert multiple posts (skips duplicates via unique index on post_id).
    Returns the count of newly inserted documents.
    """
    if not posts:
        return 0
    for p in posts:
        p.setdefault("stored_at", datetime.now(timezone.utc))
    try:
        result = await get_collection(COLLECTION).insert_many(posts, ordered=False)
        return len(result.inserted_ids)
    except Exception:
        # BulkWriteError from duplicate post_id – partial inserts are fine
        return 0


async def get_recent_posts(limit: int = 50) -> list[dict]:
    """Return the most recent Reddit posts."""
    cursor = (
        get_collection(COLLECTION)
        .find()
        .sort("created_utc", -1)
        .limit(limit)
    )
    return await cursor.to_list(length=limit)


async def get_posts_since(since: datetime) -> list[dict]:
    """Return posts created after a given timestamp."""
    cursor = (
        get_collection(COLLECTION)
        .find({"created_utc": {"$gte": since}})
        .sort("created_utc", -1)
    )
    return await cursor.to_list(length=1000)


async def count_posts() -> int:
    """Total number of stored Reddit posts."""
    return await get_collection(COLLECTION).count_documents({})
