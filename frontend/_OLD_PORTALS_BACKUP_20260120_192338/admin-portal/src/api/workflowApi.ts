import axios from 'axios'
import { WorkflowItem } from '../types/workflow'
import { WorkflowReviewDTO } from '../types/workflowReview'

const api = axios.create({
  baseURL: 'http://localhost:8084/api',
  headers: { 'Content-Type': 'application/json' }
})

interface ActionParams {
  actionBy: string
  role: 'ROLE_LECTURER' | 'ROLE_ACADEMIC_AFFAIRS' | 'ROLE_HOD' | 'ROLE_RECTOR'
}

interface CommentBody {
  comment: string
}

const workflowApi = {

  getPending: () =>
    api.get<WorkflowItem[]>('/workflows', {
      params: { state: 'REVIEW' }
    }),

  getAll: () =>
    api.get<WorkflowItem[]>('/workflows'),

  getReview: (workflowId: string) =>
    api.get<WorkflowReviewDTO>(`/workflows/${workflowId}/review`),

  approve: (workflowId: string, params: ActionParams) =>
    api.post(`/workflows/${workflowId}/approve`, null, { params }),

  reject: (
    workflowId: string,
    params: ActionParams,
    body: CommentBody
  ) =>
    api.post(`/workflows/${workflowId}/reject`, body, { params }),

  requireEdit: (
    workflowId: string,
    params: ActionParams,
    body: CommentBody
  ) =>
    api.post(`/workflows/${workflowId}/require-edit`, body, { params }),

  getHistory: (workflowId: string) =>
    api.get(`/workflows/${workflowId}/history`)
}

export default workflowApi
