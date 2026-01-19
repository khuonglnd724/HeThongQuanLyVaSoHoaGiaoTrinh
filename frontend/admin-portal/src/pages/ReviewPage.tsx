import { useEffect, useState } from 'react'
import workflowApi from '../api/workflowApi'
import { WorkflowReviewDTO } from '../types/workflowReview'

export default function ReviewPage({
  workflowId,
  onBack
}: {
  workflowId: string
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

  const handleApprove = async () => {
    setLoading(true)
    await workflowApi.approve(workflowId, {
      actionBy: 'hod01',
      role: 'HOD'
    })
    setLoading(false)
    onBack()
  }

  const handleReject = async () => {
    if (!comment.trim()) return alert('Cần nhập comment')
    setLoading(true)
    await workflowApi.reject(
      workflowId,
      { actionBy: 'hod01', role: 'HOD' },
      { comment }
    )
    setLoading(false)
    onBack()
  }

  return (
    <div className="bg-white p-6 rounded shadow">
      <button onClick={onBack}>← Quay lại</button>

      <h2 className="text-lg font-semibold">
        Workflow: {data.workflow.id}
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
      </div>

      {loading && <i>⏳ Đang xử lý...</i>}
    </div>
  )
}
