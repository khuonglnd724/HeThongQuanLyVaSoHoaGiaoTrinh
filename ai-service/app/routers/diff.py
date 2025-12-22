from fastapi import APIRouter, HTTPException
from app.schemas.diff import DiffRequest
from app.schemas.jobs import JobCreateResponse, JobStatus
from app.workers.celery_app import celery_app
import uuid

router = APIRouter(prefix="/ai", tags=["ai-diff"])

@router.post("/diff", response_model=JobCreateResponse, status_code=202)
async def create_diff_task(request: DiffRequest):
    """
    Create a diff detection task between syllabus versions
    Returns 202 with job ID for polling
    """
    try:
        job_id = str(uuid.uuid4())
        payload = request.dict()
        
        task = celery_app.send_task(
            'tasks.diff',
            args=[payload, job_id],
            task_id=job_id
        )
        
        return JobCreateResponse(
            jobId=task.id,
            status=JobStatus.QUEUED,
            message="Diff task queued successfully"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create diff task: {str(e)}")
