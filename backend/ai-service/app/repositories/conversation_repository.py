"""Repository for AI Conversation management"""
from sqlalchemy.orm import Session
from datetime import datetime
from app.database.models import AIConversation, AIMessage

class ConversationRepository:
    """Handle all database operations for AI Conversations"""
    
    @staticmethod
    def create_conversation(
        db: Session,
        conversation_id: str,
        user_id: str,
        syllabus_id: str = None,
        title: str = None
    ) -> AIConversation:
        """Create a new conversation"""
        conversation = AIConversation(
            conversation_id=conversation_id,
            user_id=user_id,
            syllabus_id=syllabus_id,
            title=title,
            created_at=datetime.utcnow()
        )
        db.add(conversation)
        db.commit()
        db.refresh(conversation)
        return conversation
    
    @staticmethod
    def get_conversation(db: Session, conversation_id: str) -> AIConversation:
        """Get conversation by ID"""
        return db.query(AIConversation)\
            .filter(AIConversation.conversation_id == conversation_id)\
            .first()
    
    @staticmethod
    def get_user_conversations(db: Session, user_id: str, limit: int = 50) -> list:
        """Get all conversations for a user"""
        return db.query(AIConversation)\
            .filter(AIConversation.user_id == user_id)\
            .order_by(AIConversation.updated_at.desc())\
            .limit(limit)\
            .all()
    
    @staticmethod
    def add_message(
        db: Session,
        conversation_id: str,
        role: str,
        content: str
    ) -> AIMessage:
        """Add a message to conversation"""
        message = AIMessage(
            conversation_id=conversation_id,
            role=role,
            content=content,
            created_at=datetime.utcnow()
        )
        db.add(message)
        db.commit()
        db.refresh(message)
        
        # Update conversation updated_at
        conversation = ConversationRepository.get_conversation(db, conversation_id)
        if conversation:
            conversation.updated_at = datetime.utcnow()
            db.commit()
        
        return message
    
    @staticmethod
    def get_conversation_messages(db: Session, conversation_id: str, limit: int = 100) -> list:
        """Get messages from a conversation"""
        return db.query(AIMessage)\
            .filter(AIMessage.conversation_id == conversation_id)\
            .order_by(AIMessage.created_at.asc())\
            .limit(limit)\
            .all()
    
    @staticmethod
    def delete_conversation(db: Session, conversation_id: str) -> bool:
        """Delete a conversation and all its messages"""
        conversation = ConversationRepository.get_conversation(db, conversation_id)
        if conversation:
            db.delete(conversation)  # Cascade delete messages
            db.commit()
            return True
        return False
