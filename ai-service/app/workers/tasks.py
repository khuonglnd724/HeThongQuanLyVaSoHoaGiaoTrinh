import time
import json
from app.workers.celery_app import celery_app
from app.deps import get_settings
from kafka import KafkaProducer
from app.database.connection import SessionLocal
from app.database.models import AIJobStatus
from app.repositories.job_repository import JobRepository
from app.repositories.conversation_repository import ConversationRepository
from app.services.ai_client import get_ai_client
from app.services import prompts

settings = get_settings()

def get_kafka_producer():
    """Get Kafka producer for publishing events"""
    return KafkaProducer(
        bootstrap_servers=settings.KAFKA_BOOTSTRAP_SERVERS,
        value_serializer=lambda v: json.dumps(v).encode('utf-8')
    )

def publish_completion_event(job_id: str, task_type: str, status: str, user_id: str = None, syllabus_id: str = None, error: str = None):
    """Publish AI task completion event to Kafka"""
    try:
        producer = get_kafka_producer()
        event = {
            "event": "AI_TASK_COMPLETED",
            "jobId": job_id,
            "taskType": task_type,
            "status": status,
            "userId": user_id,
            "syllabusId": syllabus_id,
            "error": error,
            "timestamp": time.time()
        }
        producer.send(settings.KAFKA_TOPIC_AI_EVENTS, value=event)
        producer.flush()
        producer.close()
    except Exception as e:
        print(f"Failed to publish event: {e}")

def update_job_in_db(job_id: str, status: AIJobStatus, progress: int = None, result: dict = None, error: str = None):
    """Update job status in database"""
    try:
        db = SessionLocal()
        JobRepository.update_job_status(
            db=db,
            job_id=job_id,
            status=status,
            progress=progress,
            result_data=result,
            error_message=error
        )
        db.close()
    except Exception as e:
        print(f"Failed to update job in DB: {e}")

@celery_app.task(bind=True, name='tasks.suggest')
def suggest_task(self, payload: dict, job_id: str):
    """
    AI Suggest task - Real AI implementation with OpenAI
    """
    user_id = payload.get("userId")
    syllabus_id = payload.get("syllabusId")
    syllabus_content = payload.get("content", "")
    focus_area = payload.get("focusArea")
    
    try:
        # Update DB status: RUNNING
        update_job_in_db(job_id, AIJobStatus.RUNNING, progress=10)
        self.update_state(state='PROGRESS', meta={'progress': 10})
        
        # Get AI client
        ai_client = get_ai_client()
        
        # Update progress - preparing AI request
        update_job_in_db(job_id, AIJobStatus.RUNNING, progress=30)
        self.update_state(state='PROGRESS', meta={'progress': 30})
        
        # Build prompt and call AI
        user_prompt = prompts.build_suggest_prompt(syllabus_content, focus_area)
        messages = [
            ai_client.create_system_message(prompts.SUGGEST_SYSTEM_PROMPT),
            ai_client.create_user_message(user_prompt)
        ]
        
        # Call OpenAI API
        update_job_in_db(job_id, AIJobStatus.RUNNING, progress=50)
        self.update_state(state='PROGRESS', meta={'progress': 50})
        
        ai_response = ai_client.chat_completion(
            messages=messages,
            temperature=0.7,
            max_tokens=2000,
            json_mode=True
        )
        
        # Parse AI response
        update_job_in_db(job_id, AIJobStatus.RUNNING, progress=80)
        self.update_state(state='PROGRESS', meta={'progress': 80})
        
        suggestions_data = json.loads(ai_response["content"])
        
        # Build result
        result = {
            "jobId": job_id,
            "suggestions": suggestions_data.get("suggestions", []),
            "summary": suggestions_data.get("summary", ""),
            "tokens": ai_response["usage"]["total_tokens"],
            "model": ai_response["model"]
        }
        
        # Update DB status: SUCCEEDED with result
        update_job_in_db(job_id, AIJobStatus.SUCCEEDED, progress=100, result=result)
        self.update_state(state='PROGRESS', meta={'progress': 100})
        
        # Publish completion event to Kafka (triggers WebSocket notification)
        publish_completion_event(
            job_id=job_id,
            task_type="suggest",
            status="succeeded",
            user_id=user_id,
            syllabus_id=syllabus_id
        )
        
        return result
        
    except Exception as e:
        error_msg = str(e)
        
        # Update DB status: FAILED
        update_job_in_db(job_id, AIJobStatus.FAILED, error=error_msg)
        
        # Publish failure event
        publish_completion_event(
            job_id=job_id,
            task_type="suggest",
            status="failed",
            user_id=user_id,
            syllabus_id=syllabus_id,
            error=error_msg
        )
        raise

