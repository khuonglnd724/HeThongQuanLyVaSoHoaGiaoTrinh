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

  useEffect(() => {
    workflowApi.getReview(workflowId).then(res => {
      setData(res.data)
    })
  }, [workflowId])

  if (!data) return <i>⏳ Đang tải...</i>

  const actionBy = role === 'ROLE_RECTOR' ? 'principal01' : role === 'ROLE_HOD' ? 'hod01' : role === 'ROLE_ACADEMIC_AFFAIRS' ? 'academic01' : 'lecturer01'

  const handleApprove = async () => {
    setLoading(true)
    await workflowApi.approve(workflowId, {
      actionBy,
      role
    })
    setLoading(false)
    onBack()
  }

  const handleReject = async () => {
    if (!comment.trim()) return alert('Cần nhập comment')
    setLoading(true)
    await workflowApi.reject(
      workflowId,
      { actionBy, role },
      { comment }
    )
    setLoading(false)
    onBack()
  }

  const handleRequireEdit = async () => {
    if (!comment.trim()) return alert('Cần nhập comment')
    setLoading(true)
    await workflowApi.requireEdit(
      workflowId,
      { actionBy, role },
      { comment }
    )
    setLoading(false)
    onBack()
  }

  return (
    <div className="bg-white p-6 rounded shadow">
      <button onClick={onBack}>← Quay lại</button>

      <h2 className="text-lg font-semibold">
        Workflow: {data.workflow.id} — Vai trò: {role}
      </h2>

      <pre className="bg-gray-100 p-2 mt-3">
        {JSON.stringify(data.syllabus, null, 2)}
      </pre>

      <textarea
        className="border w-full mt-3"
        value={comment}
        onChange={e => setComment(e.target.value)}
      />

      <div className="flex gap-3 mt-3">
        <button onClick={handleApprove}>✔ Approve</button>
        <button onClick={handleReject}>✖ Reject</button>
        {role === 'ROLE_HOD' && (
          <button onClick={handleRequireEdit}>🔄 Require Edit</button>
        )}
      </div>

      {loading && <i>⏳ Đang xử lý...</i>}
    </div>
  )
}
