import apiClient from '../../../services/api/apiClient'

const AI_BASE = '/api/ai'

const aiService = {
  // Ingest document into AI service
  ingestDocument: async (file, syllabusId, subjectName = '', documentId = '') => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('syllabus_id', syllabusId)
    if (subjectName) {
      formData.append('subject_name', subjectName)
    }
    if (documentId) {
      formData.append('document_id', documentId)
    }
    return apiClient.post(`${AI_BASE}/documents/ingest`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  // Generate summary for a specific document in a syllabus
  generateDocumentSummary: async (syllabusId, documentId, length = 'MEDIUM') => {
    return apiClient.post(`${AI_BASE}/summary`, {
      syllabusId,
      documentId,
      length // SHORT, MEDIUM, LONG
    })
  },

  // Legacy: Generate summary for syllabus (kept for backward compatibility)
  generateSummary: async (syllabusId, length = 'MEDIUM') => {
    return apiClient.post(`${AI_BASE}/summary`, {
      syllabusId,
      length
    })
  },

  // Get job status and result
  getJobStatus: async (jobId) => {
    const response = await apiClient.get(`${AI_BASE}/jobs/${jobId}`)
    console.log(`[aiService] getJobStatus(${jobId}) full response:`, response)
    console.log(`[aiService] getJobStatus(${jobId}) response.data:`, response.data)
    // axios wraps response in .data property
    return response.data || response
  },

  // Get summary result from completed job
  getSummaryResult: async (jobId) => {
    try {
      const jobData = await aiService.getJobStatus(jobId)
      const jobDataContent = jobData.data || jobData
      if (jobDataContent.status === 'SUCCEEDED' && jobDataContent.result) {
        return jobDataContent.result
      }
      return null
    } catch (err) {
      console.error('[aiService] getSummaryResult error:', err)
      return null
    }
  },

  // Cancel a job
  cancelJob: async (jobId) => {
    return apiClient.post(`${AI_BASE}/jobs/${jobId}/cancel`)
  },

  // Search in documents
  searchDocuments: async (query, syllabusId = '', limit = 5) => {
    const params = { query, limit }
    if (syllabusId) {
      params.syllabus_id = syllabusId
    }
    return apiClient.get(`${AI_BASE}/documents/search`, { params })
  },

  // Get collections (ingested syllabi)
  getCollections: async () => {
    return apiClient.get(`${AI_BASE}/documents/collections`)
  },

  // Delete documents for a syllabus
  deleteDocuments: async (syllabusId) => {
    return apiClient.delete(`${AI_BASE}/documents/${syllabusId}`)
  },

  // Save document AI job tracking
  saveDocumentJobId: async (documentId, jobId) => {
    return apiClient.put(`/api/syllabus/documents/${documentId}/update-job-id`, {
      jobId
    })
  },

  // Save document job ID immediately (don't wait for job completion)
  saveDocumentJobIdImmediately: async (documentId, jobId) => {
    try {
      console.log(`[aiService] Calling saveDocumentJobId(documentId=${documentId}, jobId=${jobId})`)
      const saveResponse = await aiService.saveDocumentJobId(documentId, jobId)
      console.log(`[aiService] ✅ SAVED - jobId saved to database, response:`, saveResponse)
      return saveResponse
    } catch (saveError) {
      console.error(`[aiService] ❌ ERROR - Failed to save jobId:`, saveError)
      throw saveError
    }
  },

  // Check CLO-PLO consistency
  checkCLOPLOConsistency: async (syllabusId, cloIds = [], ploIds = [], mapping = {}) => {
    return apiClient.post(`${AI_BASE}/clo-check`, {
      syllabusId,
      cloList: cloIds,
      ploList: ploIds,
      mapping: mapping
    })
  }
}

export default aiService
