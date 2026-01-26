import axios, { AxiosInstance } from 'axios';
import {
  Syllabus,
  ValidationResult,
  SyllabusVersion,
  SyllabusComparison,
  ApprovalResponse,
  ProgramStatistic,
  SubjectStatistic,
  StatisticsData,
  Notification,
  SearchCriteria,
  PaginatedResponse,
} from '../types';

class AcademicService {
  private client: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/academic';
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for auth token
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Add response interceptor for unwrapping ApiResponse and error handling
    this.client.interceptors.response.use(
      (response) => {
        const data = response.data;
        if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
          // Unwrap our standard ApiResponse to the inner data payload
          response.data = (data as any).data;
        }
        return response;
      },
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // ============ SYLLABUS CRUD ============
  async getSyllabuses(page: number = 0, size: number = 10): Promise<PaginatedResponse<Syllabus>> {
    const response = await this.client.get('/syllabus', {
      params: { page, size },
    });
    return response.data;
  }

  async getSyllabusById(id: number): Promise<Syllabus> {
    const response = await this.client.get(`/syllabus/${id}`);
    return response.data;
  }

  async createSyllabus(data: Partial<Syllabus>): Promise<Syllabus> {
    const response = await this.client.post('/syllabus', data);
    return response.data;
  }

  async updateSyllabus(id: number, data: Partial<Syllabus>): Promise<Syllabus> {
    const response = await this.client.put(`/syllabus/${id}`, data);
    return response.data;
  }

  async deleteSyllabus(id: number): Promise<void> {
    await this.client.delete(`/syllabus/${id}`);
  }

  // ============ VALIDATION ============
  async validateApproval(id: number): Promise<ValidationResult> {
    const response = await this.client.post(`/syllabus/${id}/validate-approval`);
    return response.data;
  }

  async validatePrerequisites(id: number): Promise<any> {
    const response = await this.client.post(`/syllabus/${id}/validate-prerequisites`);
    return response.data;
  }

  // ============ APPROVAL WORKFLOW ============
  async submitForLevel1Approval(id: number, comment?: string): Promise<ApprovalResponse> {
    const response = await this.client.post(`/syllabus/${id}/submit-level1`, {
      approverComment: comment,
    });
    return response.data;
  }

  async approveLevel1(id: number, comment?: string): Promise<ApprovalResponse> {
    const response = await this.client.post(`/syllabus/${id}/approve-level1`, {
      approverComment: comment,
    });
    return response.data;
  }

  async rejectLevel1(id: number, reason: string): Promise<ApprovalResponse> {
    const response = await this.client.post(`/syllabus/${id}/reject-level1`, {
      approverComment: reason,
    });
    return response.data;
  }

  async approveLevel2(id: number, comment?: string): Promise<ApprovalResponse> {
    const response = await this.client.post(`/syllabus/${id}/approve-level2`, {
      approverComment: comment,
    });
    return response.data;
  }

  async rejectLevel2(id: number, reason: string): Promise<ApprovalResponse> {
    const response = await this.client.post(`/syllabus/${id}/reject-level2`, {
      approverComment: reason,
    });
    return response.data;
  }

  // ============ VERSION HISTORY ============
  async getVersionHistory(id: number): Promise<SyllabusVersion[]> {
    const response = await this.client.get(`/syllabus/${id}/versions`);
    return response.data;
  }

  async getVersion(id: number, versionNumber: number): Promise<SyllabusVersion> {
    const response = await this.client.get(`/syllabus/${id}/versions/${versionNumber}`);
    return response.data;
  }

  async getLatestVersion(id: number): Promise<SyllabusVersion> {
    const response = await this.client.get(`/syllabus/${id}/versions/latest`);
    return response.data;
  }

  async compareVersions(
    id: number,
    versionNumber1: number,
    versionNumber2: number
  ): Promise<SyllabusComparison> {
    const response = await this.client.get(
      `/syllabus/${id}/compare?v1=${versionNumber1}&v2=${versionNumber2}`
    );
    return response.data;
  }

