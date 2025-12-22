# ai-service/app/main.py
from fastapi import FastAPI
from app.routers import health

app = FastAPI(title="AI Service")

app.include_router(health.router)
