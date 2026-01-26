/**
 * Syllabus Approval Service
 * Handles workflow state transitions for syllabi (submit, approve, reject, publish)
 */

import apiClient from '../../../services/api/apiClient'
import syllabusServiceV2 from './syllabusServiceV2'

export const syllabusApprovalService = {
  /**
   * Submit syllabus for review (Lecturer → HoD review)
   * Changes status from DRAFT to PENDING_REVIEW
   */
  submit: async (syllabusId, userId) => {
    try {
      return await syllabusServiceV2.submit(syllabusId, userId)
    } catch (err) {
      console.error('Submit syllabus failed:', err)
      throw err
    }
  },

  /**
   * HoD reviews and approves (HoD → PENDING_APPROVAL)
   */
  reviewApprove: async (syllabusId, userId) => {
    try {
      return await syllabusServiceV2.reviewApprove(syllabusId, userId)
    } catch (err) {
      console.error('Review approve failed:', err)
      throw err
    }
  },

  /**
   * AA approves CLO-PLO mapping (AA → APPROVED)
   */
  approve: async (syllabusId, userId) => {
    try {
      return await syllabusServiceV2.approve(syllabusId, userId)
    } catch (err) {
      console.error('Approve failed:', err)
      throw err
    }
  },

  /**
   * Principal publishes (Principal → PUBLISHED)
   */
  publish: async (syllabusId, userId) => {
    try {
      return await syllabusServiceV2.publish(syllabusId, userId)
    } catch (err) {
      console.error('Publish failed:', err)
      throw err
    }
  },

  /**
   * Reject at any review stage (HoD or AA can reject)
   * Changes status to REJECTED with reason
   */
  reject: async (syllabusId, reason, userId) => {
    try {
      return await syllabusServiceV2.reject(syllabusId, reason, userId)
    } catch (err) {
      console.error('Reject failed:', err)
      throw err
    }
  },

  /**
   * Request revision (for rejected syllabi)
   */
  revise: async (syllabusId, userId) => {
    try {
      return await syllabusServiceV2.revise(syllabusId, userId)
    } catch (err) {
      console.error('Revise failed:', err)
      throw err
    }
  },

  /**
   * Get approval status info for a syllabus
   */
  getApprovalStatus: async (syllabusId) => {
    try {
      const res = await apiClient.get(`/api/syllabuses/${syllabusId}/approval-status`)
      return res
    } catch (err) {
      console.error('Get approval status failed:', err)
      throw err
    }
  },

  /**
   * Get approval history (timeline of status changes)
   */
  getApprovalHistory: async (syllabusId) => {
    try {
      const res = await apiClient.get(`/api/syllabuses/${syllabusId}/approval-history`)
      return res
    } catch (err) {
      console.error('Get approval history failed:', err)
      throw err
    }
  }
}

export default syllabusApprovalService
