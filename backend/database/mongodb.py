"""
Async MongoDB connection using Motor.
Provides a singleton client and helper to get collections.
"""

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from utils.logger import logger
from config import get_settings

settings = get_settings()

# ── Module-level singleton ───────────────────────────────────────
_client: AsyncIOMotorClient | None = None
_database: AsyncIOMotorDatabase | None = None


async def connect_db() -> None:
    """Initialize the Motor client and verify connectivity."""
    global _client, _database
    _client = AsyncIOMotorClient(settings.mongodb_url)
    _database = _client[settings.db_name]
    # Verify connection
    try:
        await _client.admin.command("ping")
        logger.info("MongoDB connected → %s / %s", settings.mongodb_url, settings.db_name)
    except Exception as exc:
        logger.error("MongoDB connection failed: %s", exc)
        raise

    # Create indexes
    await _create_indexes()


async def _create_indexes() -> None:
    """Create required indexes for performance."""
    db = get_database()
    # Users – unique email
    await db["users"].create_index("email", unique=True)
    # Predictions – user + timestamp for history queries
    await db["fake_news_predictions"].create_index([("user_id", 1), ("timestamp", -1)])
    # Reddit posts – indexed by created_utc for time-range queries
    await db["reddit_posts"].create_index("created_utc")
    await db["reddit_posts"].create_index("post_id", unique=True)
    # Trending topics – topic name for lookups
    await db["trending_topics"].create_index("topic", unique=True)
    # Trend windows – timestamp for ordering
    await db["trend_windows"].create_index("timestamp", unique=True)
    # Audit logs – timestamp
    await db["audit_logs"].create_index("timestamp")
    logger.info("MongoDB indexes ensured")


async def close_db() -> None:
    """Close the Motor client."""
    global _client, _database
    if _client:
        _client.close()
        _client = None
        _database = None
        logger.info("MongoDB connection closed")


def get_database() -> AsyncIOMotorDatabase:
    """Return the database instance. Raises if not connected."""
    if _database is None:
        raise RuntimeError("Database not initialized – call connect_db() first")
    return _database


def get_collection(name: str):
    """Shortcut to get a named collection."""
    return get_database()[name]
