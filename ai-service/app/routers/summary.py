from fastapi import APIRouter, HTTPException
from app.schemas.summary import SummaryRequest
from app.schemas.jobs import JobCreateResponse, JobStatus
from app.workers.celery_app import celery_app
import uuid

router = APIRouter(prefix="/ai", tags=["ai-summary"])

@router.post("/summary", response_model=JobCreateResponse, status_code=202)
async def create_summary_task(request: SummaryRequest):
    """
    Create a summary generation task for syllabus content
    Returns 202 with job ID for polling
    """
    try:
        job_id = str(uuid.uuid4())
        payload = request.dict()
        
        task = celery_app.send_task(
            'tasks.summary',
            args=[payload, job_id],
            task_id=job_id
        )
        
        return JobCreateResponse(
            jobId=task.id,
            status=JobStatus.QUEUED,
            message="Summary task queued successfully"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create summary task: {str(e)}")
