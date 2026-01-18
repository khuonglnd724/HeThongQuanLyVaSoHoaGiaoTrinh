export type SyllabusStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "PUBLISHED"
  | "REJECTED";

export interface SyllabusResponse {
  id: string;
  rootId: string;

  subjectCode: string;
  subjectName: string;
  summary?: string | null;

  versionNo: number;
  status: SyllabusStatus;

  createdBy: string;
  updatedBy?: string | null;

  createdAt: string;
  updatedAt: string;

  submittedAt?: string | null;
  reviewedAt?: string | null;
  approvedAt?: string | null;
  publishedAt?: string | null;
  rejectedAt?: string | null;
  rejectionReason?: string | null;
  lastActionBy?: string | null;
}

export interface CreateSyllabusRequest {
  subjectCode: string;
  subjectName: string;
  summary?: string | null;
}

export interface UpdateSyllabusRequest {
  subjectName?: string | null;
  summary?: string | null;
  changeNote?: string | null;
}

export interface RejectSyllabusRequest {
  reason: string;
}
