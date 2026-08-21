"""
FastAPI application entry point.

Startup responsibilities:
  - Connect to MongoDB via Motor
  - Create collection indexes for efficient querying
  - Register all routers with their prefixes
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import connect_to_mongo, close_mongo_connection
from .routers import donors, hospitals, requests, auth


# ---------------------------------------------------------------------------
# Lifespan — runs once on startup and once on shutdown
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    # ── Connect ──────────────────────────────────────────────────────────────
    await connect_to_mongo(app)

    # ── Create indexes for fast donor search queries ─────────────────────────
    db = app.state.db
    await db.donors.create_index("blood_group")
    await db.donors.create_index("is_available")
    await db.donors.create_index([("location.city", 1)])
    await db.donors.create_index([("location.state", 1)])
    # Compound index — the most common search pattern: blood group + availability
    await db.donors.create_index([("blood_group", 1), ("is_available", 1)])

    await db.requests.create_index("hospital_id")
    await db.requests.create_index("status")
    await db.requests.create_index([("required_blood_group", 1), ("urgency", -1)])
    print("[DB] MongoDB indexes created/verified.")

    yield  # ── Application runs ─────────────────────────────────────────────

    # ── Disconnect ───────────────────────────────────────────────────────────
    await close_mongo_connection(app)


# ---------------------------------------------------------------------------
# Application factory
# ---------------------------------------------------------------------------

app = FastAPI(
    title="Blood Donation Management System API",
    description=(
        "REST API for managing blood donors, hospitals, and blood requests. "
        "Supports donor registration, hospital registration, blood request creation, "
        "and donor search with multi-field filtering."
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS — allow the Vite React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router,      prefix="/auth",      tags=["Authentication"])
app.include_router(donors.router,    prefix="/donors",    tags=["Donors"])
app.include_router(hospitals.router, prefix="/hospitals", tags=["Hospitals"])
app.include_router(requests.router,  prefix="/requests",  tags=["Blood Requests"])


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"], summary="API health check")
async def root():
    return {
        "message": "Blood Donation API is running.",
        "status": "ok",
        "version": "1.0.0",
    }
