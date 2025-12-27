from fastapi import APIRouter, HTTPException
from app.schemas.suggest_clo import SuggestSimilarCLORequest
from app.schemas.jobs import JobCreateResponse
from app.workers.celery_app import celery_app
from app.database.connection import SessionLocal
from app.repositories.job_repository import JobRepository
import uuid

router = APIRouter(prefix="/ai", tags=["ai-clo"])

@router.post("/suggest-similar-clos", response_model=JobCreateResponse, status_code=202)
async def suggest_similar_clos(request: SuggestSimilarCLORequest):
    """
    Suggest similar CLOs from existing syllabuses
    
    Returns 202 with job ID for polling
    AI will search database and find CLOs with similar content/context
    """
    try:
        job_id = str(uuid.uuid4())
        payload = request.dict()
        
        # Store job in database
        db = SessionLocal()
        try:
            JobRepository.create_job(
                db=db,
                job_id=job_id,
                task_type="suggest_clo",
                user_id=None,  # Optional
                syllabus_id=None,  # Not tied to specific syllabus
                request_data=payload
            )
            db.commit()
        finally:
            db.close()
        
        # Queue background task
        celery_app.send_task(
            "app.workers.tasks.process_suggest_similar_clo",
            args=[job_id, payload]
        )
        
        return {
            "jobId": job_id,
            "status": "queued",
            "message": "Similar CLO search task queued successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create task: {str(e)}")
