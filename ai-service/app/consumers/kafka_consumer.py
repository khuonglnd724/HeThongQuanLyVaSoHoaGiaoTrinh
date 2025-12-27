"""Kafka consumer for AI event notifications"""
import json
import logging
from kafka import KafkaConsumer
from kafka.errors import KafkaError
from app.deps import get_settings
from app.utils.connection_manager import manager
from app.database.connection import SessionLocal
from app.repositories.notification_repository import NotificationRepository

logger = logging.getLogger(__name__)

class KafkaEventConsumer:
    """Consume AI_TASK_COMPLETED events and push to WebSocket clients"""
    
    def __init__(self):
        self.settings = get_settings()
        self.consumer = None
        self.running = False
    
    def start(self):
        """Start consuming events"""
        try:
            self.consumer = KafkaConsumer(
                self.settings.KAFKA_TOPIC_AI_EVENTS,
                bootstrap_servers=self.settings.KAFKA_BOOTSTRAP_SERVERS,
                value_deserializer=lambda m: json.loads(m.decode('utf-8')),
                group_id='ai-service-notifications',
                auto_offset_reset='earliest',
                enable_auto_commit=True
            )
            
            self.running = True
            logger.info(f"Kafka consumer started. Listening to {self.settings.KAFKA_TOPIC_AI_EVENTS}")
            
            # Start consuming in loop
            self._consume_events()
        
        except KafkaError as e:
            logger.error(f"Kafka error: {e}")
            self.running = False
    
    def _consume_events(self):
        """Consume and process events"""
        try:
            for message in self.consumer:
                if not self.running:
                    break
                
                try:
                    event = message.value
                    self._process_event(event)
                except Exception as e:
                    logger.error(f"Error processing event: {e}")
        
        except Exception as e:
            logger.error(f"Consumer error: {e}")
            self.running = False
    
    def _process_event(self, event: dict):
        """Process AI_TASK_COMPLETED event"""
        logger.debug(f"Processing event: {event}")
        
        event_type = event.get("event")
        if event_type != "AI_TASK_COMPLETED":
            return
        
        job_id = event.get("jobId")
        task_type = event.get("taskType")
        status = event.get("status")
        user_id = event.get("userId")
        
        if not user_id:
            logger.warning(f"Event missing userId: {event}")
            return
        
        # Create notification in database
        db = SessionLocal()
        try:
            if status == "succeeded":
                title = f"✅ {task_type.title()} Hoàn Thành"
                message = f"Task {task_type} đã xử lý thành công"
                notif_type = "success"
            else:
                title = f"❌ {task_type.title()} Thất Bại"
                message = event.get("error", f"Task {task_type} xử lý thất bại")
                notif_type = "error"
            
            notification = NotificationRepository.create_notification(
                db=db,
                job_id=job_id,
                user_id=user_id,
                title=title,
                message=message,
                notification_type=notif_type
            )
            
            logger.info(f"Created notification {notification.id} for user {user_id}")
        
        except Exception as e:
            logger.error(f"Error creating notification: {e}")
        
        finally:
            db.close()
        
        # Send to WebSocket client
        import asyncio
        try:
            asyncio.run(manager.broadcast_to_user(
                user_id=user_id,
                message={
                    "type": "notification",
                    "jobId": job_id,
                    "taskType": task_type,
                    "status": status,
                    "title": title,
                    "message": message
                }
            ))
        except Exception as e:
            logger.error(f"Error sending WebSocket notification: {e}")
    
    def stop(self):
        """Stop consumer"""
        self.running = False
        if self.consumer:
            self.consumer.close()
        logger.info("Kafka consumer stopped")

# Global instance
kafka_consumer = KafkaEventConsumer()
