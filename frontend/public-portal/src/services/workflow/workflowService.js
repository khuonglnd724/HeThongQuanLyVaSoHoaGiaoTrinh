// Workflow Service - Handle workflow and approval API calls
import apiClient from '../api/apiClient'

export const workflowService = {
  // Get workflow instances
  getWorkflowInstances: async (params = {}) => {
    try {
      const response = await apiClient.get('/api/workflow/instances', { params })
      return response.data
    } catch (error) {
      console.error('Workflow Service - Get instances error:', error)
      throw error.response?.data || { message: error.message || 'Failed to fetch workflows' }
    }
  },

  // Get workflow by ID
  getWorkflowById: async (id) => {
    try {
      const response = await apiClient.get(`/api/workflow/instances/${id}`)
      return response.data
    } catch (error) {
      console.error('Workflow Service - Get workflow error:', error)
      throw error.response?.data || { message: error.message || 'Failed to fetch workflow' }
    }
  },

  // Start new workflow
  startWorkflow: async (workflowData) => {
    try {
      const response = await apiClient.post('/api/workflow/instances', workflowData)
      return response.data
    } catch (error) {
      console.error('Workflow Service - Start workflow error:', error)
      throw error.response?.data || { message: error.message || 'Failed to start workflow' }
    }
  },

  // Approve workflow step
  approveStep: async (instanceId, stepId, comment = '') => {
    try {
      const response = await apiClient.post(
        `/api/workflow/instances/${instanceId}/steps/${stepId}/approve`,
        { comment }
      )
      return response.data
    } catch (error) {
      console.error('Workflow Service - Approve step error:', error)
      throw error.response?.data || { message: error.message || 'Failed to approve step' }
    }
  },

  // Reject workflow step
  rejectStep: async (instanceId, stepId, reason) => {
    try {
      const response = await apiClient.post(
        `/api/workflow/instances/${instanceId}/steps/${stepId}/reject`,
        { reason }
      )
      return response.data
    } catch (error) {
      console.error('Workflow Service - Reject step error:', error)
      throw error.response?.data || { message: error.message || 'Failed to reject step' }
    }
  },

  // Get pending tasks for current user
  getPendingTasks: async () => {
    try {
      const response = await apiClient.get('/api/workflow/tasks/pending')
      return response.data
    } catch (error) {
      console.error('Workflow Service - Get pending tasks error:', error)
      throw error.response?.data || { message: error.message || 'Failed to fetch tasks' }
    }
  },

  // Get workflow history
  getWorkflowHistory: async (instanceId) => {
    try {
      const response = await apiClient.get(`/api/workflow/instances/${instanceId}/history`)
      return response.data
    } catch (error) {
      console.error('Workflow Service - Get history error:', error)
      throw error.response?.data || { message: error.message || 'Failed to fetch history' }
    }
  }
}

export default workflowService



