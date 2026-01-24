/**
 * Academic API Wrapper
 * Provides convenience methods for accessing academic data
 * (Subjects, CLOs, PLOs, Programs, Departments)
 */

import apiClient from '../../../services/api/apiClient'
import syllabusServiceV2 from './syllabusServiceV2'

export const academicAPI = {
  /**
   * Get all subjects
   */
  getSubjects: async () => {
    try {
      return await syllabusServiceV2.getSubjects()
    } catch (err) {
      console.error('getSubjects failed:', err)
      throw err
    }
  },

  /**
   * Get CLOs by subject ID
   */
  getClosBySubject: async (subjectId) => {
    try {
      const res = await apiClient.get(`/api/v1/clo/subject/${subjectId}`)
      return res
    } catch (err) {
      console.error('getClosBySubject failed:', err)
      throw err
    }
  },

  /**
   * Get PLOs by program ID
   */
  getPlosByProgram: async (programId) => {
    try {
      const res = await apiClient.get(`/api/v1/plo/program/${programId}`)
      return res
    } catch (err) {
      console.error('getPlosByProgram failed:', err)
      throw err
    }
  },

  /**
   * Get all CLOs
   */
  getAllClos: async () => {
    try {
      return await syllabusServiceV2.getAllCLOs()
    } catch (err) {
      console.error('getAllClos failed:', err)
      throw err
    }
  },

  /**
   * Get CLO by ID
   */
  getCloById: async (id) => {
    try {
      return await syllabusServiceV2.getCLOById(id)
    } catch (err) {
      console.error('getCloById failed:', err)
      throw err
    }
  },

  /**
   * Get all PLOs
   */
  getAllPlos: async () => {
    try {
      const res = await apiClient.get(`/api/v1/plo`)
      return res
    } catch (err) {
      console.error('getAllPlos failed:', err)
      throw err
    }
  },

  /**
   * Get PLO by ID
   */
  getPloById: async (id) => {
    try {
      const res = await apiClient.get(`/api/v1/plo/${id}`)
      return res
    } catch (err) {
      console.error('getPloById failed:', err)
      throw err
    }
  },

  /**
   * Get all programs
   */
  getPrograms: async () => {
    try {
      const res = await apiClient.get(`/api/v1/program`)
      return res
    } catch (err) {
      console.error('getPrograms failed:', err)
      throw err
    }
  },

  /**
   * Get program by ID
   */
  getProgramById: async (id) => {
    try {
      const res = await apiClient.get(`/api/v1/program/${id}`)
      return res
    } catch (err) {
      console.error('getProgramById failed:', err)
      throw err
    }
  },

  /**
   * Get subjects by program ID
   */
  getSubjectsByProgram: async (programId) => {
    try {
      const res = await apiClient.get(`/api/v1/program/${programId}/subjects`)
      return res
    } catch (err) {
      console.error('getSubjectsByProgram failed:', err)
      throw err
    }
  },

  /**
   * Get all departments
   */
  getDepartments: async () => {
    try {
      const res = await apiClient.get(`/api/v1/department`)
      return res
    } catch (err) {
      console.error('getDepartments failed:', err)
      throw err
    }
  },

  /**
   * Get subject by ID
   */
  getSubjectById: async (id) => {
    try {
      const res = await apiClient.get(`/api/v1/subject/${id}`)
      return res
    } catch (err) {
      console.error('getSubjectById failed:', err)
      throw err
    }
  },

  /**
   * Create a new CLO (lecturer-owned)
   */
  createClo: async (cloData) => {
    try {
      return await apiClient.post('/api/v1/clo', cloData)
    } catch (err) {
      console.error('createClo failed:', err)
      throw err
    }
  },

  /**
   * Create a CLO-PLO mapping
   */
  createCloMapping: async (mappingData) => {
    try {
      return await apiClient.post('/api/v1/mapping', mappingData)
    } catch (err) {
      console.error('createCloMapping failed:', err)
      throw err
    }
  }
}

export default academicAPI
