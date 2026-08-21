"""
Motor async MongoDB client.

Usage inside route handlers:
    from ..database import get_db
    from fastapi import Depends

    @router.get("/")
    async def my_route(db=Depends(get_db)):
        ...
"""
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from fastapi import Request
from .config import settings


# ---------------------------------------------------------------------------
# Lifecycle helpers — called by the lifespan context manager in main.py
# ---------------------------------------------------------------------------

async def connect_to_mongo(app):
    """Create the Motor client and store it on the FastAPI app state."""
    app.state.mongo_client = AsyncIOMotorClient(settings.mongodb_url)
    app.state.db = app.state.mongo_client[settings.database_name]
    print(f"[DB] Connected to MongoDB — database: '{settings.database_name}'")


async def close_mongo_connection(app):
    """Close the Motor client gracefully on shutdown."""
    if hasattr(app.state, "mongo_client") and app.state.mongo_client:
        app.state.mongo_client.close()
        print("[DB] MongoDB connection closed.")


# ---------------------------------------------------------------------------
# FastAPI dependency — inject the DB into any route with Depends(get_db)
# ---------------------------------------------------------------------------

async def get_db(request: Request) -> AsyncIOMotorDatabase:
    """Yield the shared Motor database instance from app state."""
    return request.app.state.db
