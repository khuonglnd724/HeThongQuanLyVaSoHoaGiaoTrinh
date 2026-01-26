import { useEffect, useState } from 'react'
import workflowApi from '../api/workflowApi'
import SearchFilterBar from '../components/SearchFilterBar'
import ApprovalStatusBadge from '../components/ApprovalStatusBadge'
import { WorkflowItem, WorkflowState } from '../types/workflow'

export default function SearchAnalysisPage() {
  const [data, setData] = useState<WorkflowItem[]>([])
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState<WorkflowState | ''>('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true)
        const res = await workflowApi.getAll()
        setData(res.data)
      } catch (err: any) {
        console.error(err)
        setError(
          err.response?.data?.message ||
            'Không tải được danh sách workflow'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchAll()
  }, [])

  const filtered = data.filter(wf =>
    (!keyword ||
      wf.entityId
        .toLowerCase()
        .includes(keyword.toLowerCase())) &&
    (!status || wf.state === status)
  )

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-lg font-semibold mb-4">
        🔎 Tra cứu & Phân tích Workflow
      </h2>

      <SearchFilterBar
        keyword={keyword}
        setKeyword={setKeyword}
        status={status}
        setStatus={setStatus}
      />

      {loading && (
        <div className="italic text-gray-500">
          ⏳ Đang tải dữ liệu...
        </div>
      )}

      {error && (
        <div className="text-red-600 mb-3">
          ❌ {error}
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <table className="w-full border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Workflow ID</th>
              <th className="border p-2">Entity ID</th>
              <th className="border p-2">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(wf => (
              <tr key={wf.id}>
                <td className="border p-2 font-mono text-xs">
                  {wf.id}
                </td>
                <td className="border p-2">
                  {wf.entityId}
                </td>
                <td className="border p-2">
                  <ApprovalStatusBadge status={wf.state} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!loading && filtered.length === 0 && (
        <div className="italic text-gray-500">
          Không có workflow phù hợp
        </div>
      )}
    </div>
  )
}
