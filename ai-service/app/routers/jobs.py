from fastapi import APIRouter, HTTPException
from app.schemas.jobs import JobResponse, JobStatus
from app.workers.celery_app import celery_app
from celery.result import AsyncResult
from datetime import datetime

router = APIRouter(prefix="/ai/jobs", tags=["jobs"])

@router.get("/{job_id}", response_model=JobResponse)
async def get_job_status(job_id: str):
    """
    Get job status and result by job ID
    """
    try:
        task_result = AsyncResult(job_id, app=celery_app)
        
        # Map Celery states to our JobStatus
        status_map = {
            'PENDING': JobStatus.QUEUED,
            'STARTED': JobStatus.RUNNING,
            'PROGRESS': JobStatus.RUNNING,
            'SUCCESS': JobStatus.SUCCEEDED,
            'FAILURE': JobStatus.FAILED,
            'REVOKED': JobStatus.CANCELED,
        }
        
        status = status_map.get(task_result.state, JobStatus.QUEUED)
        
        # Get progress if available
        progress = 0
        if task_result.state == 'PROGRESS' and task_result.info:
            progress = task_result.info.get('progress', 0)
        elif status == JobStatus.SUCCEEDED:
            progress = 100
        
        # Get result or error
        result = None
        error = None
        
        if status == JobStatus.SUCCEEDED:
            result = task_result.result
        elif status == JobStatus.FAILED:
            error = str(task_result.info) if task_result.info else "Task failed"
        
        # Extract task type from task name if available
        task_type = "unknown"
        if task_result.name:
            task_type = task_result.name.split('.')[-1]
        
        return JobResponse(
            jobId=job_id,
            taskType=task_type,
            status=status,
            createdAt=datetime.utcnow(),  # Celery doesn't store creation time easily
            updatedAt=datetime.utcnow(),
            progress=progress,
            meta=None,
            result=result,
            error=error
        )
        
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Job not found: {str(e)}")

@router.post("/{job_id}/cancel")
async def cancel_job(job_id: str):
    """
    Cancel a running job
    """
    try:
        task_result = AsyncResult(job_id, app=celery_app)
        task_result.revoke(terminate=True)
        return {"message": "Job cancellation requested", "jobId": job_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to cancel job: {str(e)}")
