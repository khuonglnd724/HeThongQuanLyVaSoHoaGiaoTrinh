from pydantic import BaseModel, ConfigDict
from typing import Optional, List

class ChatMessage(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    
    role: str  # "user", "assistant", "system"
    content: str

class ChatRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    
    conversationId: Optional[str] = None
    messages: List[ChatMessage]
    syllabusId: Optional[str] = None
    contextVersionId: Optional[str] = None

class ChatAnswer(BaseModel):
    content: str
    citations: Optional[List[str]] = None

class ChatResult(BaseModel):
    jobId: str
    conversationId: str
    answer: ChatAnswer
    usage: Optional[dict] = None
