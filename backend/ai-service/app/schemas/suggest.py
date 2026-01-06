from pydantic import BaseModel, Field
from typing import Optional, List

class SuggestRequest(BaseModel):
    syllabusId: str = Field(..., min_length=1, description="Syllabus ID")
    section: Optional[str] = None
    textDraft: Optional[str] = None
    requestId: Optional[str] = None

class SuggestionItem(BaseModel):
    type: str  # "objective", "summary", "edit"
    text: str
    score: Optional[float] = None

class SuggestResult(BaseModel):
    jobId: str
    suggestions: List[SuggestionItem]
    tokens: Optional[int] = None
