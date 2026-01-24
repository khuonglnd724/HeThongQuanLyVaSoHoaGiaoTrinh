import React, { useState } from 'react'
import { Send } from 'lucide-react'

export default function FeedbackForm({ syllabusId, onSubmit }) {
  const [formData, setFormData] = useState({
    type: 'feedback',
    title: '',
    message: '',
    email: ''
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.message.trim()) {
      alert('Vui lòng điền đầy đủ thông tin')
      return
    }

    setLoading(true)
    try {
      await onSubmit({
        ...formData,
        syllabusId
      })
      setSubmitted(true)
      setFormData({ type: 'feedback', title: '', message: '', email: '' })
      setTimeout(() => setSubmitted(false), 3000)
    } catch (error) {
      alert('Lỗi gửi phản hồi: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Gửi phản hồi / Báo lỗi</h3>

      {submitted && (
        <div className="mb-4 p-3 bg-green-100 border-2 border-green-400 text-green-800 rounded">
          ✅ Cảm ơn bạn! Phản hồi đã được gửi thành công.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Loại phản hồi</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="feedback">Phản hồi chung</option>
            <option value="error">Báo lỗi</option>
            <option value="suggestion">Đề xuất cải tiến</option>
            <option value="question">Câu hỏi</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tiêu đề</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Tiêu đề phản hồi"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={100}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung</label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Nhập chi tiết phản hồi của bạn..."
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            maxLength={500}
          />
          <div className="text-xs text-gray-500 mt-1">{formData.message.length}/500</div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email (tuỳ chọn)</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email của bạn"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={18} />
          {loading ? 'Đang gửi...' : 'Gửi phản hồi'}
        </button>
      </form>
    </div>
  )
}
