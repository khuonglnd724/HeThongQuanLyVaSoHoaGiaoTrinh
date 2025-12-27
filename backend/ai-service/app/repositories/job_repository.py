"""Repository for AI Job management"""
from sqlalchemy.orm import Session
from datetime import datetime
from app.database.models import AIJob, AIJobStatus

class JobRepository:
    """Handle all database operations for AI Jobs"""
    
    @staticmethod
    def create_job(
        db: Session,
        job_id: str,
        task_type: str,
        user_id: str = None,
        syllabus_id: str = None,
        request_data: dict = None
    ) -> AIJob:
        """Create a new job record"""
        job = AIJob(
            job_id=job_id,
            task_type=task_type,
            user_id=user_id,
            syllabus_id=syllabus_id,
            request_data=request_data,
            status=AIJobStatus.QUEUED,
            created_at=datetime.utcnow()
        )
        db.add(job)
        db.commit()
        db.refresh(job)
        return job
    
    @staticmethod
    def get_job(db: Session, job_id: str) -> AIJob:
        """Get job by job_id"""
        return db.query(AIJob).filter(AIJob.job_id == job_id).first()
    
    @staticmethod
    def update_job_status(
        db: Session,
        job_id: str,
        status: AIJobStatus,
        progress: int = None,
        result_data: dict = None,
        error_message: str = None
    ) -> AIJob:
        """Update job status and optionally result"""
        job = JobRepository.get_job(db, job_id)
        if job:
            job.status = status
            if progress is not None:
                job.progress = progress
            if result_data is not None:
                job.result_data = result_data
            if error_message is not None:
                job.error_message = error_message
            
            if status == AIJobStatus.RUNNING and not job.started_at:
                job.started_at = datetime.utcnow()
            elif status in [AIJobStatus.SUCCEEDED, AIJobStatus.FAILED, AIJobStatus.CANCELED]:
                job.completed_at = datetime.utcnow()
            
            db.commit()
            db.refresh(job)
        return job
    
    @staticmethod
    def get_user_jobs(db: Session, user_id: str, limit: int = 50, offset: int = 0):
        """Get all jobs for a user"""
        return db.query(AIJob)\
            .filter(AIJob.user_id == user_id)\
            .order_by(AIJob.created_at.desc())\
            .limit(limit)\
            .offset(offset)\
            .all()
    
    @staticmethod
    def get_syllabus_jobs(db: Session, syllabus_id: str, limit: int = 50):
        """Get all jobs for a syllabus"""
        return db.query(AIJob)\
            .filter(AIJob.syllabus_id == syllabus_id)\
            .order_by(AIJob.created_at.desc())\
            .limit(limit)\
            .all()
    
    @staticmethod
    def delete_job(db: Session, job_id: str) -> bool:
        """Delete a job"""
        job = JobRepository.get_job(db, job_id)
        if job:
            db.delete(job)
            db.commit()
            return True
        return False
