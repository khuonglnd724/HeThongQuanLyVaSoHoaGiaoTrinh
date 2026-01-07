from pydantic import BaseModel, Field, validator
from typing import Optional, List, Any, Dict

class CLOCheckRequest(BaseModel):
    syllabusId: str = Field(..., min_length=1, description="Syllabus ID")
    cloList: List[Any] = Field(..., min_items=1, description="List of CLOs to check")
    ploList: List[Any] = Field(..., min_items=1, description="List of PLOs to check against")
    mapping: Optional[Dict[str, List[str]]] = None
    programId: Optional[str] = None
    
    @validator('cloList', 'ploList')
    def validate_lists(cls, v):
        """Ensure lists are not empty"""
        if not v:
            raise ValueError('List must contain at least one item')
        return v

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