@celery_app.task(bind=True, name='tasks.chat')
def chat_task(self, payload: dict, job_id: str):
    """AI Chat task - Real AI implementation with OpenAI"""
    user_id = payload.get("userId")
    syllabus_id = payload.get("syllabusId")
    conversation_id = payload.get("conversationId", f"conv_{job_id}")
    message = payload.get("message", "")
    syllabus_context = payload.get("syllabusContext", "")
    
    try:
        # Update DB status: RUNNING
        update_job_in_db(job_id, AIJobStatus.RUNNING, progress=20)
        self.update_state(state='PROGRESS', meta={'progress': 20})
        
        # Get AI client
        ai_client = get_ai_client()
        
        # Get chat history from DB
        db = SessionLocal()
        try:
            messages_history = ConversationRepository.get_messages(db, conversation_id)
            chat_history = [
                {"role": msg.role, "content": msg.content}
                for msg in messages_history[-5:]  # Last 5 messages
            ]
        finally:
            db.close()
        
        # Build messages for AI
        update_job_in_db(job_id, AIJobStatus.RUNNING, progress=40)
        self.update_state(state='PROGRESS', meta={'progress': 40})
        
        messages = prompts.build_chat_prompt(message, syllabus_context, chat_history)
        
        # Call OpenAI API
        update_job_in_db(job_id, AIJobStatus.RUNNING, progress=60)
        self.update_state(state='PROGRESS', meta={'progress': 60})
        
        ai_response = ai_client.chat_completion(
            messages=messages,
            temperature=0.7,
            max_tokens=1500
        )
        
        answer_content = ai_response["content"]
        
        # Extract citations (if any) - simple implementation
        citations = []
        if "Section" in answer_content or "Chapter" in answer_content:
            # Simple citation extraction
            import re
            sections = re.findall(r'Section \d+\.?\d*', answer_content)
            chapters = re.findall(r'Chapter \d+', answer_content)
            citations = list(set(sections + chapters))
        
        # Build result
        result = {
            "jobId": job_id,
            "conversationId": conversation_id,
            "answer": {
                "content": answer_content,
                "citations": citations
            },
            "usage": {
                "promptTokens": ai_response["usage"]["prompt_tokens"],
                "completionTokens": ai_response["usage"]["completion_tokens"],
                "totalTokens": ai_response["usage"]["total_tokens"]
            },
            "model": ai_response["model"]
        }
        
        # Update progress
        update_job_in_db(job_id, AIJobStatus.RUNNING, progress=90)
        self.update_state(state='PROGRESS', meta={'progress': 90})
        
        # Save AI response to DB
        db = SessionLocal()
        try:
            ConversationRepository.add_message(
                db=db,
                conversation_id=conversation_id,
                role="assistant",
                content=answer_content
            )
        finally:
            db.close()
        
        # Update DB status: SUCCEEDED
        update_job_in_db(job_id, AIJobStatus.SUCCEEDED, progress=100, result=result)
        self.update_state(state='PROGRESS', meta={'progress': 100})
        
        # Publish completion event
        publish_completion_event(
            job_id=job_id,
            task_type="chat",
            status="succeeded",
            user_id=user_id,
            syllabus_id=syllabus_id
        )
        
        return result
    except Exception as e:
        error_msg = str(e)
        
        # Update DB status: FAILED
        update_job_in_db(job_id, AIJobStatus.FAILED, error=error_msg)
        
        # Publish failure event
        publish_completion_event(
            job_id=job_id,
            task_type="chat",
            status="failed",
            user_id=user_id,
            syllabus_id=syllabus_id,
            error=error_msg
        )
        raise

