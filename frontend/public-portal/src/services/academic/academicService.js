// Academic Service - Handle academic operations API calls
import apiClient from '../api/apiClient'

export const academicService = {
  // Get all courses
  getAllCourses: async (params = {}) => {
    try {
      const response = await apiClient.get('/api/academic/courses', { params })
      return response.data
    } catch (error) {
      console.error('Academic Service - Get courses error:', error)
      throw error.response?.data || { message: error.message || 'Failed to fetch courses' }
    }
  },

  // Get course by ID
  getCourseById: async (id) => {
    try {
      const response = await apiClient.get(`/api/academic/courses/${id}`)
      return response.data
    } catch (error) {
      console.error('Academic Service - Get course error:', error)
      throw error.response?.data || { message: error.message || 'Failed to fetch course' }
    }
  },

  // Create course
  createCourse: async (courseData) => {
    try {
      const response = await apiClient.post('/api/academic/courses', courseData)
      return response.data
    } catch (error) {
      console.error('Academic Service - Create course error:', error)
      throw error.response?.data || { message: error.message || 'Failed to create course' }
    }
  },

  // Update course
  updateCourse: async (id, courseData) => {
    try {
      const response = await apiClient.put(`/api/academic/courses/${id}`, courseData)
      return response.data
    } catch (error) {
      console.error('Academic Service - Update course error:', error)
      throw error.response?.data || { message: error.message || 'Failed to update course' }
    }
  },

  // Delete course
  deleteCourse: async (id) => {
    try {
      const response = await apiClient.delete(`/api/academic/courses/${id}`)
      return response.data
    } catch (error) {
      console.error('Academic Service - Delete course error:', error)
      throw error.response?.data || { message: error.message || 'Failed to delete course' }
    }
  },

  // Get departments
  getAllDepartments: async () => {
    try {
      const response = await apiClient.get('/api/academic/departments')
      return response.data
    } catch (error) {
      console.error('Academic Service - Get departments error:', error)
      throw error.response?.data || { message: error.message || 'Failed to fetch departments' }
    }
  },

  // Get semester info
  getCurrentSemester: async () => {
    try {
      const response = await apiClient.get('/api/academic/semesters/current')
      return response.data
    } catch (error) {
      console.error('Academic Service - Get semester error:', error)
      throw error.response?.data || { message: error.message || 'Failed to fetch semester' }
    }
  },

  // Get academic statistics
  getStatistics: async () => {
    try {
      const response = await apiClient.get('/api/academic/statistics')
      return response.data
    } catch (error) {
      console.error('Academic Service - Get statistics error:', error)
      throw error.response?.data || { message: error.message || 'Failed to fetch statistics' }
    }
  },

  // Assign lecturer to course
  assignLecturer: async (courseId, lecturerId) => {
    try {
      const response = await apiClient.post(`/api/academic/courses/${courseId}/assign`, { lecturerId })
      return response.data
    } catch (error) {
      console.error('Academic Service - Assign lecturer error:', error)
      throw error.response?.data || { message: error.message || 'Failed to assign lecturer' }
    }
  }
}

export default academicService



