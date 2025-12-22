# ai-service/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import health, jobs, suggest, chat, diff, clo_check, summary

app = FastAPI(
    title="AI Service",
    description="AI Service for Syllabus Management System - handles suggestions, chat, diff detection, CLO-PLO checks, and summaries",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router)
app.include_router(jobs.router)
app.include_router(suggest.router)
app.include_router(chat.router)
app.include_router(diff.router)
app.include_router(clo_check.router)
app.include_router(summary.router)

@app.get("/")
async def root():
    return {
        "service": "AI Service",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "health": "/health",
            "jobs": "/ai/jobs/{job_id}",
            "suggest": "POST /ai/suggest",
            "chat": "POST /ai/chat",
            "diff": "POST /ai/diff",
            "clo_check": "POST /ai/clo-check",
            "summary": "POST /ai/summary"
        }
    }
