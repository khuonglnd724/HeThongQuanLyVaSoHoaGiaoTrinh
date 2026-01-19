import { WorkflowState } from '../types/workflow'

interface Props {
  keyword: string
  setKeyword: (v: string) => void
  status: WorkflowState | ''
  setStatus: (v: WorkflowState | '') => void
}

export default function SearchFilterBar({
  keyword,
  setKeyword,
  status,
  setStatus
}: Props) {
  return (
    <div className="flex gap-3 mb-4">
      <input
        className="border rounded px-2 py-1"
        placeholder="Tìm theo Entity ID..."
        value={keyword}
        onChange={e => setKeyword(e.target.value)}
      />

      <select
        className="border rounded px-2 py-1"
        value={status}
        onChange={e =>
          setStatus(e.target.value as WorkflowState | '')
        }
      >
        <option value="">Tất cả trạng thái</option>
        <option value="DRAFT">DRAFT</option>
        <option value="REVIEW">REVIEW</option>
        <option value="APPROVED">APPROVED</option>
        <option value="REJECTED">REJECTED</option>
      </select>
    </div>
  )
}
