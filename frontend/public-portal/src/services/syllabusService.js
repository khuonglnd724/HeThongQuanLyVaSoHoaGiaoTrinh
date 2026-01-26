import axios from 'axios'

const API_BASE = '/api/academic/syllabus'

const getAuthHeader = () => {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

const syllabusService = {
  // Get all available programs for filter dropdown
  getAllPrograms: async () => {
    try {
      const response = await axios.get(`${API_BASE}/programs/all`, {
        headers: getAuthHeader()
      })
      const data = response.data?.data || response.data
      return Array.isArray(data) ? data : []
    } catch (error) {
      console.error('Error fetching programs:', error.message)
      return []
    }
  },

  // Get all published syllabuses (with optional programName filter)
  getPublishedSyllabuses: async (page = 0, size = 50, programName = null) => {
    try {
      let url = `${API_BASE}/published`
      if (programName) {
        url += `?programName=${encodeURIComponent(programName)}`
      }
      const response = await axios.get(url, {
        headers: getAuthHeader()
      })
      // Backend returns { success: true, data: [...], message: "..." }
      const data = response.data?.data || response.data
      return Array.isArray(data) ? data : [data]
    } catch (error) {
      console.error('Error fetching published syllabuses:', error.message)
      throw error
    }
  },

  // Get syllabus by ID
  getSyllabusById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE}/${id}`, {
        headers: getAuthHeader()
      })
      return response.data?.data || response.data
    } catch (error) {
      console.error('Error fetching syllabus:', error.message)
      throw error
    }
  },

  // Get syllabuses by subject
  getSyllabusesbySubject: async (subject) => {
    try {
      const response = await axios.get(`${API_BASE}/subject/${subject}`, {
        headers: getAuthHeader()
      })
      const data = response.data?.data || response.data
      return Array.isArray(data) ? data : [data]
    } catch (error) {
      console.error('Error fetching syllabuses by subject:', error.message)
      throw error
    }
  },

  // Search syllabuses
  searchSyllabuses: async (keyword, filters = {}) => {
    try {
      const response = await axios.get(`${API_BASE}/search`, {
        params: { keyword, ...filters },
        headers: getAuthHeader()
      })
      const data = response.data?.data || response.data
      return Array.isArray(data) ? data : [data]
    } catch (error) {
      console.error('Error searching syllabuses:', error.message)
      throw error
    }
  },

  // Get syllabus documents
  getSyllabusDocuments: async (syllabusId) => {
    try {
      const response = await axios.get(`${API_BASE}/${syllabusId}/documents`, {
        headers: getAuthHeader()
      })
      return response.data?.data || response.data || []
    } catch (error) {
      console.warn('Error fetching syllabus documents:', error.message)
      return []
    }
  }
}

export default syllabusService
