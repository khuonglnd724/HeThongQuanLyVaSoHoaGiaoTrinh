import { api } from "../../lib/api";
import type { SyllabusListItem } from "../../lib/types";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

// List all syllabuses for current lecturer
export async function listMySyllabuses(): Promise<SyllabusListItem[]> {
  const res = await api.get<ApiResponse<SyllabusListItem[]>>(
    "/api/syllabus/my-syllabuses"
  );
  return res.data.data;
}

// Get syllabus by ID
export async function getSyllabusById(id: number): Promise<any> {
  const res = await api.get<ApiResponse<any>>(
    `/api/syllabus/${id}`
  );
  return res.data.data;
}

// Create new syllabus
export async function createSyllabus(data: any): Promise<any> {
  const res = await api.post<ApiResponse<any>>(
    "/api/syllabus",
    data
  );
  return res.data.data;
}

// Update existing syllabus
export async function updateSyllabus(id: number, data: any): Promise<any> {
  const res = await api.put<ApiResponse<any>>(
    `/api/syllabus/${id}`,
    data
  );
  return res.data.data;
}

// Submit syllabus for Level 1 approval
export async function submitForApproval(id: number): Promise<any> {
  const res = await api.post<ApiResponse<any>>(
    `/api/syllabus/${id}/submit-level1`
  );
  return res.data.data;
}

// Get CLOs for a syllabus
export async function getCLOs(syllabusId: number): Promise<any[]> {
  const res = await api.get<ApiResponse<any[]>>(
    `/api/syllabus/${syllabusId}/clos`
  );
  return res.data.data;
}

// Save CLOs for a syllabus
export async function saveCLOs(syllabusId: number, clos: any[]): Promise<any> {
  const res = await api.post<ApiResponse<any>>(
    `/api/syllabus/${syllabusId}/clos`,
    clos
  );
  return res.data.data;
}

// Save CLO-PLO mappings
export async function saveCLOMappings(syllabusId: number, mappings: any[]): Promise<any> {
  const res = await api.post<ApiResponse<any>>(
    `/api/syllabus/${syllabusId}/clo-mappings`,
    mappings
  );
  return res.data.data;
}

// Get version history
export async function getVersionHistory(syllabusId: number): Promise<any[]> {
  const res = await api.get<ApiResponse<any[]>>(
    `/api/syllabus/${syllabusId}/versions`
  );
  return res.data.data;
}

// Get feedback for a syllabus
export async function getFeedback(syllabusId: number): Promise<any[]> {
  const res = await api.get<ApiResponse<any[]>>(
    `/api/syllabus/${syllabusId}/feedback`
  );
  return res.data.data;
}

// Respond to feedback
export async function respondToFeedback(syllabusId: number, response: any): Promise<any> {
  const res = await api.post<ApiResponse<any>>(
    `/api/syllabus/${syllabusId}/feedback-response`,
    response
  );
  return res.data.data;
}

// Search syllabuses
export async function searchSyllabuses(keyword: string): Promise<SyllabusListItem[]> {
  const res = await api.get<ApiResponse<SyllabusListItem[]>>(
    `/api/syllabus/search?keyword=${encodeURIComponent(keyword)}`
  );
  return res.data.data;
}

// Get draft syllabuses
export async function getDraftSyllabuses(): Promise<SyllabusListItem[]> {
  const res = await api.get<ApiResponse<SyllabusListItem[]>>(
    "/api/syllabus/draft"
  );
  return res.data.data;
}

// Get rejected syllabuses (need revision)
export async function getRejectedSyllabuses(): Promise<SyllabusListItem[]> {
  const res = await api.get<ApiResponse<SyllabusListItem[]>>(
    "/api/syllabus/rejected"
  );
  return res.data.data;
}

// ==================== AA (ACADEMIC AFFAIRS) APIs ====================

// Get syllabuses pending AA review (Level 2)
export async function getPendingAASyllabuses(): Promise<SyllabusListItem[]> {
  const res = await api.get<ApiResponse<SyllabusListItem[]>>(
    "/api/syllabus/pending-aa"
  );
  return res.data.data;
}

// AA approve syllabus (Level 2) - forward to Principal
export async function approveByAA(syllabusId: number, comment?: string): Promise<any> {
  const res = await api.post<ApiResponse<any>>(
    `/api/syllabus/${syllabusId}/approve-aa`,
    { comment }
  );
  return res.data.data;
}

// AA reject syllabus (Level 2) - return to HoD or Lecturer
export async function rejectByAA(syllabusId: number, reason: string): Promise<any> {
  const res = await api.post<ApiResponse<any>>(
    `/api/syllabus/${syllabusId}/reject-aa`,
    { reason }
  );
  return res.data.data;
}

// AA validate CLO-PLO mapping
export async function validateCLOPLOMapping(syllabusId: number): Promise<any> {
  const res = await api.post<ApiResponse<any>>(
    `/api/syllabus/${syllabusId}/validate-mapping`
  );
  return res.data.data;
}

// AA validate credit structure
export async function validateCreditStructure(syllabusId: number): Promise<any> {
  const res = await api.post<ApiResponse<any>>(
    `/api/syllabus/${syllabusId}/validate-credits`
  );
  return res.data.data;
}

// AA validate assessment rules
export async function validateAssessmentRules(syllabusId: number): Promise<any> {
  const res = await api.post<ApiResponse<any>>(
    `/api/syllabus/${syllabusId}/validate-assessment`
  );
  return res.data.data;
}

// Get AA dashboard statistics
export async function getAADashboardStats(): Promise<any> {
  const res = await api.get<ApiResponse<any>>(
    "/api/syllabus/aa-dashboard"
  );
  return res.data.data;
}

// ==================== ADMIN APIs ====================

// Publish syllabus (make it public)
export async function publishSyllabus(syllabusId: number): Promise<any> {
  const res = await api.post<ApiResponse<any>>(
    `/api/syllabus/${syllabusId}/publish`
  );
  return res.data.data;
}

// Unpublish syllabus (remove from public)
export async function unpublishSyllabus(syllabusId: number): Promise<any> {
  const res = await api.post<ApiResponse<any>>(
    `/api/syllabus/${syllabusId}/unpublish`
  );
  return res.data.data;
}

// Archive syllabus
export async function archiveSyllabus(syllabusId: number, reason?: string): Promise<any> {
  const res = await api.post<ApiResponse<any>>(
    `/api/syllabus/${syllabusId}/archive`,
    { reason }
  );
  return res.data.data;
}

// Get published syllabuses (for admin management)
export async function getPublishedSyllabuses(): Promise<SyllabusListItem[]> {
  const res = await api.get<ApiResponse<SyllabusListItem[]>>(
    "/api/syllabus/published"
  );
  return res.data.data;
}

// Get archived syllabuses
export async function getArchivedSyllabuses(): Promise<SyllabusListItem[]> {
  const res = await api.get<ApiResponse<SyllabusListItem[]>>(
    "/api/syllabus/archived"
  );
  return res.data.data;
}

// Get all syllabuses (admin only)
export async function getAllSyllabuses(): Promise<SyllabusListItem[]> {
  const res = await api.get<ApiResponse<SyllabusListItem[]>>(
    "/api/syllabus/all"
  );
  return res.data.data;
}
