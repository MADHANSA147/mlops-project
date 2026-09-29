"""
AIPI Backend – FastAPI application entry point.

Starts the server, connects to MongoDB, loads the ML model,
starts the trend scheduler, and mounts all API routers.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from config import get_settings
from database.mongodb import connect_db, close_db
from ml.predictor import load_model
from scheduler.trend_scheduler import start_scheduler, stop_scheduler
from websocket import manager
from utils.logger import logger

from api.auth import router as auth_router
from api.dashboard import router as dashboard_router
from api.detection import router as detection_router
from api.trends import router as trends_router
from api.model_health import router as model_health_router

settings = get_settings()


# ── Lifespan ─────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    # ── Startup ──────────────────────────────────────────────────
    logger.info("=" * 50)
    logger.info("  AIPI Backend Starting...")
    logger.info("=" * 50)

    # 1. Connect to MongoDB
    await connect_db()

    # 2. Load ML model
    load_model()

    # 3. Start trend scheduler
    start_scheduler()

    logger.info("AIPI Backend ready ✓")
    yield

    # ── Shutdown ─────────────────────────────────────────────────
    logger.info("Shutting down AIPI Backend...")
    stop_scheduler()
    await close_db()
    logger.info("AIPI Backend stopped")


# ── App ──────────────────────────────────────────────────────────
app = FastAPI(
    title="AI Policy Intelligence Platform",
    description="FastAPI backend for fake news detection and social media trend analysis",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ─────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Mount API routers (all under /api prefix) ────────────────────
app.include_router(auth_router, prefix="/api")
app.include_router(dashboard_router, prefix="/api")
app.include_router(detection_router, prefix="/api")
app.include_router(trends_router, prefix="/api")
app.include_router(model_health_router, prefix="/api")


# ── WebSocket endpoint ───────────────────────────────────────────
@app.websocket("/ws/dashboard")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket for real-time dashboard updates."""
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive – listen for client pings
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        manager.disconnect(websocket)


# ── Health check ─────────────────────────────────────────────────
@app.get("/health", tags=["System"])
async def health_check():
    """Simple health check endpoint."""
    return {"status": "ok", "service": "AIPI Backend", "version": "1.0.0"}


# ── Run directly ─────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
