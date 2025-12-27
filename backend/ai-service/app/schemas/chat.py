from pydantic import BaseModel
from typing import Optional, List

class ChatMessage(BaseModel):
    role: str  # "user", "assistant", "system"
    content: str

class ChatRequest(BaseModel):
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
