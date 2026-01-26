import { WorkflowHistory } from '../types/workflowHistory'

const actionColor: Record<string, string> = {
  SUBMIT: 'text-blue-600',
  APPROVE: 'text-green-600',
  REJECT: 'text-red-600',
  REQUIRE_EDIT: 'text-yellow-600'
}

export default function AuditLogTimeline({
  logs = []
}: {
  logs?: WorkflowHistory[]
}) {
  if (logs.length === 0) {
    return (
      <div className="text-gray-500 italic">
        Chưa có lịch sử xử lý workflow
      </div>
    )
  }

  return (
    <div className="border rounded p-4 mt-6 bg-gray-50">
      <h3 className="font-semibold mb-4">
        📜 Lịch sử xử lý
      </h3>

      <ol className="relative border-l border-gray-300 ml-2">
        {logs.map((log, index) => (
          <li key={index} className="mb-6 ml-4">
            <div className="absolute w-3 h-3 bg-gray-300 rounded-full -left-1.5 mt-1.5" />

            <div className="text-sm">
              <div className="font-medium">
                {log.actor} – {log.role}
              </div>

              <div className={actionColor[log.action]}>
                {log.action}
              </div>

              <div className="text-gray-500 text-xs">
                {log.timestamp}
              </div>

              {log.comment && (
                <div className="mt-1 italic">
                  “{log.comment}”
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
