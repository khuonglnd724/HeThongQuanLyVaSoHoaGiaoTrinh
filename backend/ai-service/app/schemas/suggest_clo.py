from pydantic import BaseModel, Field
from typing import Optional, List

class SuggestSimilarCLORequest(BaseModel):
    currentCLO: str = Field(..., min_length=1, description="CLO to find similar matches for")
    subjectArea: Optional[str] = None
    level: Optional[str] = None  # "beginner", "intermediate", "advanced"
    limit: Optional[int] = Field(5, ge=1, le=20, description="Max results to return")

class SimilarCLOItem(BaseModel):
    clo: str
    subject: str
    syllabusId: str
    similarity: float
    context: Optional[str] = None

class SuggestSimilarCLOResult(BaseModel):
    jobId: str
    status: str
    similarCLOs: Optional[List[SimilarCLOItem]] = None
