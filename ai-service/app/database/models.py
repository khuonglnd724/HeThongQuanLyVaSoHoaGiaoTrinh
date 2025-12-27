"""SQLAlchemy models for AI Service"""
from sqlalchemy import Column, String, Integer, DateTime, Boolean, Text, JSON, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.database.connection import Base

class AIJobStatus(str, enum.Enum):
    """Job status enum"""
    QUEUED = "queued"
    RUNNING = "running"
    SUCCEEDED = "succeeded"
    FAILED = "failed"
    CANCELED = "canceled"

class AIJob(Base):
    """
    Store all processed AI jobs and their results
    Used for job history and result persistence
    """
    __tablename__ = "ai_jobs"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(String(255), unique=True, nullable=False, index=True)
    task_type = Column(String(50), nullable=False, index=True)  # suggest, chat, diff, clo_check, summary
    user_id = Column(String(255), nullable=True, index=True)
    syllabus_id = Column(String(255), nullable=True, index=True)
    
    status = Column(Enum(AIJobStatus), default=AIJobStatus.QUEUED, nullable=False, index=True)
    progress = Column(Integer, default=0)  # 0-100
    
    request_data = Column(JSON, nullable=True)  # Store request payload
    result_data = Column(JSON, nullable=True)  # Store result
    error_message = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    
    # Relationship
    notifications = relationship("AINotification", back_populates="job", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<AIJob {self.job_id} ({self.task_type}) - {self.status}>"

class AIConversation(Base):
    """
    Store chat conversations for context management
    Each conversation belongs to a user + syllabus
    """
    __tablename__ = "ai_conversations"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(String(255), unique=True, nullable=False, index=True)
    user_id = Column(String(255), nullable=False, index=True)
    syllabus_id = Column(String(255), nullable=True, index=True)
    
    title = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    messages = relationship("AIMessage", back_populates="conversation", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<AIConversation {self.conversation_id} (user: {self.user_id})>"

class AIMessage(Base):
    """
    Store individual messages in a conversation
    Enables context-aware chat responses
    """
    __tablename__ = "ai_messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(String(255), ForeignKey("ai_conversations.conversation_id"), nullable=False)
    
    role = Column(String(20), nullable=False)  # "user" or "assistant"
    content = Column(Text, nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    
    # Relationship
    conversation = relationship("AIConversation", back_populates="messages")

    def __repr__(self):
        return f"<AIMessage {self.id} ({self.role})>"

class AINotification(Base):
    """
    Store notifications for job completions
    Users receive real-time updates via WebSocket
    """
    __tablename__ = "ai_notifications"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(String(255), ForeignKey("ai_jobs.job_id"), nullable=False)
    user_id = Column(String(255), nullable=False, index=True)
    
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(50), nullable=False)  # success, error, info
    
    read = Column(Boolean, default=False, nullable=False, index=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    read_at = Column(DateTime, nullable=True)
    
    # Relationship
    job = relationship("AIJob", back_populates="notifications")

    def __repr__(self):
        return f"<AINotification {self.id} (user: {self.user_id}) - {'read' if self.read else 'unread'}>"
