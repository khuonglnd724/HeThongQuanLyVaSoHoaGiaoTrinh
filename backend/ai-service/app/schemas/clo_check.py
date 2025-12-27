from pydantic import BaseModel
from typing import Optional, List, Any

class CLOCheckRequest(BaseModel):
    syllabusId: str
    cloList: List[Any]
    ploList: List[Any]
    mapping: Optional[dict] = None
    programId: Optional[str] = None

class CLOIssue(BaseModel):
    type: str
    description: str
    severity: str  # "critical", "warning", "info"

class MappingSuggestion(BaseModel):
    clo: str
    suggestedPlo: List[str]
    confidence: float

class CLOCheckReport(BaseModel):
    issues: List[CLOIssue]
    mappingSuggestions: List[MappingSuggestion]

class CLOCheckResult(BaseModel):
    jobId: str
    report: CLOCheckReport
    score: Optional[float] = None
