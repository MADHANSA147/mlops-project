"""
Audit log repository – records significant system events.
"""

from datetime import datetime, timezone
from database.mongodb import get_collection

COLLECTION = "audit_logs"


async def log_event(action: str, user_id: str | None = None, details: dict | None = None) -> None:
    """Insert an audit log entry."""
    await get_collection(COLLECTION).insert_one({
        "action": action,
        "user_id": user_id,
        "details": details or {},
        "timestamp": datetime.now(timezone.utc),
    })


async def get_recent_logs(limit: int = 50) -> list[dict]:
    """Return the most recent audit log entries."""
    cursor = (
        get_collection(COLLECTION)
        .find()
        .sort("timestamp", -1)
        .limit(limit)
    )
    return await cursor.to_list(length=limit)
