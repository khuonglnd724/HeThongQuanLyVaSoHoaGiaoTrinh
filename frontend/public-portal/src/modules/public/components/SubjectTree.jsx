import React from 'react'
import { ChevronRight } from 'lucide-react'

export const TreeNode = ({ node, depth = 0 }) => {
  const [expanded, setExpanded] = React.useState(false)
  const hasChildren = node.prerequisites?.length > 0 || node.dependents?.length > 0

  return (
    <div className="mb-2">
      <div
        className={`flex items-center p-3 card cursor-pointer ${depth > 0 ? 'ml-4' : ''}`}
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        {hasChildren && (
          <ChevronRight
            size={18}
            className={`mr-2 transition-transform ${expanded ? 'rotate-90' : ''}`}
          />
        )}
        {!hasChildren && <div className="w-6" />}

        <div className="flex-1">
          <div className="font-semibold text-gray-900">{node.subjectCode}</div>
          <div className="text-sm text-gray-600">{node.subjectName}</div>
        </div>

        <div className="text-sm text-gray-500 ml-4">
          <span className="badge badge-primary">{node.credits} TC</span>
        </div>
      </div>

      {expanded && (
        <div className="ml-8 mt-2 pl-4 border-l-2 border-primary-200">
          {node.prerequisites?.length > 0 && (
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Học trước:</h4>
              {node.prerequisites.map((prereq, idx) => (
                <TreeNode key={idx} node={prereq} depth={depth + 1} />
              ))}
            </div>
          )}

          {node.dependents?.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Học sau:</h4>
              {node.dependents.map((dep, idx) => (
                <TreeNode key={idx} node={dep} depth={depth + 1} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export const SubjectTree = ({ tree, loading }) => {
  if (loading) {
    return <div className="text-center py-8 text-gray-500">Đang tải sơ đồ...</div>
  }

  if (!tree) {
    return <div className="text-center py-8 text-gray-500">Không có dữ liệu</div>
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Sơ đồ Tiên quyết & Học phần Tiếp theo</h3>
      <TreeNode node={tree} />
    </div>
  )
}

export default SubjectTree
