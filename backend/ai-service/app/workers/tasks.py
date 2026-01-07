import time
import json
import logging
from app.workers.celery_app import celery_app
from app.deps import get_settings
from kafka import KafkaProducer
from app.database.connection import SessionLocal
from app.database.models import AIJobStatus
from app.repositories.job_repository import JobRepository
from app.repositories.conversation_repository import ConversationRepository
from app.services.ai_client import get_ai_client
from app.services.rag_service import VectorStore
from app.services import prompts

settings = get_settings()
logger = logging.getLogger(__name__)

# Kafka producer singleton (reuse connection)
_kafka_producer = None

def get_kafka_producer():
    """Get or create Kafka producer singleton to avoid connection overhead"""
    global _kafka_producer
    if _kafka_producer is None:
        _kafka_producer = KafkaProducer(
            bootstrap_servers=settings.KAFKA_BOOTSTRAP_SERVERS,
            value_serializer=lambda v: json.dumps(v).encode('utf-8'),
            retries=3,
            request_timeout_ms=10000,
            acks='all'
        )
        logger.info("Kafka producer initialized")
    return _kafka_producer

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
        # Send and flush but do NOT close - producer is singleton
        producer.send(settings.KAFKA_TOPIC_AI_EVENTS, value=event)
        producer.flush()
        logger.debug(f"Published event for job {job_id}")
    except Exception as e:
        logger.error(f"Failed to publish event: {e}")

def update_job_in_db(job_id: str, status: AIJobStatus, progress: int = None, result: dict = None, error: str = None):
    """Update job status in database with proper session management and transaction control"""
    db = SessionLocal()
    try:
        JobRepository.update_job_status(
            db=db,
            job_id=job_id,
            status=status,
            progress=progress,
            result_data=result,
            error_message=error
        )
        db.commit()  # Explicitly commit transaction
        logger.info(f"Job {job_id} updated to {status.value}")
    except Exception as e:
        db.rollback()  # Rollback on error to maintain consistency
        logger.error(f"Failed to update job in DB: {e}")
        raise
    finally:
        db.close()  # Always close connection

