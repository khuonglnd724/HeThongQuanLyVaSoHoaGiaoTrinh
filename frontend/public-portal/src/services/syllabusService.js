import axios from 'axios'

const API_BASE = '/api/syllabus'

// Mock data - từ database syllabus_db
const MOCK_SYLLABUSES = [
  {
    id: 'ba59f0be-bdf3-4ab1-8863-abbdce35348b',
    subject_code: 'CS-01',
    subject_name: 'Lập trình',
    summary: 'Giáo trình về lập trình cơ bản và nâng cao với các ứng dụng thực tế',
    credits: 3,
    semester: 'Kỳ I',
    academic_year: '2024-2025',
    major: 'Công Nghệ Thông Tin',
    status: 'PUBLISHED',
    version_no: 1,
    created_at: '2026-01-25T04:42:47.183413Z',
    created_by: 'lecturer1@smd.edu.vn'
  }
]

const syllabusService = {
  // Get all published syllabuses
  getPublishedSyllabuses: async (page = 0, size = 10) => {
    try {
      // Try to get from backend first
      const response = await axios.get(`${API_BASE}/published`, {
        params: { page, size }
      })
      return response.data
    } catch (error) {
      console.warn('Backend endpoint not available, using mock data:', error.message)
      // Fallback to mock data
      return MOCK_SYLLABUSES
    }
  },

  // Get syllabus by ID
  getSyllabusById: async (id) => {
    try {
      // Try to get from backend first
      const response = await axios.get(`${API_BASE}/${id}`)
      return response.data
    } catch (error) {
      console.warn('Backend endpoint not available, using mock data:', error.message)
      // Fallback to mock data
      const syllabus = MOCK_SYLLABUSES.find(s => s.id === id)
      if (syllabus) {
        return { data: syllabus }
      }
      throw new Error('Syllabus not found')
    }
  },

  // Get syllabuses by subject
  getSyllabusesbySubject: async (subject) => {
    try {
      const response = await axios.get(`${API_BASE}/subject/${subject}`)
      return response.data
    } catch (error) {
      console.warn('Backend endpoint not available, using mock data:', error.message)
      // Fallback to mock data
      return MOCK_SYLLABUSES.filter(s => s.subject_code?.includes(subject))
    }
  },

  // Search syllabuses
  searchSyllabuses: async (keyword, filters = {}) => {
    try {
      const response = await axios.get(`${API_BASE}/search`, {
        params: { keyword, ...filters }
      })
      return response.data
    } catch (error) {
      console.warn('Backend endpoint not available, using mock data:', error.message)
      // Fallback to mock data with search
      let results = [...MOCK_SYLLABUSES]
      
      if (keyword) {
        results = results.filter(s =>
          s.subject_code?.toLowerCase().includes(keyword.toLowerCase()) ||
          s.subject_name?.toLowerCase().includes(keyword.toLowerCase()) ||
          s.summary?.toLowerCase().includes(keyword.toLowerCase())
        )
      }
      
      if (filters.major) {
        results = results.filter(s => s.major === filters.major)
      }
      if (filters.semester) {
        results = results.filter(s => s.semester === filters.semester)
      }
      if (filters.academic_year) {
        results = results.filter(s => s.academic_year === filters.academic_year)
      }
      
      return results
    }
  },

  // Get syllabus documents
  getSyllabusDocuments: async (syllabusId) => {
    try {
      const response = await axios.get(`${API_BASE}/${syllabusId}/documents`)
      return response.data
    } catch (error) {
      console.warn('Backend endpoint not available:', error.message)
      // Fallback - mock documents
      return []
    }
  }
}

export default syllabusService
