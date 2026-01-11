from fastapi import APIRouter, HTTPException
from app.schemas.jobs import JobResponse, JobStatus
from app.workers.celery_app import celery_app
from celery.result import AsyncResult
from datetime import datetime
from app.database.connection import SessionLocal
from app.repositories.job_repository import JobRepository
from app.database.models import AIJobStatus

router = APIRouter(prefix="/jobs", tags=["jobs"])

@router.get("/{job_id}", response_model=JobResponse)
async def get_job_status(job_id: str):
    """
    Get job status and result by job ID
    Reads from database for persistent storage
    """
    try:
        # Get job from database (primary source)
        db = SessionLocal()
        try:
            job = JobRepository.get_job(db, job_id)
            if not job:
                raise HTTPException(status_code=404, detail="Job not found")
            
            # Map database status to API status
            status_map = {
                AIJobStatus.QUEUED: JobStatus.QUEUED,
                AIJobStatus.RUNNING: JobStatus.RUNNING,
                AIJobStatus.SUCCEEDED: JobStatus.SUCCEEDED,
                AIJobStatus.FAILED: JobStatus.FAILED,
                AIJobStatus.CANCELED: JobStatus.CANCELED,
            }
            
            return JobResponse(
                jobId=job.job_id,
                taskType=job.task_type,
                status=status_map.get(job.status, JobStatus.QUEUED),
                createdAt=job.created_at,
                updatedAt=job.completed_at or job.started_at or job.created_at,
                progress=job.progress,
                meta=job.request_data,
                result=job.result_data,
                error=job.error_message
            )
        finally:
            db.close()
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get job: {str(e)}")

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
