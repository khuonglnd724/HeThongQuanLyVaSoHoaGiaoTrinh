"""Repository for AI Notification management"""
from sqlalchemy.orm import Session
from datetime import datetime
from app.database.models import AINotification

class NotificationRepository:
    """Handle all database operations for AI Notifications"""
    
    @staticmethod
    def create_notification(
        db: Session,
        job_id: str,
        user_id: str,
        title: str,
        message: str,
        notification_type: str = "info"
    ) -> AINotification:
        """Create a new notification"""
        notification = AINotification(
            job_id=job_id,
            user_id=user_id,
            title=title,
            message=message,
            notification_type=notification_type,
            created_at=datetime.utcnow()
        )
        db.add(notification)
        db.commit()
        db.refresh(notification)
        return notification
    
    @staticmethod
    def get_notification(db: Session, notification_id: int) -> AINotification:
        """Get notification by ID"""
        return db.query(AINotification)\
            .filter(AINotification.id == notification_id)\
            .first()
    
    @staticmethod
    def get_user_notifications(
        db: Session,
        user_id: str,
        unread_only: bool = False,
        limit: int = 50
    ) -> list:
        """Get notifications for a user"""
        query = db.query(AINotification)\
            .filter(AINotification.user_id == user_id)
        
        if unread_only:
            query = query.filter(AINotification.read == False)
        
        return query.order_by(AINotification.created_at.desc())\
            .limit(limit)\
            .all()
    
    @staticmethod
    def mark_as_read(db: Session, notification_id: int) -> AINotification:
        """Mark notification as read"""
        notification = NotificationRepository.get_notification(db, notification_id)
        if notification and not notification.read:
            notification.read = True
            notification.read_at = datetime.utcnow()
            db.commit()
            db.refresh(notification)
        return notification
    
    @staticmethod
    def mark_all_as_read(db: Session, user_id: str) -> int:
        """Mark all notifications as read for a user"""
        count = db.query(AINotification)\
            .filter(AINotification.user_id == user_id, AINotification.read == False)\
            .update({"read": True, "read_at": datetime.utcnow()})
        db.commit()
        return count
    
    @staticmethod
    def delete_notification(db: Session, notification_id: int) -> bool:
        """Delete a notification"""
        notification = NotificationRepository.get_notification(db, notification_id)
        if notification:
            db.delete(notification)
            db.commit()
            return True
        return False
    
    @staticmethod
    def get_unread_count(db: Session, user_id: str) -> int:
        """Get unread notification count for user"""
        return db.query(AINotification)\
            .filter(AINotification.user_id == user_id, AINotification.read == False)\
            .count()
