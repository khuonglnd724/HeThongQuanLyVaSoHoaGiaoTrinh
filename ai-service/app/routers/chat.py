from fastapi import APIRouter, HTTPException
from app.schemas.chat import ChatRequest
from app.schemas.jobs import JobCreateResponse, JobStatus
from app.workers.celery_app import celery_app
from app.database.connection import SessionLocal
from app.repositories.job_repository import JobRepository
from app.repositories.conversation_repository import ConversationRepository
import uuid

router = APIRouter(prefix="/ai", tags=["ai-chat"])

@router.post("/chat", response_model=JobCreateResponse, status_code=202)
async def create_chat_task(request: ChatRequest):
    """
    Create a chat task for AI assistant
    Returns 202 with job ID for polling
    
    Store conversation and messages in database
    """
    try:
        job_id = str(uuid.uuid4())
        payload = request.dict()
        
        # Store job and conversation in database
        db = SessionLocal()
        try:
            # Create job
            JobRepository.create_job(
                db=db,
                job_id=job_id,
                task_type="chat",
                user_id=payload.get("userId"),
                syllabus_id=payload.get("syllabusId"),
                request_data=payload
            )
            
            # Create or get conversation
            conversation_id = payload.get("conversationId")
            if conversation_id:
                # Add message to existing conversation
                ConversationRepository.add_message(
                    db=db,
                    conversation_id=conversation_id,
                    role="user",
                    content=payload.get("message")
                )
            else:
                # Create new conversation
                conversation_id = str(uuid.uuid4())
                ConversationRepository.create_conversation(
                    db=db,
                    conversation_id=conversation_id,
                    user_id=payload.get("userId"),
                    syllabus_id=payload.get("syllabusId"),
                    title=payload.get("message", "Chat")[:50]
                )
                ConversationRepository.add_message(
                    db=db,
                    conversation_id=conversation_id,
                    role="user",
                    content=payload.get("message")
                )
                # Update payload with conversation_id
                payload["conversationId"] = conversation_id
        finally:
            db.close()
        
        # Send task to Celery
        task = celery_app.send_task(
            'tasks.chat',
            args=[payload, job_id],
            task_id=job_id
        )
        
        return JobCreateResponse(
            jobId=task.id,
            status=JobStatus.QUEUED,
            message="Chat task queued successfully"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create chat task: {str(e)}")