  // ============ SEARCH & FILTER ============
  async searchSyllabuses(criteria: SearchCriteria): Promise<PaginatedResponse<Syllabus>> {
    const response = await this.client.post('/syllabus/search', criteria);
    return response.data;
  }

  async searchByCodeOrName(
    keyword: string,
    page: number = 0,
    size: number = 10
  ): Promise<PaginatedResponse<Syllabus>> {
    const response = await this.client.get('/syllabus/search', {
      params: { keyword, page, size },
    });
    return response.data;
  }

  async getPendingApprovalSyllabuses(page: number = 0, size: number = 10): Promise<PaginatedResponse<Syllabus>> {
    const response = await this.client.get('/syllabus/pending-approval', {
      params: { page, size },
    });
    return response.data;
  }

  async getRejectedSyllabuses(page: number = 0, size: number = 10): Promise<PaginatedResponse<Syllabus>> {
    const response = await this.client.get('/syllabus/rejected', {
      params: { page, size },
    });
    return response.data;
  }

  async getApprovedSyllabuses(page: number = 0, size: number = 10): Promise<PaginatedResponse<Syllabus>> {
    const response = await this.client.get('/syllabus/approved', {
      params: { page, size },
    });
    return response.data;
  }

  // ============ STATISTICS ============
  async getProgramStatistics(programId: number): Promise<ProgramStatistic> {
    const response = await this.client.get(`/statistics/programs/${programId}`);
    return response.data;
  }

  async getSubjectStatistics(subjectId: number): Promise<SubjectStatistic> {
    const response = await this.client.get(`/statistics/subjects/${subjectId}`);
    return response.data;
  }

  async getDepartmentStatistics(): Promise<StatisticsData> {
    const response = await this.client.get('/statistics/department');
    return response.data;
  }

  async getAllProgramsStatistics(): Promise<ProgramStatistic[]> {
    const response = await this.client.get('/statistics/programs');
    return response.data;
  }

  async getAllSubjectsStatistics(): Promise<SubjectStatistic[]> {
    const response = await this.client.get('/statistics/subjects');
    return response.data;
  }

  async getLowCoverageSubjects(minCoverage: number = 80): Promise<SubjectStatistic[]> {
    const response = await this.client.get(`/statistics/low-coverage?minCoverage=${minCoverage}`);
    return response.data;
  }

  // ============ NOTIFICATIONS ============
  async getNotifications(role?: string): Promise<Notification[]> {
    const response = await this.client.get('/notifications', {
      params: { role },
    });
    return response.data;
  }

  async getUnreadNotifications(role?: string): Promise<Notification[]> {
    const response = await this.client.get('/notifications/unread', {
      params: { role },
    });
    return response.data;
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    await this.client.put(`/notifications/${notificationId}/read`);
  }

  async deleteNotification(notificationId: string): Promise<void> {
    await this.client.delete(`/notifications/${notificationId}`);
  }

  // ============ LECTURER OPERATIONS ============
  async getLecturerSyllabuses(lecturerId: number, page: number = 0, size: number = 10): Promise<PaginatedResponse<Syllabus>> {
    const response = await this.client.get(`/syllabus/lecturer/${lecturerId}`, {
      params: { page, size },
    });
    return response.data;
  }

  async saveCLOs(syllabusId: number, clos: any[]): Promise<any> {
    const response = await this.client.post(`/syllabus/${syllabusId}/clos`, { clos });
    return response.data;
  }

  async saveCLOMappings(syllabusId: number, mappings: any[]): Promise<any> {
    const response = await this.client.post(`/syllabus/${syllabusId}/clo-mappings`, { mappings });
    return response.data;
  }

  async respondToFeedback(syllabusId: number, feedback: any): Promise<any> {
    const response = await this.client.post(`/syllabus/${syllabusId}/feedback-response`, feedback);
    return response.data;
  }

  async getLecturerById(lecturerId: number): Promise<any> {
    const response = await this.client.get(`/lecturers/${lecturerId}`);
    return response.data;
  }

  async getLecturers(page: number = 0, size: number = 100): Promise<PaginatedResponse<any>> {
    const response = await this.client.get('/lecturers', {
      params: { page, size },
    });
    return response.data;
  }
}

export default new AcademicService();
