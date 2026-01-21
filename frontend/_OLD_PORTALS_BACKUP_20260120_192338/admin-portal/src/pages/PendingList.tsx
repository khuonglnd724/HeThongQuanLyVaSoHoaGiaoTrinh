import { useEffect, useState } from 'react'
import workflowApi from '../api/workflowApi'
import { WorkflowItem } from '../types/workflow'

export default function PendingList({
  onSelect
}: {
  onSelect: (workflowId: string) => void
}) {
  const [data, setData] = useState<WorkflowItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchPending = async () => {
      setLoading(true)
      const { data } = await workflowApi.getPending()
      setData(data)
      setLoading(false)
    }
    fetchPending()
  }, [])

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="font-semibold mb-4">📥 Workflow chờ duyệt</h2>

      {loading && <i>⏳ Đang tải...</i>}

      {!loading && data.length === 0 && (
        <i>Không có workflow nào</i>
      )}

      {!loading && data.length > 0 && (
        <table className="w-full border text-sm">
          <thead>
            <tr>
              <th>Mã</th>
              <th>Entity</th>
              <th>Trạng thái</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data.map(wf => (
              <tr key={wf.id}>
                <td>{wf.id}</td>
                <td>{wf.entityId}</td>
                <td>{wf.state}</td>
                <td>
                  <button
                    className="text-blue-600 underline"
                    onClick={() => onSelect(wf.id)}
                  >
                    Xét duyệt
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
