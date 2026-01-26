from fastapi import APIRouter, HTTPException
from app.schemas.clo_check import CLOCheckRequest
from app.schemas.jobs import JobCreateResponse, JobStatus
from app.workers.celery_app import celery_app
from app.database.connection import SessionLocal
from app.repositories.job_repository import JobRepository
import uuid

router = APIRouter(tags=["ai-clo-check"])

@router.post("/clo-check", response_model=JobCreateResponse, status_code=202)
async def create_clo_check_task(request: CLOCheckRequest):
    """
    Create a CLO-PLO consistency check task
    Returns 202 with job ID for polling
    
    Store task in database for tracking
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
                task_type="clo_check",
                user_id=payload.get("userId"),
                syllabus_id=payload.get("syllabusId"),
                request_data=payload
            )
        finally:
            db.close()
        
        task = celery_app.send_task(
            'tasks.clo_check',
            args=[payload, job_id],
            task_id=job_id
        )
        
        return JobCreateResponse(
            jobId=task.id,
            status=JobStatus.QUEUED,
            message="CLO check task queued successfully"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create CLO check task: {str(e)}")


@router.post("/clo-check/test-prompt", response_model=JobCreateResponse, status_code=202)
async def test_clo_check_prompt(request: CLOCheckRequest):
    """
    Test/Export CLO-PLO check prompt WITHOUT calling AI
    
    Useful for:
    - Debugging prompt structure
    - Validating input data format
    - Inspecting what gets sent to AI
    - Prompt optimization
    
    Returns 202 with job ID. Result will contain the full prompt text.
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
                task_type="test_clo_prompt",
                user_id=payload.get("userId"),
                syllabus_id=payload.get("syllabusId"),
                request_data=payload
            )
        finally:
            db.close()
        
        # Send test_clo_prompt task (no AI call)
        task = celery_app.send_task(
            'tasks.test_clo_prompt',
            args=[payload, job_id],
            task_id=job_id
        )
        
        return JobCreateResponse(
            jobId=task.id,
            status=JobStatus.QUEUED,
            message="Prompt test task queued - will return prompt text without AI analysis"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create prompt test task: {str(e)}")
