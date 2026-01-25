from pydantic import BaseModel, Field
from typing import Optional, List

class SummaryRequest(BaseModel):
    syllabusId: str = Field(..., min_length=1, description="ID of syllabus to summarize")
    documentId: Optional[str] = Field(None, description="ID of specific document to summarize (if None, summarize entire syllabus)")
    versionId: Optional[str] = None
    sections: Optional[List[str]] = None
    length: Optional[str] = Field("MEDIUM", description="Summary length: SHORT, MEDIUM, or LONG")

class SummaryResult(BaseModel):
    jobId: str
    summary: str
    bullets: List[str]
