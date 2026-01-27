import React, { useState } from 'react'
import { Heart, Share2, Download } from 'lucide-react'
import { followSyllabus, unfollowSyllabus } from '../services/studentService'

export const FollowButton = ({ syllabusId, initialFollowed = false, onFollowChange }) => {
  const [followed, setFollowed] = useState(initialFollowed)
  const [loading, setLoading] = useState(false)

  const handleFollow = async () => {
    setLoading(true)
    try {
      if (followed) {
        await unfollowSyllabus(syllabusId)
      } else {
        await followSyllabus(syllabusId)
      }

      setFollowed(!followed)
      onFollowChange?.(!followed)
    } catch (err) {
      console.error('Error toggling follow:', err)
      alert('Lỗi khi theo dõi đề cương. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  const handleExportPdf = async () => {
    // TODO: Implement PDF export when backend supports it
    alert('Chức năng xuất PDF đang được phát triển.')
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Giáo trình',
        url: window.location.href,
      })
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert('Đã sao chép liên kết!'))
        .catch(() => alert('Sao chép liên kết: ' + window.location.href))
    }
  }

  return (
    <div className="flex gap-2 flex-wrap">
      <button
        onClick={handleFollow}
        disabled={loading}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
          followed 
            ? 'bg-pink-100 text-pink-600 hover:bg-pink-200 border border-pink-300' 
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300'
        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <Heart size={18} fill={followed ? 'currentColor' : 'none'} />
        )}
        {followed ? 'Đã theo dõi' : 'Theo dõi'}
      </button>

      <button onClick={handleShare} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300 rounded-lg font-medium transition-all">
        <Share2 size={18} />
        Chia sẻ
      </button>

      <button onClick={handleExportPdf} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300 rounded-lg font-medium transition-all">
        <Download size={18} />
        Xuất PDF
      </button>
    </div>
  )
}

export default FollowButton