@celery_app.task(bind=True, name='tasks.suggest')
def suggest_task(self, payload: dict, job_id: str):
    """
    AI Suggest task - Real AI implementation with OpenAI
    Retrieves RAG context from uploaded syllabus to generate specific suggestions
    """
    user_id = payload.get("userId")
    syllabus_id = payload.get("syllabusId")
    syllabus_content = payload.get("content", "")
    focus_area = payload.get("focusArea")
    rag_context = ""
    rag_used = False
    
    try:
        # Update DB status: RUNNING
        update_job_in_db(job_id, AIJobStatus.RUNNING, progress=10)
        self.update_state(state='PROGRESS', meta={'progress': 10})
        
        # Get AI client
        ai_client = get_ai_client()
        
        # Retrieve RAG context from uploaded syllabus documents (progress 20-25)
        if syllabus_id:
            update_job_in_db(job_id, AIJobStatus.RUNNING, progress=20)
            self.update_state(state='PROGRESS', meta={'progress': 20})
            
            try:
                vector_store = VectorStore()
                collection_name = f"syllabus_{syllabus_id}".lower()
                
                # Search for context about course structure, objectives, assessment
                search_queries = [
                    "mục tiêu học phần chuẩn đầu ra learning outcomes objectives",
                    "nội dung học phần chủ đề topics content",
                    "phương pháp giảng dạy teaching methods",
                    "đánh giá assessment evaluation"
                ]
                
                rag_contexts = []
                for query in search_queries:
                    try:
                        results = vector_store.search(
                            collection_name=collection_name,
                            query=query,
                            top_k=2
                        )
                        for r in results:
                            rag_contexts.append(r.get('content', ''))
                    except:
                        pass
                
                if rag_contexts:
                    rag_context = "\n\n".join(rag_contexts[:6])  # Top 6 chunks
                    rag_used = True
                    logger.info(f"RAG context retrieved: {len(rag_contexts)} chunks for syllabus {syllabus_id}")
            except Exception as e:
                logger.warning(f"RAG retrieval failed for syllabus {syllabus_id}: {e}")
                rag_used = False
        
        # Update progress - preparing AI request
        update_job_in_db(job_id, AIJobStatus.RUNNING, progress=35)
        self.update_state(state='PROGRESS', meta={'progress': 35})
        
        # Build prompt with RAG context + content
        enriched_content = syllabus_content
        if rag_context:
            enriched_content = f"{syllabus_content}\n\n--- THÔNG TIN LIÊN QUAN TỪ TÀI LIỆU ĐÃ UPLOAD ---\n{rag_context}"
        
        user_prompt = prompts.build_suggest_prompt(enriched_content, focus_area)
        messages = [
            ai_client.create_system_message(prompts.SUGGEST_SYSTEM_PROMPT),
            ai_client.create_user_message(user_prompt)
        ]
        
        # Call Groq API
        update_job_in_db(job_id, AIJobStatus.RUNNING, progress=50)
        self.update_state(state='PROGRESS', meta={'progress': 50})
        
        ai_response = ai_client.chat_completion(
            messages=messages,
            temperature=0.7,
            max_tokens=2000,
            json_mode=True
        )
        
        # Parse AI response
        update_job_in_db(job_id, AIJobStatus.RUNNING, progress=70)
        self.update_state(state='PROGRESS', meta={'progress': 70})
        
        try:
            suggestions_data = json.loads(ai_response["content"])
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse AI response as JSON: {e}")
            raise ValueError(f"AI returned invalid JSON: {ai_response['content'][:100]}")
        
        suggestions = suggestions_data.get("suggestions", [])
        
        # Filter duplicate CLOs using RAG if syllabus_id provided
        filtered_suggestions = suggestions
        if syllabus_id:
            try:
                vector_store = VectorStore()
                collection_name = f"syllabus_{syllabus_id}".lower()
                
                filtered_suggestions = []
                for suggestion in suggestions:
                    clo_text = suggestion.get("text", "")  # AI returns 'text' not 'clo'
                    if not clo_text:
                        filtered_suggestions.append(suggestion)
                        continue
                    
                    # Search for similar CLOs in existing syllabus
                    try:
                        similar = vector_store.search(
                            collection_name=collection_name,
                            query=clo_text,
                            top_k=1
                        )
                        
                        # If similarity score > 0.8, it's a duplicate - skip it
                        if similar and similar[0].get('distance', 0) > 0.8:
                            logger.info(f"Skipping duplicate CLO: {clo_text[:50]}")
                            continue
                    except:
                        pass  # If search fails, include the suggestion anyway
                    
                    filtered_suggestions.append(suggestion)
                
                logger.info(f"Filtered {len(suggestions) - len(filtered_suggestions)} duplicate CLOs")
            except Exception as e:
                logger.warning(f"RAG duplicate check failed: {e}, using all suggestions")
                filtered_suggestions = suggestions
        
        # Build result with safe access + RAG info
        usage_data = ai_response.get("usage", {})
        
        # Create summary that reflects RAG usage
        raw_summary = suggestions_data.get("summary", "")
        if rag_used:
            enhanced_summary = f"[Phân tích dựa trên tài liệu đã upload] {raw_summary}"
        else:
            enhanced_summary = raw_summary
        
        result = {
            "jobId": job_id,
            "suggestions": filtered_suggestions,
            "summary": enhanced_summary,
            "ragUsed": rag_used,
            "ragContext": "Có" if rag_used else "Không",
            "duplicateCheckEnabled": bool(syllabus_id),
            "tokens": usage_data.get("total_tokens", 0),
            "model": ai_response.get("model", "unknown")
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
        logger.error(f"Suggest task failed: {error_msg}")
        
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
    """AI Chat task - Real AI implementation with RAG context from syllabus"""
    user_id = payload.get("userId")
    syllabus_id = payload.get("syllabusId")
    conversation_id = payload.get("conversationId", f"conv_{job_id}")
    message = payload.get("message", "")
    
    try:
        # Update DB status: RUNNING
        update_job_in_db(job_id, AIJobStatus.RUNNING, progress=10)
        self.update_state(state='PROGRESS', meta={'progress': 10})
        
        # Get AI client
        ai_client = get_ai_client()
        
        # Search RAG for syllabus context
        rag_context = ""
        if syllabus_id:
            try:
                vector_store = VectorStore()
                collection_name = f"syllabus_{syllabus_id}".lower()
                search_results = vector_store.search(
                    collection_name=collection_name,
                    query=message,
                    top_k=3
                )
                
                if search_results:
                    rag_context = "\n".join([
                        f"[{r['metadata'].get('subject', 'Content')}] {r['content']}"
                        for r in search_results
                    ])
                    logger.info(f"Found RAG context for {syllabus_id}")
            except Exception as e:
                logger.warning(f"RAG search failed for {syllabus_id}: {e}")
                rag_context = ""
        
        # Ensure conversation exists and save user message
        update_job_in_db(job_id, AIJobStatus.RUNNING, progress=30)
        self.update_state(state='PROGRESS', meta={'progress': 30})

        db = SessionLocal()
        try:
            conv = ConversationRepository.get_conversation(db, conversation_id)
            if not conv:
                # Generate title from message if not provided
                title = payload.get("title") or f"{message[:50]}..."
                ConversationRepository.create_conversation(
                    db=db,
                    conversation_id=conversation_id,
                    user_id=user_id,
                    syllabus_id=syllabus_id,
                    title=title
                )
            # Store incoming user message for history
            ConversationRepository.add_message(
                db=db,
                conversation_id=conversation_id,
                role="user",
                content=message
            )

            messages_history = ConversationRepository.get_conversation_messages(db, conversation_id)
            # Take last 4 previous messages (last 5 excluding current message)
            chat_history = [
                {"role": msg.role, "content": msg.content}
                for msg in messages_history[:-1][-4:]  # Exclude last (current) message, take last 4
            ]
        finally:
            db.close()
        
        # Build messages for AI with RAG context
        update_job_in_db(job_id, AIJobStatus.RUNNING, progress=50)
        self.update_state(state='PROGRESS', meta={'progress': 50})
        
        messages = prompts.build_chat_prompt(
            message, 
            rag_context or payload.get("syllabusContext", ""),
            chat_history
        )
        
        # Call Groq API with RAG context
        update_job_in_db(job_id, AIJobStatus.RUNNING, progress=70)
        self.update_state(state='PROGRESS', meta={'progress': 70})
        
        ai_response = ai_client.chat_completion(
            messages=messages,
            temperature=0.7,
            max_tokens=1500
        )
        
        answer_content = ai_response["content"]
        
        # Extract citations (if any)
        citations = []
        if "Section" in answer_content or "Chapter" in answer_content:
            import re
            sections = re.findall(r'Section \d+\.?\d*', answer_content)
            chapters = re.findall(r'Chapter \d+', answer_content)
            citations = list(set(sections + chapters))
        
        # Build result with safe access to usage data
        usage_data = ai_response.get("usage", {})
        result = {
            "jobId": job_id,
            "conversationId": conversation_id,
            "answer": {
                "content": answer_content,
                "citations": citations,
                "ragUsed": bool(rag_context)
            },
            "usage": {
                "promptTokens": usage_data.get("prompt_tokens", 0),
                "completionTokens": usage_data.get("completion_tokens", 0),
                "totalTokens": usage_data.get("total_tokens", 0)
            },
            "model": ai_response.get("model", "unknown")
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
        logger.error(f"Chat task failed: {error_msg}")
        
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
    """AI Diff task - Analyzes differences with RAG context from syllabus"""
    user_id = payload.get("userId")
    syllabus_id = payload.get("syllabusId")
    old_content = payload.get("oldContent", "")
    new_content = payload.get("newContent", "")
    
    try:
        # Update DB status: RUNNING
        update_job_in_db(job_id, AIJobStatus.RUNNING, progress=10)
        self.update_state(state='PROGRESS', meta={'progress': 10})
        
        # Get AI client
        ai_client = get_ai_client()
        
        # Search RAG for context on what's being changed
        rag_context = ""
        if syllabus_id:
            try:
                vector_store = VectorStore()
                collection_name = f"syllabus_{syllabus_id}".lower()
                
                # Search for context about changes
                changes_text = f"{old_content[:200]} {new_content[:200]}"
                search_results = vector_store.search(
                    collection_name=collection_name,
                    query=changes_text,
                    top_k=2
                )
                
                if search_results:
                    rag_context = "Previous context:\n" + "\n".join([
                        f"- {r['content'][:100]}"
                        for r in search_results
                    ])
                    logger.info(f"Found RAG context for diff in syllabus {syllabus_id}")
            except Exception as e:
                logger.warning(f"RAG search for diff context failed: {e}")
                rag_context = ""
        
        # Build prompt and call AI
        update_job_in_db(job_id, AIJobStatus.RUNNING, progress=40)
        self.update_state(state='PROGRESS', meta={'progress': 40})
        
        user_prompt = prompts.build_diff_prompt(old_content, new_content)
        
        # Add RAG context if available
        if rag_context:
            user_prompt = f"{rag_context}\n\n{user_prompt}"
        
        messages = [
            ai_client.create_system_message(prompts.DIFF_SYSTEM_PROMPT),
            ai_client.create_user_message(user_prompt)
        ]
        
        # Call Groq API
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
        
        try:
            diff_data = json.loads(ai_response["content"])
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse diff response as JSON: {e}")
            raise ValueError(f"AI returned invalid JSON for diff: {ai_response['content'][:100]}")
        
        # Build result with safe access
        usage_data = ai_response.get("usage", {})
        result = {
            "jobId": job_id,
            "diffs": diff_data.get("diffs", []),
            "summary": diff_data.get("summary", ""),
            "impactLevel": diff_data.get("impactLevel", "medium"),
            "ragContextUsed": bool(rag_context),
            "tokens": usage_data.get("total_tokens", 0),
            "model": ai_response.get("model", "unknown")
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
        
        try:
            check_data = json.loads(ai_response["content"])
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse CLO check response as JSON: {e}")
            raise ValueError(f"AI returned invalid JSON for CLO check: {ai_response['content'][:100]}")
        
        # Build result with safe access
        usage_data = ai_response.get("usage", {})
        result = {
            "jobId": job_id,
            "report": check_data.get("report", {}),
            "score": check_data.get("score", 0.0),
            "summary": check_data.get("summary", ""),
            "tokens": usage_data.get("total_tokens", 0),
            "model": ai_response.get("model", "unknown")
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
    """Summary task - Real AI implementation with RAG context retrieval"""
    user_id = payload.get("userId")
    syllabus_id = payload.get("syllabusId")
    syllabus_content = payload.get("content", "")
    length = payload.get("length", "medium")  # short|medium|long
    rag_context = ""
    rag_used = False
    
    try:
        # Update DB status: RUNNING
        update_job_in_db(job_id, AIJobStatus.RUNNING, progress=10)
        self.update_state(state='PROGRESS', meta={'progress': 10})
        
        # Get AI client
        ai_client = get_ai_client()
        
        # Retrieve RAG context from uploaded syllabus documents (progress 20-25)
        if syllabus_id:
            update_job_in_db(job_id, AIJobStatus.RUNNING, progress=20)
            self.update_state(state='PROGRESS', meta={'progress': 20})
            
            try:
                vector_store = VectorStore()
                collection_name = f"syllabus_{syllabus_id}".lower()
                
                # Search for context about course structure, objectives, assessment
                search_queries = [
                    "mục tiêu học phần chuẩn đầu ra learning outcomes objectives",
                    "nội dung học phần chủ đề topics content",
                    "phương pháp giảng dạy teaching methods",
                    "đánh giá assessment evaluation"
                ]
                
                rag_contexts = []
                for query in search_queries:
                    try:
                        results = vector_store.search(
                            collection_name=collection_name,
                            query=query,
                            top_k=2
                        )
                        for r in results:
                            rag_contexts.append(r.get('content', ''))
                    except:
                        pass
                
                if rag_contexts:
                    rag_context = "\n\n".join(rag_contexts[:6])  # Top 6 chunks
                    rag_used = True
                    logger.info(f"RAG context retrieved: {len(rag_contexts)} chunks for syllabus {syllabus_id}")
            except Exception as e:
                logger.warning(f"RAG retrieval failed for syllabus {syllabus_id}: {e}")
                rag_used = False
        
        # Update progress - preparing AI request
        update_job_in_db(job_id, AIJobStatus.RUNNING, progress=35)
        self.update_state(state='PROGRESS', meta={'progress': 35})
        
        # Build prompt with RAG context + content
        enriched_content = syllabus_content
        if rag_context:
            enriched_content = f"{syllabus_content}\n\n--- THÔNG TIN LIÊN QUAN TỪ TÀI LIỆU ĐÃ UPLOAD ---\n{rag_context}"
        
        user_prompt = prompts.build_summary_prompt(enriched_content, length)
        messages = [
            ai_client.create_system_message(prompts.SUMMARY_SYSTEM_PROMPT),
            ai_client.create_user_message(user_prompt)
        ]
        
        # Call Groq API
        update_job_in_db(job_id, AIJobStatus.RUNNING, progress=50)
        self.update_state(state='PROGRESS', meta={'progress': 50})
        
        ai_response = ai_client.chat_completion(
            messages=messages,
            temperature=0.6,
            max_tokens=1500,
            json_mode=True
        )
        
        # Parse AI response
        update_job_in_db(job_id, AIJobStatus.RUNNING, progress=70)
        self.update_state(state='PROGRESS', meta={'progress': 70})
        
        try:
            summary_data = json.loads(ai_response["content"])
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse summary response as JSON: {e}")
            raise ValueError(f"AI returned invalid JSON for summary: {ai_response['content'][:100]}")
        
        # Build result with safe access + RAG info
        usage_data = ai_response.get("usage", {})
        
        # Create summary that reflects RAG usage
        raw_summary = summary_data.get("summary", "")
        if rag_used:
            enhanced_summary = f"[Phân tích dựa trên tài liệu đã upload] {raw_summary}"
        else:
            enhanced_summary = raw_summary
        
        result = {
            "jobId": job_id,
            "summary": enhanced_summary,
            "bullets": summary_data.get("bullets", []),
            "keywords": summary_data.get("keywords", []),
            "targetAudience": summary_data.get("targetAudience", ""),
            "prerequisites": summary_data.get("prerequisites", ""),
            "ragUsed": rag_used,
            "ragContext": rag_context[:500] if rag_context else "",  # Include sample of RAG context
            "tokens": usage_data.get("total_tokens", 0),
            "model": ai_response.get("model", "unknown")
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
