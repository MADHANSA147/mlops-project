"""
Authentication API routes.

POST /api/auth/register  – Create a new user account
POST /api/auth/login     – Authenticate and receive JWT
GET  /api/auth/profile   – Get current user profile (requires auth)
"""

from fastapi import APIRouter, Depends
from models.auth import UserRegister, UserLogin, TokenResponse, UserProfile
from services import auth_service
from utils.security import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse)
async def register(body: UserRegister):
    """Register a new user and return a JWT token."""
    return await auth_service.register_user(body.email, body.password, body.name)


@router.post("/login", response_model=TokenResponse)
async def login(body: UserLogin):
    """Authenticate a user and return a JWT token."""
    return await auth_service.login_user(body.email, body.password)


@router.get("/profile", response_model=UserProfile)
async def profile(current_user: dict = Depends(get_current_user)):
    """Return the profile of the currently authenticated user."""
    return await auth_service.get_user_profile(current_user["user_id"])
