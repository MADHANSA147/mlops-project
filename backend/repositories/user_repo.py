"""
User repository – CRUD operations on the 'users' collection.
"""

from datetime import datetime, timezone
from bson import ObjectId
from database.mongodb import get_collection


COLLECTION = "users"


async def create_user(email: str, hashed_password: str, name: str) -> dict:
    """Insert a new user and return the created document."""
    doc = {
        "email": email,
        "password": hashed_password,
        "name": name,
        "role": "analyst",
        "created_at": datetime.now(timezone.utc),
    }
    result = await get_collection(COLLECTION).insert_one(doc)
    doc["_id"] = result.inserted_id
    return doc


async def find_by_email(email: str) -> dict | None:
    """Find a user by email address."""
    return await get_collection(COLLECTION).find_one({"email": email})


async def find_by_id(user_id: str) -> dict | None:
    """Find a user by ObjectId string."""
    try:
        return await get_collection(COLLECTION).find_one({"_id": ObjectId(user_id)})
    except Exception:
        return None


async def count_users() -> int:
    """Return total number of registered users."""
    return await get_collection(COLLECTION).count_documents({})
