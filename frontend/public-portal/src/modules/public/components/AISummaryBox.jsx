import React from 'react'
import { BookOpen, Zap } from 'lucide-react'

export default function AISummaryBox({ summary, loading = false }) {
  if (loading) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border-2 border-purple-200">
        <div className="flex items-center gap-2 mb-4">
          <Zap size={20} className="text-purple-600" />
          <h3 className="font-semibold text-purple-900">AI Tóm tắt</h3>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-purple-200 rounded animate-pulse"></div>
          <div className="h-4 bg-purple-200 rounded animate-pulse w-5/6"></div>
          <div className="h-4 bg-purple-200 rounded animate-pulse w-4/6"></div>
        </div>
      </div>
    )
  }

  if (!summary) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 border-2 border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Zap size={20} className="text-gray-400" />
          <h3 className="font-semibold text-gray-700">AI Tóm tắt</h3>
        </div>
        <p className="text-gray-500">Chưa có tóm tắt AI cho môn học này.</p>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border-2 border-purple-200">
      <div className="flex items-center gap-2 mb-4">
        <Zap size={20} className="text-purple-600" />
        <h3 className="font-semibold text-purple-900">AI Tóm tắt</h3>
      </div>
      <p className="text-gray-700 leading-relaxed">{summary}</p>
    </div>
  )
}
