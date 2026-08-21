"""
Pydantic schemas and MongoDB helpers for Authentication / Users.

Document shape:
{
    "_id": ObjectId,
    "email": str,
    "hashed_password": str,
    "name": str,
    "role": "donor" | "hospital" | "admin",
    "created_at": datetime
}
"""
import hashlib
from datetime import datetime, timezone
from typing import Optional
from enum import Enum
from pydantic import BaseModel, EmailStr, Field


class UserRole(str, Enum):
    DONOR = "donor"
    HOSPITAL = "hospital"
    ADMIN = "admin"


def hash_password(password: str) -> str:
    """Hash password using SHA-256 with static salt for simple MVP auth."""
    salt = "bloodlink_secure_salt_2026"
    return hashlib.sha256((password + salt).encode("utf-8")).hexdigest()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return hash_password(plain_password) == hashed_password


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, description="Full Name")
    email: str = Field(..., description="Email address")
    password: str = Field(..., min_length=6, description="Password (min 6 chars)")
    role: UserRole = Field(UserRole.DONOR, description="User role")


class UserLogin(BaseModel):
    email: str = Field(..., description="Email address")
    password: str = Field(..., description="Password")


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: UserRole
    created_at: datetime


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


def user_helper(user: dict) -> dict:
    return {
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
        "created_at": user["created_at"],
    }
