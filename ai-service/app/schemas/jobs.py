from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime
from enum import Enum

class JobStatus(str, Enum):
    QUEUED = "queued"
    RUNNING = "running"
    SUCCEEDED = "succeeded"
    FAILED = "failed"
    CANCELED = "canceled"

class JobResponse(BaseModel):
    jobId: str
    taskType: str
    status: JobStatus
    createdAt: datetime
    updatedAt: datetime
    progress: Optional[int] = 0  # 0-100
    meta: Optional[dict] = None
    result: Optional[Any] = None
    error: Optional[str] = None

class JobCreateResponse(BaseModel):
    jobId: str
    status: JobStatus
    message: str = "Task queued successfully"
