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
    try {
      const response = await syllabusService.exportPdf(syllabusId)
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `syllabus-${syllabusId}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
    } catch (err) {
      console.error('Error exporting PDF:', err)
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Giáo trình',
        url: window.location.href,
      })
    } else {
      alert('Sao chép liên kết: ' + window.location.href)
    }
  }

  return (
    <div className="flex gap-2 flex-wrap">
      <button
        onClick={handleFollow}
        disabled={loading}
        className={`btn ${followed ? 'btn-primary' : 'btn-outline'} gap-2`}
      >
        <Heart size={18} fill={followed ? 'currentColor' : 'none'} />
        {followed ? 'Đã theo dõi' : 'Theo dõi'}
      </button>

      <button onClick={handleShare} className="btn btn-secondary gap-2">
        <Share2 size={18} />
        Chia sẻ
      </button>

      <button onClick={handleExportPdf} className="btn btn-secondary gap-2">
        <Download size={18} />
        Xuất PDF
      </button>
    </div>
  )
}

export default FollowButton
