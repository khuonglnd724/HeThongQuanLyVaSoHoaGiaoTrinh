import { useEffect, useState } from 'react'
import workflowApi from '../api/workflowApi'
import { WorkflowReviewDTO } from '../types/workflowReview'

type Role = 'ROLE_LECTURER' | 'ROLE_ACADEMIC_AFFAIRS' | 'ROLE_HOD' | 'ROLE_RECTOR'

export default function ReviewPage({
  workflowId,
  role,
  onBack
}: {
  workflowId: string
  role: Role
  onBack: () => void
}) {
  const [data, setData] = useState<WorkflowReviewDTO>()
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get current user from localStorage
  const getCurrentUser = () => {
    try {
      const userStr = localStorage.getItem('user')
      return userStr ? JSON.parse(userStr) : null
    } catch (e) {
      console.error('Failed to parse user from localStorage:', e)
      return null
    }
  }

  const currentUser = getCurrentUser()
  
  // Decode JWT token to get user info
  const getTokenUser = () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return null
      const parts = token.split('.')
      if (parts.length !== 3) return null
      // Decode JWT payload
      const decoded = JSON.parse(atob(parts[1]))
      return {
        userId: decoded.userId || decoded.sub,
        username: decoded.sub,
        email: decoded.email,
        roles: decoded.roles
      }
    } catch (e) {
      console.error('Failed to decode JWT token:', e)
      return null
    }
  }

  const tokenUser = getTokenUser()
  const actionBy = currentUser?.userId || tokenUser?.userId || currentUser?.username || tokenUser?.username || currentUser?.email || 'unknown'

  useEffect(() => {
    workflowApi.getReview(workflowId).then(res => {
      setData(res.data)
    }).catch(err => {
      console.error('Failed to load workflow review:', err)
      setError(err?.response?.data?.message || 'Không tải được thông tin workflow')
    })
  }, [workflowId])

  if (error) return <div className="text-red-600">❌ Lỗi: {error}</div>
  if (!data) return <i>⏳ Đang tải...</i>

  const handleApprove = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('=== APPROVE DEBUG ===')
      console.log('Workflow ID:', workflowId)
      console.log('Action By:', actionBy)
      console.log('Role:', role)
      console.log('Current User:', currentUser)
      console.log('Token User:', tokenUser)
      console.log('Request body:', { actionBy, role })
      console.log('=== END DEBUG ===')
      await workflowApi.approve(workflowId, {
        actionBy,
        role
      })
      alert('✓ Duyệt thành công!')
      onBack()
    } catch (err: any) {
      console.error('Approve failed:', err)
      const errorMsg = err?.response?.data?.message || err?.message || 'Duyệt thất bại'
      setError(errorMsg)
      alert('✗ Lỗi: ' + errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    if (!comment.trim()) return alert('Cần nhập comment')
    try {
      setLoading(true)
      setError(null)
      console.log('Rejecting workflow:', { workflowId, actionBy, role, comment })
      await workflowApi.reject(
        workflowId,
        { actionBy, role },
        { comment }
      )
      alert('✓ Từ chối thành công!')
      onBack()
    } catch (err: any) {
      console.error('Reject failed:', err)
      const errorMsg = err?.response?.data?.message || err?.message || 'Từ chối thất bại'
      setError(errorMsg)
      alert('✗ Lỗi: ' + errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleRequireEdit = async () => {
    if (!comment.trim()) return alert('Cần nhập comment')
    try {
      setLoading(true)
      setError(null)
      console.log('Requiring edit for workflow:', { workflowId, actionBy, role, comment })
      await workflowApi.requireEdit(
        workflowId,
        { actionBy, role },
        { comment }
      )
      alert('✓ Yêu cầu chỉnh sửa thành công!')
      onBack()
    } catch (err: any) {
      console.error('Require edit failed:', err)
      const errorMsg = err?.response?.data?.message || err?.message || 'Yêu cầu chỉnh sửa thất bại'
      setError(errorMsg)
      alert('✗ Lỗi: ' + errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded shadow">
      <button onClick={onBack}>← Quay lại</button>

      <h2 className="text-lg font-semibold">
        Workflow: {data.workflow.id} — Vai trò: {role}
      </h2>
      
      <div className="mt-2 text-sm text-gray-600">
        <div>Trạng thái: <span className={`font-semibold ${data.workflow.state === 'REVIEW' ? 'text-green-600' : 'text-orange-600'}`}>{data.workflow.state}</span></div>
        <div>User: {actionBy}</div>
      </div>
      
      {data.workflow.state !== 'REVIEW' && (
        <div className="mt-2 p-2 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
          ⚠️ Workflow không ở trạng thái REVIEW. Trạng thái hiện tại: {data.workflow.state}
          {data.workflow.state === 'APPROVED' && ' - Đã được duyệt rồi!'}
          {data.workflow.state === 'REJECTED' && ' - Đã bị từ chối!'}
        </div>
      )}

      {error && (
        <div className="mt-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
          ❌ {error}
        </div>
      )}

      <pre className="bg-gray-100 p-2 mt-3">
        {JSON.stringify(data.syllabus, null, 2)}
      </pre>

      <textarea
        className="border w-full mt-3"
        value={comment}
        onChange={e => setComment(e.target.value)}
      />

      <div className="flex gap-3 mt-3">
        <button 
          onClick={handleApprove}
          disabled={loading || data.workflow.state !== 'REVIEW'}
          className={data.workflow.state !== 'REVIEW' ? 'opacity-50 cursor-not-allowed' : ''}
          title={data.workflow.state !== 'REVIEW' ? `Không thể duyệt - Workflow đang ở trạng thái ${data.workflow.state}` : ''}
        >
          ✔ Approve
        </button>
        <button 
          onClick={handleReject}
          disabled={loading || data.workflow.state !== 'REVIEW'}
          className={data.workflow.state !== 'REVIEW' ? 'opacity-50 cursor-not-allowed' : ''}
        >
          ✖ Reject
        </button>
        {role === 'ROLE_HOD' && (
          <button 
            onClick={handleRequireEdit}
            disabled={loading || data.workflow.state !== 'REVIEW'}
            className={data.workflow.state !== 'REVIEW' ? 'opacity-50 cursor-not-allowed' : ''}
          >
            🔄 Require Edit
          </button>
        )}
      </div>

      {loading && <i>⏳ Đang xử lý...</i>}
    </div>
  )
}
