"""
Authentication Pydantic models – request / response schemas.
"""

from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


class UserRegister(BaseModel):
    """Registration request."""
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    name: str = Field(min_length=1, max_length=100)


class UserLogin(BaseModel):
    """Login request."""
    email: EmailStr
    password: str


class UserProfile(BaseModel):
    """Public user profile returned in responses."""
    id: str
    email: str
    name: str
    role: str = "analyst"
    created_at: datetime | None = None


class TokenResponse(BaseModel):
    """JWT token response after login / register."""
    access_token: str
    token_type: str = "bearer"
    user: UserProfile
