import { useEffect, useState } from 'react'
import syllabusApprovalService from '../services/syllabusApprovalService'

/**
 * Hook để fetch danh sách syllabus chờ duyệt
 * Dùng cho HOD review (PENDING_REVIEW) hoặc AA/Rector approve (PENDING_APPROVAL)
 */
export const useSyllabusApproval = (approvalStage = 'REVIEW') => {
  const [syllabi, setSyllabi] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchSyllabi = async (filter = {}) => {
    setLoading(true)
    try {
      let response
      if (approvalStage === 'REVIEW') {
        // HOD stage: PENDING_REVIEW
        response = await syllabusApprovalService.getPendingForReview(filter)
      } else {
        // AA/Rector stage: PENDING_APPROVAL
        response = await syllabusApprovalService.getPendingForApproval(filter)
      }
      
      const data = response?.content || response?.data?.content || []
      setSyllabi(Array.isArray(data) ? data : [])
      setError(null)
    } catch (err) {
      console.error('Failed to load syllabi for approval', err)
      const errorMsg = err?.response?.data?.message || err?.message || 'Không tải được danh sách giáo trình chờ duyệt'
      setError(errorMsg)
      setSyllabi([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSyllabi()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [approvalStage])

  return { syllabi, loading, error, fetchSyllabi }
}
