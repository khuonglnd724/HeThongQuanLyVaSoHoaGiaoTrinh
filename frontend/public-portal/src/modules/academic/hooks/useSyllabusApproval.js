import { useEffect, useState } from 'react'
import syllabusApprovalService from '../services/syllabusApprovalService'

export const useSyllabusApproval = () => {
  const [syllabi, setSyllabi] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchSyllabi = async (filter = {}) => {
    setLoading(true)
    try {
      const response = await syllabusApprovalService.getRequests(filter)
      const data = response?.data?.data || []
      setSyllabi(data)
      setError(null)
    } catch (err) {
      console.error('Failed to load syllabi for approval', err)
      setError(err?.message || 'Không tải được danh sách giáo trình chờ duyệt')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSyllabi()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { syllabi, loading, error, fetchSyllabi }
}
