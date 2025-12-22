import time
import json
from app.workers.celery_app import celery_app
from app.deps import get_settings
from kafka import KafkaProducer

settings = get_settings()

def get_kafka_producer():
    """Get Kafka producer for publishing events"""
    return KafkaProducer(
        bootstrap_servers=settings.KAFKA_BOOTSTRAP_SERVERS,
        value_serializer=lambda v: json.dumps(v).encode('utf-8')
    )

def publish_completion_event(job_id: str, task_type: str, status: str, user_id: str = None, syllabus_id: str = None):
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
            "timestamp": time.time()
        }
        producer.send(settings.KAFKA_TOPIC_AI_EVENTS, value=event)
        producer.flush()
        producer.close()
    except Exception as e:
        print(f"Failed to publish event: {e}")

@celery_app.task(bind=True, name='tasks.suggest')
def suggest_task(self, payload: dict, job_id: str):
    """
    AI Suggest task - mock implementation
    """
    try:
        # Update progress
        self.update_state(state='PROGRESS', meta={'progress': 10})
        
        # Simulate processing
        time.sleep(2)
        self.update_state(state='PROGRESS', meta={'progress': 50})
        
        # Mock result
        result = {
            "jobId": job_id,
            "suggestions": [
                {
                    "type": "objective",
                    "text": "Làm rõ mục tiêu học phần, bổ sung chuẩn đầu ra cụ thể",
                    "score": 0.82
                },
                {
                    "type": "summary",
                    "text": "Tóm tắt 3 ý chính: kiến thức nền tảng, kỹ năng thực hành, đánh giá",
                    "score": 0.75
                },
                {
                    "type": "edit",
                    "text": "Nên thêm tài liệu tham khảo mới hơn (2023-2024)",
                    "score": 0.68
                }
            ],
            "tokens": 1250
        }
        
        time.sleep(1)
        self.update_state(state='PROGRESS', meta={'progress': 100})
        
        # Publish completion event to Kafka
        publish_completion_event(
            job_id=job_id,
            task_type="suggest",
            status="succeeded",
            syllabus_id=payload.get("syllabusId")
        )
        
        return result
        
    except Exception as e:
        # Publish failure event
        publish_completion_event(
            job_id=job_id,
            task_type="suggest",
            status="failed",
            syllabus_id=payload.get("syllabusId")
        )
        raise

@celery_app.task(bind=True, name='tasks.chat')
def chat_task(self, payload: dict, job_id: str):
    """AI Chat task - mock implementation"""
    try:
        self.update_state(state='PROGRESS', meta={'progress': 30})
        time.sleep(2)
        
        result = {
            "jobId": job_id,
            "conversationId": payload.get("conversationId", f"conv_{job_id}"),
            "answer": {
                "content": "Đây là câu trả lời mock từ AI assistant. Câu hỏi của bạn liên quan đến giáo trình đã được ghi nhận.",
                "citations": ["Section 2.1", "Chapter 3"]
            },
            "usage": {"promptTokens": 100, "completionTokens": 50}
        }
        
        self.update_state(state='PROGRESS', meta={'progress': 100})
        
        publish_completion_event(
            job_id=job_id,
            task_type="chat",
            status="succeeded",
            syllabus_id=payload.get("syllabusId")
        )
        
        return result
    except Exception as e:
        publish_completion_event(job_id=job_id, task_type="chat", status="failed")
        raise

@celery_app.task(bind=True, name='tasks.diff')
def diff_task(self, payload: dict, job_id: str):
    """AI Diff task - mock implementation"""
    try:
        self.update_state(state='PROGRESS', meta={'progress': 40})
        time.sleep(3)
        
        result = {
            "jobId": job_id,
            "diffs": [
                {
                    "section": "Learning Objectives",
                    "changeType": "modified",
                    "detail": "Thêm 2 CLO mới: CLO5, CLO6",
                    "severity": "high"
                },
                {
                    "section": "References",
                    "changeType": "added",
                    "detail": "Bổ sung 3 tài liệu tham khảo",
                    "severity": "low"
                }
            ],
            "summary": "Phát hiện 2 thay đổi chính: cập nhật chuẩn đầu ra và tài liệu tham khảo"
        }
        
        self.update_state(state='PROGRESS', meta={'progress': 100})
        publish_completion_event(job_id=job_id, task_type="diff", status="succeeded")
        
        return result
    except Exception as e:
        publish_completion_event(job_id=job_id, task_type="diff", status="failed")
        raise

@celery_app.task(bind=True, name='tasks.clo_check')
def clo_check_task(self, payload: dict, job_id: str):
    """CLO-PLO Check task - mock implementation"""
    try:
        self.update_state(state='PROGRESS', meta={'progress': 50})
        time.sleep(2)
        
        result = {
            "jobId": job_id,
            "report": {
                "issues": [
                    {
                        "type": "missing_mapping",
                        "description": "CLO3 chưa được map tới bất kỳ PLO nào",
                        "severity": "critical"
                    },
                    {
                        "type": "weak_alignment",
                        "description": "CLO1 và PLO2 có độ tương đồng thấp",
                        "severity": "warning"
                    }
                ],
                "mappingSuggestions": [
                    {
                        "clo": "CLO3",
                        "suggestedPlo": ["PLO4", "PLO5"],
                        "confidence": 0.85
                    }
                ]
            },
            "score": 7.5
        }
        
        self.update_state(state='PROGRESS', meta={'progress': 100})
        publish_completion_event(job_id=job_id, task_type="clo_check", status="succeeded")
        
        return result
    except Exception as e:
        publish_completion_event(job_id=job_id, task_type="clo_check", status="failed")
        raise

@celery_app.task(bind=True, name='tasks.summary')
def summary_task(self, payload: dict, job_id: str):
    """Summary task - mock implementation"""
    try:
        self.update_state(state='PROGRESS', meta={'progress': 60})
        time.sleep(2)
        
        result = {
            "jobId": job_id,
            "summary": "Giáo trình cung cấp kiến thức nền tảng về lập trình hướng đối tượng, bao gồm các khái niệm cơ bản, kỹ năng thực hành và phương pháp đánh giá.",
            "bullets": [
                "Kiến thức: OOP concepts, Design Patterns, SOLID principles",
                "Kỹ năng: Java/Python programming, UML modeling, Testing",
                "Đánh giá: 40% giữa kỳ, 60% cuối kỳ, project-based"
            ]
        }
        
        self.update_state(state='PROGRESS', meta={'progress': 100})
        publish_completion_event(job_id=job_id, task_type="summary", status="succeeded")
        
        return result
    except Exception as e:
        publish_completion_event(job_id=job_id, task_type="summary", status="failed")
        raise
