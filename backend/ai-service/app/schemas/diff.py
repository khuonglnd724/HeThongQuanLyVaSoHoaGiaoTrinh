from pydantic import BaseModel
from typing import Optional, List

class DiffRequest(BaseModel):
    syllabusId: str
    baseVersionId: str
    targetVersionId: str
    sections: Optional[List[str]] = None

class DiffItem(BaseModel):
    section: str
    changeType: str  # "added", "removed", "modified"
    detail: str
    severity: Optional[str] = None  # "high", "medium", "low"

class DiffResult(BaseModel):
    jobId: str
    diffs: List[DiffItem]
    summary: str
