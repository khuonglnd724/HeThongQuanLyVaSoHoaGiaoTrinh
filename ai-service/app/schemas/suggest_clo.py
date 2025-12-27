from pydantic import BaseModel
from typing import Optional, List

class SuggestSimilarCLORequest(BaseModel):
    currentCLO: str
    subjectArea: Optional[str] = None
    level: Optional[str] = None  # "beginner", "intermediate", "advanced"
    limit: Optional[int] = 5

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
