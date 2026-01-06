from pydantic import BaseModel, Field
from typing import Optional, List

class SummaryRequest(BaseModel):
    syllabusId: str = Field(..., min_length=1, description="ID of syllabus to summarize")
    versionId: Optional[str] = None
    sections: Optional[List[str]] = None

class SummaryResult(BaseModel):
    jobId: str
    summary: str
    bullets: List[str]
