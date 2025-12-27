from pydantic import BaseModel
from typing import Optional, List

class SummaryRequest(BaseModel):
    syllabusId: str
    versionId: Optional[str] = None
    sections: Optional[List[str]] = None

class SummaryResult(BaseModel):
    jobId: str
    summary: str
    bullets: List[str]
