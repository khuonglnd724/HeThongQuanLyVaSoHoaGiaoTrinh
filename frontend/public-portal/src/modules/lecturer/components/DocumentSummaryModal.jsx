import React, { useState, useEffect } from 'react'
import { X, Sparkles, Loader, AlertCircle } from 'lucide-react'
import aiService from '../services/aiService'

export default function DocumentSummaryModal({ document, onClose }) {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (document?.aiIngestionJobId) {
      loadSummary()
    }
  }, [document])

  const loadSummary = async () => {
    if (!document?.aiIngestionJobId) return
    
    setLoading(true)
    setError(null)
    try {
      // NEW: Check current job status first
      console.log('[DocumentSummaryModal] Checking job status for jobId:', document.aiIngestionJobId)
      const jobData = await aiService.getJobStatus(document.aiIngestionJobId)
      const jobContent = jobData.data || jobData
      
      console.log('[DocumentSummaryModal] Job response:', jobContent)
      
      // Normalize status to uppercase for consistent comparison
      const normalizedStatus = (jobContent.status || '').toUpperCase()
      
      if (normalizedStatus === 'SUCCEEDED' && jobContent.result) {
        // Job is complete, show the result
        console.log('[DocumentSummaryModal] Summary loaded:', jobContent.result)
        setSummary(jobContent.result)
      } else if (normalizedStatus === 'QUEUED' || normalizedStatus === 'RUNNING') {
        // Job is still processing, show message with retry
        setError(`Tóm tắt đang được tạo (trạng thái: ${jobContent.status}). Vui lòng chờ một lát rồi thử lại.`)
      } else if (normalizedStatus === 'FAILED') {
        setError(`Tóm tắt thất bại: ${jobContent.error || 'Lỗi không xác định'}`)
      } else {
        setError(`Không thể tải tóm tắt - trạng thái không xác định: ${jobContent.status}`)
      }
    } catch (err) {
      console.error('[DocumentSummaryModal] Load summary error:', err)
      setError('Lỗi khi tải tóm tắt: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="text-blue-600" size={24} />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Tóm tắt tài liệu</h2>
              <p className="text-sm text-gray-600">{document?.originalName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-blue-100 rounded-lg text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader className="mx-auto mb-3 text-blue-600 animate-spin" size={32} />
                <p className="text-gray-600">Đang tải tóm tắt...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                <span className="text-red-800">{error}</span>
              </div>
              {error.includes('đang được tạo') && (
                <button
                  onClick={loadSummary}
                  className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                >
                  Thử lại
                </button>
              )}
            </div>
          )}

          {!loading && !error && summary && (
            <div className="space-y-6">
              {/* Main Summary */}
              {summary.summary && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Tóm tắt chính</h3>
                  <p className="text-gray-700 leading-relaxed text-justify whitespace-pre-wrap">
                    {summary.summary}
                  </p>
                </div>
              )}

              {/* Bullets/Key Points */}
              {summary.bullets && summary.bullets.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Điểm chính</h3>
                  <ul className="space-y-2">
                    {summary.bullets.map((bullet, idx) => (
                      <li key={idx} className="flex gap-3">
                        <span className="text-blue-600 font-bold flex-shrink-0">•</span>
                        <span className="text-gray-700">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Keywords */}
              {summary.keywords && summary.keywords.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Từ khóa</h3>
                  <div className="flex flex-wrap gap-2">
                    {summary.keywords.map((keyword, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Target Audience */}
              {summary.targetAudience && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">👥 Đối tượng học</h3>
                  <p className="text-gray-700">{summary.targetAudience}</p>
                </div>
              )}

              {/* Prerequisites */}
              {summary.prerequisites && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">📚 Điều kiện tiên quyết</h3>
                  <p className="text-gray-700">{summary.prerequisites}</p>
                </div>
              )}
            </div>
          )}

          {!loading && !error && !summary && (
            <div className="text-center py-12">
              <AlertCircle className="mx-auto mb-3 text-gray-400" size={32} />
              <p className="text-gray-600">Không có dữ liệu tóm tắt</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}
