"""
Authentication service – handles registration, login, and profile lookup.
"""

from fastapi import HTTPException, status
from repositories import user_repo
from utils.security import hash_password, verify_password, create_access_token
from models.auth import UserProfile, TokenResponse
from utils.logger import logger


async def register_user(email: str, password: str, name: str) -> TokenResponse:
    """Register a new user and return a JWT token."""
    existing = await user_repo.find_by_email(email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists",
        )

    hashed = hash_password(password)
    user = await user_repo.create_user(email, hashed, name)
    logger.info("User registered: %s", email)

    profile = UserProfile(
        id=str(user["_id"]),
        email=user["email"],
        name=user["name"],
        role=user.get("role", "analyst"),
        created_at=user.get("created_at"),
    )

    token = create_access_token({
        "sub": str(user["_id"]),
        "email": user["email"],
        "name": user["name"],
    })

    return TokenResponse(access_token=token, user=profile)


async def login_user(email: str, password: str) -> TokenResponse:
    """Authenticate a user and return a JWT token."""
    user = await user_repo.find_by_email(email)
    if not user or not verify_password(password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    logger.info("User logged in: %s", email)

    profile = UserProfile(
        id=str(user["_id"]),
        email=user["email"],
        name=user["name"],
        role=user.get("role", "analyst"),
        created_at=user.get("created_at"),
    )

    token = create_access_token({
        "sub": str(user["_id"]),
        "email": user["email"],
        "name": user["name"],
    })

    return TokenResponse(access_token=token, user=profile)


async def get_user_profile(user_id: str) -> UserProfile:
    """Return a user's profile by ID."""
    user = await user_repo.find_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return UserProfile(
        id=str(user["_id"]),
        email=user["email"],
        name=user["name"],
        role=user.get("role", "analyst"),
        created_at=user.get("created_at"),
    )