@celery_app.task(bind=True, name='tasks.diff')
def diff_task(self, payload: dict, job_id: str):
    """AI Diff task - Real AI implementation with OpenAI"""
    user_id = payload.get("userId")
    syllabus_id = payload.get("syllabusId")
    old_content = payload.get("oldContent", "")
    new_content = payload.get("newContent", "")
    
    try:
        # Update DB status: RUNNING
        update_job_in_db(job_id, AIJobStatus.RUNNING, progress=20)
        self.update_state(state='PROGRESS', meta={'progress': 20})
        
        # Get AI client
        ai_client = get_ai_client()
        
        # Build prompt and call AI
        update_job_in_db(job_id, AIJobStatus.RUNNING, progress=40)
        self.update_state(state='PROGRESS', meta={'progress': 40})
        
        user_prompt = prompts.build_diff_prompt(old_content, new_content)
        messages = [
            ai_client.create_system_message(prompts.DIFF_SYSTEM_PROMPT),
            ai_client.create_user_message(user_prompt)
        ]
        
        # Call OpenAI API
        update_job_in_db(job_id, AIJobStatus.RUNNING, progress=60)
        self.update_state(state='PROGRESS', meta={'progress': 60})
        
        ai_response = ai_client.chat_completion(
            messages=messages,
            temperature=0.5,
            max_tokens=2500,
            json_mode=True
        )
        
        # Parse AI response
        update_job_in_db(job_id, AIJobStatus.RUNNING, progress=85)
        self.update_state(state='PROGRESS', meta={'progress': 85})
        
        diff_data = json.loads(ai_response["content"])
        
        # Build result
        result = {
            "jobId": job_id,
            "diffs": diff_data.get("diffs", []),
            "summary": diff_data.get("summary", ""),
            "impactLevel": diff_data.get("impactLevel", "medium"),
            "tokens": ai_response["usage"]["total_tokens"],
            "model": ai_response["model"]
        }
        
        # Update DB status: SUCCEEDED
        update_job_in_db(job_id, AIJobStatus.SUCCEEDED, progress=100, result=result)
        self.update_state(state='PROGRESS', meta={'progress': 100})
        
        # Publish completion event
        publish_completion_event(
            job_id=job_id,
            task_type="diff",
            status="succeeded",
            user_id=user_id,
            syllabus_id=syllabus_id
        )
        
        return result
    except Exception as e:
        error_msg = str(e)
        
        # Update DB status: FAILED
        update_job_in_db(job_id, AIJobStatus.FAILED, error=error_msg)
        
        # Publish failure event
        publish_completion_event(
            job_id=job_id,
            task_type="diff",
            status="failed",
            user_id=user_id,
            syllabus_id=syllabus_id,
            error=error_msg
        )
        raise

@celery_app.task(bind=True, name='tasks.clo_check')
def clo_check_task(self, payload: dict, job_id: str):
    """CLO-PLO Check task - Real AI implementation with OpenAI"""
    user_id = payload.get("userId")
    syllabus_id = payload.get("syllabusId")
    clos = payload.get("clos", [])
    plos = payload.get("plos", [])
    mapping = payload.get("mapping", {})
    
    try:
        # Update DB status: RUNNING
        update_job_in_db(job_id, AIJobStatus.RUNNING, progress=25)
        self.update_state(state='PROGRESS', meta={'progress': 25})
        
        # Get AI client
        ai_client = get_ai_client()
        
        # Build prompt and call AI
        update_job_in_db(job_id, AIJobStatus.RUNNING, progress=45)
        self.update_state(state='PROGRESS', meta={'progress': 45})
        
        user_prompt = prompts.build_clo_check_prompt(clos, plos, mapping)
        messages = [
            ai_client.create_system_message(prompts.CLO_CHECK_SYSTEM_PROMPT),
            ai_client.create_user_message(user_prompt)
        ]
        
        # Call OpenAI API
        update_job_in_db(job_id, AIJobStatus.RUNNING, progress=65)
        self.update_state(state='PROGRESS', meta={'progress': 65})
        
        ai_response = ai_client.chat_completion(
            messages=messages,
            temperature=0.4,
            max_tokens=2500,
            json_mode=True
        )
        
        # Parse AI response
        update_job_in_db(job_id, AIJobStatus.RUNNING, progress=85)
        self.update_state(state='PROGRESS', meta={'progress': 85})
        
        check_data = json.loads(ai_response["content"])
        
        # Build result
        result = {
            "jobId": job_id,
            "report": check_data.get("report", {}),
            "score": check_data.get("score", 0.0),
            "summary": check_data.get("summary", ""),
            "tokens": ai_response["usage"]["total_tokens"],
            "model": ai_response["model"]
        }
        
        # Update DB status: SUCCEEDED
        update_job_in_db(job_id, AIJobStatus.SUCCEEDED, progress=100, result=result)
        self.update_state(state='PROGRESS', meta={'progress': 100})
        
        # Publish completion event
        publish_completion_event(
            job_id=job_id,
            task_type="clo_check",
            status="succeeded",
            user_id=user_id,
            syllabus_id=syllabus_id
        )
        
        return result
    except Exception as e:
        error_msg = str(e)
        
        # Update DB status: FAILED
        update_job_in_db(job_id, AIJobStatus.FAILED, error=error_msg)
        
        # Publish failure event
        publish_completion_event(
            job_id=job_id,
            task_type="clo_check",
            status="failed",
            user_id=user_id,
            syllabus_id=syllabus_id,
            error=error_msg
        )
        raise

