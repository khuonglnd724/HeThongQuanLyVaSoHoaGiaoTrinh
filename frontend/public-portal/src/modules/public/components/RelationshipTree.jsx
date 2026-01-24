import React from 'react'
import { GitBranch } from 'lucide-react'

export default function RelationshipTree({ relationships = { prerequisites: [], corequisites: [], parallel: [] } }) {
  const { prerequisites = [], corequisites = [], parallel = [] } = relationships

  if (prerequisites.length === 0 && corequisites.length === 0 && parallel.length === 0) {
    return (
      <div className="bg-blue-50 rounded-lg p-6 border-2 border-blue-200">
        <div className="flex items-center gap-2 mb-2">
          <GitBranch size={20} className="text-blue-600" />
          <h3 className="font-semibold text-blue-900">Quan hệ môn học</h3>
        </div>
        <p className="text-blue-700">Môn học này không có quan hệ tiên quyết hoặc song hành.</p>
      </div>
    )
  }

  return (
    <div className="bg-blue-50 rounded-lg p-6 border-2 border-blue-200">
      <div className="flex items-center gap-2 mb-4">
        <GitBranch size={20} className="text-blue-600" />
        <h3 className="font-semibold text-blue-900">Quan hệ môn học</h3>
      </div>

      <div className="space-y-4">
        {prerequisites.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-700 mb-2">📚 Môn tiên quyết</h4>
            <div className="flex flex-wrap gap-2">
              {prerequisites.map((subject) => (
                <span
                  key={subject.id}
                  className="px-3 py-1 bg-blue-200 text-blue-900 rounded-full text-sm font-medium"
                >
                  {subject.code}: {subject.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {corequisites.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-700 mb-2">🔄 Môn học song hành</h4>
            <div className="flex flex-wrap gap-2">
              {corequisites.map((subject) => (
                <span
                  key={subject.id}
                  className="px-3 py-1 bg-purple-200 text-purple-900 rounded-full text-sm font-medium"
                >
                  {subject.code}: {subject.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {parallel.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-700 mb-2">➡️ Môn học song song</h4>
            <div className="flex flex-wrap gap-2">
              {parallel.map((subject) => (
                <span
                  key={subject.id}
                  className="px-3 py-1 bg-green-200 text-green-900 rounded-full text-sm font-medium"
                >
                  {subject.code}: {subject.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
