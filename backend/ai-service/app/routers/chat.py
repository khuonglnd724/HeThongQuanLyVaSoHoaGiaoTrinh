from fastapi import APIRouter, HTTPException
from app.schemas.chat import ChatRequest
from app.schemas.jobs import JobCreateResponse, JobStatus
from app.workers.celery_app import celery_app
from app.database.connection import SessionLocal
from app.repositories.job_repository import JobRepository
from app.repositories.conversation_repository import ConversationRepository
import uuid

router = APIRouter(tags=["ai-chat"])

@router.post("/chat", response_model=JobCreateResponse, status_code=202)
async def create_chat_task(request: ChatRequest):
    """
    Create a chat task for AI assistant
    Returns 202 with job ID for polling
    
    Store conversation and messages in database
    """
    try:
        job_id = str(uuid.uuid4())
        
        # Extract message from messages list (fix schema compatibility)
        messages = request.messages  # Access Pydantic field directly
        if messages:
            last_message = messages[-1]  # ChatMessage object
            user_message = last_message.content  # Access content attribute
        else:
            user_message = ""
        
        # Build payload dict for worker
        payload = request.dict()
        payload["message"] = user_message
        
        # Store job and conversation in database
        db = SessionLocal()
        try:
            # Create job
            JobRepository.create_job(
                db=db,
                job_id=job_id,
                task_type="chat",
                user_id=None,  # Not in ChatRequest schema
                syllabus_id=request.syllabusId,  # Access directly
                request_data=payload
            )
            
            # Create or get conversation
            conversation_id = request.conversationId
            if conversation_id:
                # Add message to existing conversation
                ConversationRepository.add_message(
                    db=db,
                    conversation_id=conversation_id,
                    role="user",
                    content=user_message
                )
            else:
                # Create new conversation
                conversation_id = str(uuid.uuid4())
                ConversationRepository.create_conversation(
                    db=db,
                    conversation_id=conversation_id,
                    user_id=None,  # Allow NULL
                    syllabus_id=request.syllabusId,
                    title=user_message[:50] if user_message else "Chat"
                )
                ConversationRepository.add_message(
                    db=db,
                    conversation_id=conversation_id,
                    role="user",
                    content=user_message
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
