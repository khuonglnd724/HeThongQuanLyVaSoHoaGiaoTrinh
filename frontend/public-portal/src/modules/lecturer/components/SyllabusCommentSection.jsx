import React, { useState, useEffect } from 'react'
import { Send, Loader } from 'lucide-react'

/**
 * Collaborative review comment section for syllabus
 * Shows feedback from HoD/AA and allows lecturer to add responses
 */
const SyllabusCommentSection = ({ 
  syllabusId, 
  syllabusStatus, 
  userId,
  onCommentAdded 
}) => {
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Mock API calls - replace with actual API
  const loadComments = async () => {
    setLoading(true)
    try {
      // TODO: Call API to get comments for syllabus
      // const res = await syllabusCommentAPI.getComments(syllabusId)
      // setComments(res.data || [])
      
      // Mock data for now
      setComments([
        {
          id: 1,
          author: 'TS. Nguyễn Văn A',
          role: 'HoD',
          timestamp: new Date(Date.now() - 2*60*60*1000),
          content: 'Vui lòng cập nhật lại phần CLO sao cho khớp với PLO của chương trình đào tạo. Hiện tại có 3 CLO chưa được ánh xạ tới PLO nào.',
          isDraft: false
        },
        {
          id: 2,
          author: 'Thầy/Cô Giảng viên',
          role: 'Lecturer',
          timestamp: new Date(Date.now() - 1*60*60*1000),
          content: 'Vâng, em đã cập nhật thêm các CLO mới và ánh xạ lại theo yêu cầu. Xin cảm ơn thầy/cô.',
          isDraft: false
        }
      ])
    } catch (err) {
      console.error('Load comments failed:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (syllabusId && (syllabusStatus === 'PENDING_REVIEW' || syllabusStatus === 'PENDING_APPROVAL')) {
      loadComments()
    }
  }, [syllabusId, syllabusStatus])

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      alert('Vui lòng nhập bình luận')
      return
    }

    setSubmitting(true)
    try {
      // TODO: Call API to add comment
      // await syllabusCommentAPI.addComment(syllabusId, { content: newComment }, userId)
      
      // Mock: add comment locally
      const newCommentObj = {
        id: Date.now(),
        author: 'Bạn',
        role: 'Lecturer',
        timestamp: new Date(),
        content: newComment,
        isDraft: false
      }
      setComments(prev => [...prev, newCommentObj])
      setNewComment('')
      
      if (onCommentAdded) {
        onCommentAdded()
      }
      alert('Bình luận đã được thêm')
    } catch (err) {
      console.error('Add comment failed:', err)
      alert('Thêm bình luận thất bại: ' + (err.response?.data?.message || err.message))
    } finally {
      setSubmitting(false)
    }
  }

  // Only show comment section if syllabus is in review status
  if (!syllabusStatus || (syllabusStatus !== 'PENDING_REVIEW' && syllabusStatus !== 'PENDING_APPROVAL')) {
    return null
  }

  return (
    <div className="mt-8">
      <h4 className="text-lg font-semibold text-gray-900 mb-4">💬 Bình luận & Phản hồi</h4>
      
      {loading ? (
        <div className="text-center py-4 text-gray-500">
          <Loader size={20} className="inline mr-2 animate-spin" />
          Đang tải bình luận...
        </div>
      ) : comments.length === 0 ? (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
          Chưa có bình luận nào. Vui lòng chờ phòng Đào Tạo hoặc HoD phản hồi về giáo trình của bạn.
        </div>
      ) : (
        <div className="space-y-4 mb-6">
          {comments.map(comment => (
            <div
              key={comment.id}
              className={`p-4 rounded-lg border ${
                comment.role === 'HoD'
                  ? 'bg-yellow-50 border-yellow-200'
                  : comment.role === 'AA'
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium text-gray-900">{comment.author}</p>
                  <p className="text-xs text-gray-600">
                    {comment.role === 'HoD' && '👨‍💼 Trưởng bộ môn'}
                    {comment.role === 'AA' && '🏫 Phòng Đào Tạo'}
                    {comment.role === 'Lecturer' && '👩‍🏫 Giảng viên'}
                  </p>
                </div>
                <p className="text-xs text-gray-500">
                  {comment.timestamp.toLocaleString('vi-VN')}
                </p>
              </div>
              <p className="text-gray-700 text-sm whitespace-pre-wrap">{comment.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* Add Comment Form */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Thêm bình luận / Phản hồi
        </label>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Nhập phản hồi, cảm ơn hoặc câu hỏi của bạn..."
          rows={3}
          className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm mb-3"
        />
        <button
          onClick={handleAddComment}
          disabled={submitting || !newComment.trim()}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium flex items-center justify-center gap-2"
        >
          <Send size={16} />
          {submitting ? 'Đang gửi...' : 'Gửi bình luận'}
        </button>
      </div>

      <p className="text-xs text-gray-500 mt-3 italic">
        💡 Tip: Sử dụng phần này để giao tiếp với HoD hoặc Phòng Đào Tạo về các yêu cầu chỉnh sửa.
      </p>
    </div>
  )
}

export default SyllabusCommentSection
