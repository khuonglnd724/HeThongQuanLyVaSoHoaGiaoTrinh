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

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
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
    const response = await this.client.get('/syllabuses', {
      params: { page, size },
    });
    return response.data;
  }

  async getSyllabusById(id: number): Promise<Syllabus> {
    const response = await this.client.get(`/syllabuses/${id}`);
    return response.data;
  }

  async createSyllabus(data: Partial<Syllabus>): Promise<Syllabus> {
    const response = await this.client.post('/syllabuses', data);
    return response.data;
  }

  async updateSyllabus(id: number, data: Partial<Syllabus>): Promise<Syllabus> {
    const response = await this.client.put(`/syllabuses/${id}`, data);
    return response.data;
  }

  async deleteSyllabus(id: number): Promise<void> {
    await this.client.delete(`/syllabuses/${id}`);
  }

  // ============ VALIDATION ============
  async validateApproval(id: number): Promise<ValidationResult> {
    const response = await this.client.post(`/syllabuses/${id}/validate-approval`);
    return response.data;
  }

  async validatePrerequisites(id: number): Promise<any> {
    const response = await this.client.post(`/syllabuses/${id}/validate-prerequisites`);
    return response.data;
  }

  // ============ APPROVAL WORKFLOW ============
  async submitForLevel1Approval(id: number, comment?: string): Promise<ApprovalResponse> {
    const response = await this.client.post(`/syllabuses/${id}/submit-level1`, {
      approverComment: comment,
    });
    return response.data;
  }

  async approveLevel1(id: number, comment?: string): Promise<ApprovalResponse> {
    const response = await this.client.post(`/syllabuses/${id}/approve-level1`, {
      approverComment: comment,
    });
    return response.data;
  }

  async rejectLevel1(id: number, reason: string): Promise<ApprovalResponse> {
    const response = await this.client.post(`/syllabuses/${id}/reject-level1`, {
      approverComment: reason,
    });
    return response.data;
  }

  async approveLevel2(id: number, comment?: string): Promise<ApprovalResponse> {
    const response = await this.client.post(`/syllabuses/${id}/approve-level2`, {
      approverComment: comment,
    });
    return response.data;
  }

  async rejectLevel2(id: number, reason: string): Promise<ApprovalResponse> {
    const response = await this.client.post(`/syllabuses/${id}/reject-level2`, {
      approverComment: reason,
    });
    return response.data;
  }

  // ============ VERSION HISTORY ============
  async getVersionHistory(id: number): Promise<SyllabusVersion[]> {
    const response = await this.client.get(`/syllabuses/${id}/versions`);
    return response.data;
  }

  async getVersion(id: number, versionNumber: number): Promise<SyllabusVersion> {
    const response = await this.client.get(`/syllabuses/${id}/versions/${versionNumber}`);
    return response.data;
  }

  async getLatestVersion(id: number): Promise<SyllabusVersion> {
    const response = await this.client.get(`/syllabuses/${id}/versions/latest`);
    return response.data;
  }

  async compareVersions(
    id: number,
    versionNumber1: number,
    versionNumber2: number
  ): Promise<SyllabusComparison> {
    const response = await this.client.get(
      `/syllabuses/${id}/compare?v1=${versionNumber1}&v2=${versionNumber2}`
    );
    return response.data;
  }

  // ============ SEARCH & FILTER ============
  async searchSyllabuses(criteria: SearchCriteria): Promise<PaginatedResponse<Syllabus>> {
    const response = await this.client.post('/syllabuses/search', criteria);
    return response.data;
  }

  async searchByCodeOrName(
    keyword: string,
    page: number = 0,
    size: number = 10
  ): Promise<PaginatedResponse<Syllabus>> {
    const response = await this.client.get('/syllabuses/search', {
      params: { keyword, page, size },
    });
    return response.data;
  }

  async getPendingApprovalSyllabuses(page: number = 0, size: number = 10): Promise<PaginatedResponse<Syllabus>> {
    const response = await this.client.get('/syllabuses/pending-approval', {
      params: { page, size },
    });
    return response.data;
  }

  async getRejectedSyllabuses(page: number = 0, size: number = 10): Promise<PaginatedResponse<Syllabus>> {
    const response = await this.client.get('/syllabuses/rejected', {
      params: { page, size },
    });
    return response.data;
  }

  async getApprovedSyllabuses(page: number = 0, size: number = 10): Promise<PaginatedResponse<Syllabus>> {
    const response = await this.client.get('/syllabuses/approved', {
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
}

export default new AcademicService();
