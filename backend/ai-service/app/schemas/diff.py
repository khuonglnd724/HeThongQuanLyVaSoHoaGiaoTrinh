from pydantic import BaseModel, Field
from typing import Optional, List


class DiffRequest(BaseModel):
    # Optional syllabus for RAG context
    syllabusId: Optional[str] = None

    # Freeform content diff (used by current worker/tasks)
    oldContent: str = Field(..., min_length=1, description="Old content to compare")
    newContent: str = Field(..., min_length=1, description="New content to compare")

    # Optional metadata fields (kept for compatibility/future use)
    baseVersionId: Optional[str] = None
    targetVersionId: Optional[str] = None
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
