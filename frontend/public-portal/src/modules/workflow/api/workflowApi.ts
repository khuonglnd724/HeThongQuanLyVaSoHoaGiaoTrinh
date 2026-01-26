import apiClient from '../../../services/api/apiClient'
import { WorkflowItem } from '../types/workflow'
import { WorkflowReviewDTO } from '../types/workflowReview'

interface ActionParams {
  actionBy: string
  role: 'ROLE_LECTURER' | 'ROLE_ACADEMIC_AFFAIRS' | 'ROLE_HOD' | 'ROLE_RECTOR'
}

interface CommentBody {
  comment: string
}

const workflowApi = {
  getPending: () =>
    apiClient.get<WorkflowItem[]>('/api/workflows', {
      params: { state: 'REVIEW' }
    }),

  getAll: () =>
    apiClient.get<WorkflowItem[]>('/api/workflows'),

  getReview: (workflowId: string) =>
    apiClient.get<WorkflowReviewDTO>(`/api/workflows/${workflowId}/review`),

  approve: (workflowId: string, params: ActionParams) =>
    apiClient.post(`/api/workflows/${workflowId}/approve`, null, { params }),

  reject: (
    workflowId: string,
    params: ActionParams,
    body: CommentBody
  ) =>
    apiClient.post(`/api/workflows/${workflowId}/reject`, body, { params }),

  requireEdit: (
    workflowId: string,
    params: ActionParams,
    body: CommentBody
  ) =>
    apiClient.post(`/api/workflows/${workflowId}/require-edit`, body, { params }),

  getHistory: (workflowId: string) =>
    apiClient.get(`/api/workflows/${workflowId}/history`)
}

export default workflowApi
