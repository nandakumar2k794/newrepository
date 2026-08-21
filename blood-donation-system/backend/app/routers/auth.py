"""
Authentication & User Router
=============================

Endpoints:
POST /auth/register   Register user (donor/hospital/admin)
POST /auth/login      Login user & return session info
GET  /auth/me         Get current user profile
"""
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Header, status
from ..database import get_db
from ..models.auth import (
    UserRegister, UserLogin, UserResponse, TokenResponse,
    hash_password, verify_password, user_helper
)

router = APIRouter()


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user (Donor, Hospital Admin, or System Admin)",
)
async def register(user_in: UserRegister, db=Depends(get_db)):
    # Check if email exists
    existing = await db.users.find_one({"email": user_in.email.lower()})
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"An account with email '{user_in.email}' already exists."
        )

    now = datetime.now(timezone.utc)
    user_dict = {
        "name": user_in.name.strip(),
        "email": user_in.email.lower().strip(),
        "hashed_password": hash_password(user_in.password),
        "role": user_in.role.value,
        "created_at": now
    }

    result = await db.users.insert_one(user_dict)
    created = await db.users.find_one({"_id": result.inserted_id})
    user_res = user_helper(created)

    return {
        "access_token": f"token_{user_res['id']}",
        "token_type": "bearer",
        "user": user_res
    }


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Login with email and password",
)
async def login(credentials: UserLogin, db=Depends(get_db)):
    user = await db.users.find_one({"email": credentials.email.lower().strip()})
    if not user or not verify_password(credentials.password, user["hashed_password"]):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password. Please check your credentials."
        )

    user_res = user_helper(user)
    return {
        "access_token": f"token_{user_res['id']}",
        "token_type": "bearer",
        "user": user_res
    }


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current user info",
)
async def get_me(email: str = Header(..., alias="X-User-Email"), db=Depends(get_db)):
    user = await db.users.find_one({"email": email.lower().strip()})
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    return user_helper(user)
