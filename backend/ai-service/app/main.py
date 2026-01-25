# ai-service/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import logging
import threading

from app.routers import health, jobs, suggest, chat, diff, clo_check, summary, notifications, suggest_clo, documents
from app.database.connection import init_db, check_db_connection
from app.consumers.kafka_consumer import kafka_consumer

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="AI Service",
    description="AI Service for Syllabus Management System - handles suggestions, chat, diff detection, CLO-PLO checks, and summaries",
    version="1.0.0"
)

# CORS middleware - Only add if not behind API Gateway
# If behind API Gateway, let gateway handle CORS
ENABLE_CORS = False  # Set to True for direct access to ai-service
if ENABLE_CORS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Mount static files (HTML/CSS/JS)
static_path = Path(__file__).parent.parent / "static"
if static_path.exists():
    app.mount("/static", StaticFiles(directory=str(static_path)), name="static")

# Serve index.html on root
@app.get("/", include_in_schema=False)
async def serve_ui():
    """Serve the web UI (redirects to index.html)"""
    from fastapi.responses import FileResponse
    static_path = Path(__file__).parent.parent / "static"
    return FileResponse(static_path / "index.html")

# API root endpoint
@app.get("/api")
async def api_root():
    return {
        "service": "AI Service",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "health": "/health",
            "documents": {
                "ingest": "POST /ai/documents/ingest",
                "search": "GET /ai/documents/search",
                "collections": "GET /ai/documents/collections",
                "delete": "DELETE /ai/documents/{syllabus_id}"
            },
            "jobs": "/ai/jobs/{job_id}",
            "suggest": "POST /ai/suggest",
            "chat": "POST /ai/chat",
            "diff": "POST /ai/diff",
            "clo_check": "POST /ai/clo-check",
            "summary": "POST /ai/summary",
            "suggest_clo": "POST /ai/suggest-similar-clos",
            "notifications": {
                "websocket": "WS /notifications/ws/{user_id}",
                "rest": "GET /notifications"
            }
        }
    }

# Include routers with /ai prefix for all except health and notifications
app.include_router(health.router)
app.include_router(jobs.router, prefix="/ai")
app.include_router(documents.router, prefix="/ai")
app.include_router(suggest.router, prefix="/ai")
app.include_router(chat.router, prefix="/ai")
app.include_router(diff.router, prefix="/ai")
app.include_router(clo_check.router, prefix="/ai")
app.include_router(summary.router, prefix="/ai")
app.include_router(suggest_clo.router, prefix="/ai")
app.include_router(notifications.router)

# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize database and start Kafka consumer"""
    logger.info("Starting AI Service...")
    
    # Initialize database
    try:
        init_db()
        logger.info("✅ Database initialized")
    except Exception as e:
        logger.error(f"❌ Failed to initialize database: {e}")
    
    # Check database connection
    if not check_db_connection():
        logger.warning("⚠️  Database connection failed - some features may not work")
    else:
        logger.info("✅ Database connection OK")
    
    # Start Kafka consumer in background thread
    try:
        kafka_thread = threading.Thread(target=kafka_consumer.start, daemon=True)
        kafka_thread.start()
        logger.info("✅ Kafka consumer started")
    except Exception as e:
        logger.error(f"❌ Failed to start Kafka consumer: {e}")
    
    logger.info("✅ AI Service started successfully")

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("Shutting down AI Service...")
    kafka_consumer.stop()
    logger.info("✅ AI Service shut down")

