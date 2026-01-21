import { WorkflowState } from '../types/workflow'

export default function ApprovalStatusBadge({
  status
}: {
  status: WorkflowState
}) {
  const map: Record<WorkflowState, string> = {
    DRAFT: 'bg-gray-200 text-gray-800',
    REVIEW: 'bg-yellow-200 text-yellow-800',
    APPROVED: 'bg-green-200 text-green-800',
    REJECTED: 'bg-red-200 text-red-800'
  }

  return (
    <span
      className={`px-2 py-1 rounded text-xs font-semibold ${map[status]}`}
    >
      {status}
    </span>
  )
}
