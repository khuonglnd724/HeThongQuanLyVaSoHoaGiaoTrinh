import React from 'react'

export const DiffViewer = ({ diff, loading }) => {
  if (loading) {
    return <div className="text-center py-8 text-gray-500">Đang so sánh...</div>
  }

  if (!diff) {
    return null
  }

  const renderDiffLine = (line) => {
    const type = line.type || 'SAME'

    if (type === 'ADDED') {
      return (
        <div className="bg-success-50 border-l-4 border-success-500 p-3 my-2 rounded">
          <span className="text-success-600 font-medium">+ Thêm:</span>
          <span className="ml-2">{line.content}</span>
        </div>
      )
    }

    if (type === 'REMOVED') {
      return (
        <div className="bg-danger-50 border-l-4 border-danger-500 p-3 my-2 rounded">
          <span className="text-danger-600 font-medium">- Xóa:</span>
          <span className="ml-2 line-through">{line.content}</span>
        </div>
      )
    }

    if (type === 'MODIFIED') {
      return (
        <div className="bg-warning-50 border-l-4 border-warning-500 p-3 my-2 rounded">
          <span className="text-warning-600 font-medium">~ Sửa:</span>
          <span className="ml-2">{line.content}</span>
        </div>
      )
    }

    return (
      <div className="p-3 my-2">
        <span className="text-gray-600">{line.content}</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Thay đổi giữa các phiên bản</h3>
        <span className="badge badge-primary">
          {diff.changePercentage}% thay đổi
        </span>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {diff.changes?.map((change, idx) => (
          <div key={idx}>{renderDiffLine(change)}</div>
        ))}
      </div>
    </div>
  )
}

export default DiffViewer
