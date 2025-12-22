from fastapi import APIRouter, HTTPException
from app.schemas.suggest import SuggestRequest
from app.schemas.jobs import JobCreateResponse, JobStatus
from app.workers.celery_app import celery_app
import uuid

router = APIRouter(prefix="/ai", tags=["ai-suggest"])

@router.post("/suggest", response_model=JobCreateResponse, status_code=202)
async def create_suggest_task(request: SuggestRequest):
    """
    Create a suggestion task for syllabus content
    Returns 202 with job ID for polling
    """
    try:
        # Generate job ID
        job_id = str(uuid.uuid4())
        
        # Convert request to dict
        payload = request.dict()
        
        # Send task to Celery via RabbitMQ
        task = celery_app.send_task(
            'tasks.suggest',
            args=[payload, job_id],
            task_id=job_id
        )
        
        return JobCreateResponse(
            jobId=task.id,
            status=JobStatus.QUEUED,
            message="Suggestion task queued successfully"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create task: {str(e)}")
