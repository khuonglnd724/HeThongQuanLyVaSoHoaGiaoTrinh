from pydantic import BaseModel, ConfigDict, Field, field_validator
from typing import Optional, List, Literal

class ChatMessage(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    
    role: Literal["user", "assistant", "system"] = Field(..., description="Message role")
    content: str = Field(..., min_length=1, description="Message content")

class ChatRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    
    conversationId: Optional[str] = None
    messages: List[ChatMessage] = Field(..., min_items=1, description="At least one message required")
    syllabusId: Optional[str] = None
    contextVersionId: Optional[str] = None
    
    @field_validator('messages')
    def validate_messages(cls, v):
        """Ensure last message is from user"""
        if v and v[-1].role != "user":
            raise ValueError("Last message must be from user")
        return v

class ChatAnswer(BaseModel):
    content: str
    citations: Optional[List[str]] = None

class ChatResult(BaseModel):
    jobId: str
    conversationId: str
    answer: ChatAnswer
    usage: Optional[dict] = None
