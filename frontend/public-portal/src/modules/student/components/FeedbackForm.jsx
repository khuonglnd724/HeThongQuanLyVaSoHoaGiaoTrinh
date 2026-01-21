import React, { useState } from 'react'
import { Send, AlertCircle } from 'lucide-react'
import { submitFeedback } from '../services/studentService'

const FEEDBACK_TYPES = [
  { value: 'ERROR', label: '❌ Lỗi', color: 'text-danger-600' },
  { value: 'SUGGESTION', label: '💡 Gợi ý', color: 'text-primary-600' },
  { value: 'QUESTION', label: '❓ Câu hỏi', color: 'text-warning-600' },
  { value: 'PRAISE', label: '👍 Khen ngợi', color: 'text-success-600' },
]

export const FeedbackForm = ({ syllabusId, onSuccess }) => {
  const [formData, setFormData] = useState({
    syllabusId,
    feedbackType: 'ERROR',
    title: '',
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!formData.title.trim() || !formData.message.trim()) {
      setError('Vui lòng điền đầy đủ tiêu đề và nội dung')
      return
    }

    setLoading(true)
    try {
      await submitFeedback({
        syllabusId: formData.syllabusId,
        type: formData.feedbackType,
        title: formData.title,
        content: formData.message,
      })

      setSuccess(true)
      setFormData({
        syllabusId,
        feedbackType: 'ERROR',
        title: '',
        message: '',
      })
      onSuccess?.()

      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Gửi phản hồi thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 card p-6">
      <h3 className="text-lg font-semibold">Gửi Phản Hồi</h3>

      {error && (
        <div className="p-3 bg-danger-50 border border-danger-200 rounded-lg flex gap-2 text-danger-600 text-sm">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-success-50 border border-success-200 rounded-lg text-success-600 text-sm">
          ✓ Phản hồi đã được gửi thành công. Cảm ơn bạn!
        </div>
      )}

      {/* Feedback Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Loại Phản Hồi
        </label>
        <select
          name="feedbackType"
          value={formData.feedbackType}
          onChange={handleChange}
          className="input-base"
        >
          {FEEDBACK_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tiêu Đề
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Nhập tiêu đề phản hồi..."
          className="input-base"
          maxLength={100}
        />
        <p className="text-xs text-gray-500 mt-1">{formData.title.length}/100</p>
      </div>

      {/* Message */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nội Dung
        </label>
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          placeholder="Nhập nội dung phản hồi của bạn..."
          className="input-base resize-none"
          rows={4}
          maxLength={1000}
        />
        <p className="text-xs text-gray-500 mt-1">{formData.message.length}/1000</p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="btn btn-primary w-full gap-2"
      >
        <Send size={18} />
        {loading ? 'Đang gửi...' : 'Gửi Phản Hồi'}
      </button>
    </form>
  )
}

export default FeedbackForm
