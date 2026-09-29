"""
Prediction repository – stores and retrieves fake news detection results.
"""

from datetime import datetime, timezone
from database.mongodb import get_collection

COLLECTION = "fake_news_predictions"


async def save_prediction(prediction: dict) -> dict:
    """Insert a detection result and return it with its _id."""
    prediction["timestamp"] = prediction.get("timestamp", datetime.now(timezone.utc))
    result = await get_collection(COLLECTION).insert_one(prediction)
    prediction["_id"] = result.inserted_id
    return prediction


async def get_history(user_id: str | None = None, limit: int = 20) -> list[dict]:
    """Return recent predictions, optionally filtered by user."""
    query = {"user_id": user_id} if user_id else {}
    cursor = (
        get_collection(COLLECTION)
        .find(query)
        .sort("timestamp", -1)
        .limit(limit)
    )
    return await cursor.to_list(length=limit)


async def count_predictions() -> int:
    """Total number of predictions."""
    return await get_collection(COLLECTION).count_documents({})


async def count_fake() -> int:
    """Total number of predictions labelled as Fake."""
    return await get_collection(COLLECTION).count_documents({"label": "Fake"})