@celery_app.task(bind=True, name='tasks.summary')
def summary_task(self, payload: dict, job_id: str):
    """Summary task - Real AI implementation with OpenAI"""
    user_id = payload.get("userId")
    syllabus_id = payload.get("syllabusId")
    syllabus_content = payload.get("content", "")
    length = payload.get("length", "medium")  # short|medium|long
    
    try:
        # Update DB status: RUNNING
        update_job_in_db(job_id, AIJobStatus.RUNNING, progress=30)
        self.update_state(state='PROGRESS', meta={'progress': 30})
        
        # Get AI client
        ai_client = get_ai_client()
        
        # Build prompt and call AI
        update_job_in_db(job_id, AIJobStatus.RUNNING, progress=50)
        self.update_state(state='PROGRESS', meta={'progress': 50})
        
        user_prompt = prompts.build_summary_prompt(syllabus_content, length)
        messages = [
            ai_client.create_system_message(prompts.SUMMARY_SYSTEM_PROMPT),
            ai_client.create_user_message(user_prompt)
        ]
        
        # Call OpenAI API
        update_job_in_db(job_id, AIJobStatus.RUNNING, progress=70)
        self.update_state(state='PROGRESS', meta={'progress': 70})
        
        ai_response = ai_client.chat_completion(
            messages=messages,
            temperature=0.6,
            max_tokens=1500,
            json_mode=True
        )
        
        # Parse AI response
        update_job_in_db(job_id, AIJobStatus.RUNNING, progress=90)
        self.update_state(state='PROGRESS', meta={'progress': 90})
        
        summary_data = json.loads(ai_response["content"])
        
        # Build result
        result = {
            "jobId": job_id,
            "summary": summary_data.get("summary", ""),
            "bullets": summary_data.get("bullets", []),
            "keywords": summary_data.get("keywords", []),
            "targetAudience": summary_data.get("targetAudience", ""),
            "prerequisites": summary_data.get("prerequisites", ""),
            "tokens": ai_response["usage"]["total_tokens"],
            "model": ai_response["model"]
        }
        
        # Update DB status: SUCCEEDED
        update_job_in_db(job_id, AIJobStatus.SUCCEEDED, progress=100, result=result)
        self.update_state(state='PROGRESS', meta={'progress': 100})
        
        # Publish completion event
        publish_completion_event(
            job_id=job_id,
            task_type="summary",
            status="succeeded",
            user_id=user_id,
            syllabus_id=syllabus_id
        )
        
        return result
    except Exception as e:
        error_msg = str(e)
        
        # Update DB status: FAILED
        update_job_in_db(job_id, AIJobStatus.FAILED, error=error_msg)
        
        # Publish failure event
        publish_completion_event(
            job_id=job_id,
            task_type="summary",
            status="failed",
            user_id=user_id,
            syllabus_id=syllabus_id,
            error=error_msg
        )
        raise


@celery_app.task(name="app.workers.tasks.process_suggest_similar_clo")
def process_suggest_similar_clo(job_id: str, payload: dict):
    """
    Process suggest similar CLOs task
    Find CLOs with similar content from database
    """
    from app.services.clo_matcher import CLOMatcher
    
    current_clo = payload.get("currentCLO")
    subject_area = payload.get("subjectArea")
    level = payload.get("level")
    limit = payload.get("limit", 5)
    
    try:
        # Update DB status: RUNNING
        update_job_in_db(job_id, AIJobStatus.RUNNING, progress=20)
        
        # Initialize CLO matcher
        matcher = CLOMatcher()
        
        # Find similar CLOs
        update_job_in_db(job_id, AIJobStatus.RUNNING, progress=50)
        similar_clos = matcher.find_similar_clos(
            current_clo=current_clo,
            subject_area=subject_area,
            level=level,
            limit=limit
        )
        
        # Prepare result
        result = {
            "similarCLOs": similar_clos,
            "searchedCLO": current_clo,
            "totalFound": len(similar_clos)
        }
        
        # Update DB status: SUCCEEDED
        update_job_in_db(job_id, AIJobStatus.SUCCEEDED, progress=100, result=result)
        
        # Publish completion event
        publish_completion_event(
            job_id=job_id,
            task_type="suggest_clo",
            status="succeeded",
            user_id=None,
            syllabus_id=None
        )
        
        return result
    except Exception as e:
        error_msg = str(e)
        
        # Update DB status: FAILED
        update_job_in_db(job_id, AIJobStatus.FAILED, error=error_msg)
        
        # Publish failure event
        publish_completion_event(
            job_id=job_id,
            task_type="suggest_clo",
            status="failed",
            user_id=None,
            syllabus_id=None,
            error=error_msg
        )
        raise
