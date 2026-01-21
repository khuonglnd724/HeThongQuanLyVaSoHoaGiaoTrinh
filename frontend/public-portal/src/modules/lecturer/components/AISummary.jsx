import React from 'react'
import { Sparkles, FileText, Users, Clock } from 'lucide-react'

export const AISummary = ({ syllabus, loading }) => {
  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
        <p className="text-gray-500 mt-2">Đang tạo tóm tắt...</p>
      </div>
    )
  }

  if (!syllabus?.aiSummary) {
    return <div className="text-center py-8 text-gray-500">Không có tóm tắt</div>
  }

  return (
    <div className="card p-6 bg-gradient-to-br from-primary-50 to-blue-50 border-primary-200">
      <div className="flex items-start gap-3 mb-4">
        <Sparkles className="text-primary-600 flex-shrink-0 mt-1" size={24} />
        <h3 className="text-lg font-semibold text-primary-900">Tóm tắt AI</h3>
      </div>

      <p className="text-gray-700 leading-relaxed mb-6">
        {syllabus.aiSummary.summary}
      </p>

      {/* Key Points */}
      {syllabus.aiSummary.keyPoints?.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 mb-3 text-sm">Điểm chính:</h4>
          <ul className="space-y-2">
            {syllabus.aiSummary.keyPoints.map((point, idx) => (
              <li key={idx} className="flex gap-2 text-sm text-gray-700">
                <span className="text-primary-600 font-bold">•</span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-primary-200">
        <div className="text-center">
          <div className="text-primary-600 font-semibold">{syllabus.credits || 0}</div>
          <div className="text-xs text-gray-600">Tín chỉ</div>
        </div>
        <div className="text-center">
          <div className="text-primary-600 font-semibold">{syllabus.hours || 0}</div>
          <div className="text-xs text-gray-600">Giờ học</div>
        </div>
        <div className="text-center">
          <div className="text-primary-600 font-semibold">{syllabus.semester || '-'}</div>
          <div className="text-xs text-gray-600">Học kỳ</div>
        </div>
      </div>
    </div>
  )
}

export default AISummary
