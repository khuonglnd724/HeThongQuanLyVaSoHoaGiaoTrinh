import { SyllabusChange } from '../types/syllabusDiff'

export default function ChangeDetectionViewer({
  changes = []
}: {
  changes?: SyllabusChange[]
}) {
  if (changes.length === 0) {
    return (
      <div className="text-gray-500 italic">
        Không phát hiện thay đổi nội dung
      </div>
    )
  }

  return (
    <div className="border rounded p-4 bg-gray-50">
      <h3 className="font-semibold mb-2">
        🔍 Thay đổi nội dung giáo trình
      </h3>

      {changes.map((c, i) => (
        <div key={i} className="mb-2">
          <div className="font-medium">{c.field}</div>
          <div className="text-sm">
            <span className="line-through text-red-500 mr-2">
              {c.oldValue}
            </span>
            <span className="text-green-600">
              {c.newValue}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
