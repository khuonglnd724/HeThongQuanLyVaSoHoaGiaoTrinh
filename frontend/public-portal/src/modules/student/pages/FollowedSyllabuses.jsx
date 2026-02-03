import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, BookOpen, Heart, Trash2, BookMarked } from 'lucide-react'
import { getMyFollowedSyllabuses, unfollowSyllabus } from '../services/studentService'

export default function FollowedSyllabuses({ user }) {
  const navigate = useNavigate()
  const [followedSyllabi, setFollowedSyllabi] = useState([])
  const [loading, setLoading] = useState(true)
  const [studentMajor, setStudentMajor] = useState(null)

  useEffect(() => {
    loadFollowedSyllabi()
    if (user?.major) {
      setStudentMajor(user.major)
    }
  }, [user?.major])

  const loadFollowedSyllabi = async () => {
    setLoading(true)
    try {
      // Get followed syllabuses from API
      const followedData = await getMyFollowedSyllabuses()
      console.log('[FollowedSyllabuses] Loaded from API:', followedData)
      setFollowedSyllabi(followedData)
    } catch (err) {
      console.error('Error loading followed syllabi:', err)
      setFollowedSyllabi([])
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (rootId) => {
    try {
      await unfollowSyllabus(rootId)
      // Remove from list
      const updated = followedSyllabi.filter(s => s.rootId !== rootId)
      setFollowedSyllabi(updated)
    } catch (err) {
      console.error('Error unfollowing syllabus:', err)
    }
  }

  const handleViewDetail = (rootId) => {
    navigate(`/public/syllabus/${rootId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-bounce" />
          <p className="text-gray-600 text-lg">Đang tải danh sách theo dõi...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50 to-white pb-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white shadow-lg">
        <div className="container mx-auto px-6 py-10">
          <button
            onClick={() => navigate('/student')}
            className="flex items-center gap-2 mb-6 text-blue-100 hover:text-white transition"
          >
            <ArrowLeft size={20} />
            Quay lại
          </button>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">📚 Giáo Trình Theo Dõi</h1>
              <p className="text-blue-100">Danh sách tất cả giáo trình bạn đang theo dõi</p>
            </div>
            <div className="bg-white/10 backdrop-blur px-5 py-3 rounded-xl border border-white/20">
              <p className="text-sm text-blue-100">Tổng số đang theo dõi</p>
              <p className="text-3xl font-bold text-white">{followedSyllabi.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        {followedSyllabi.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-md border border-slate-100">
            <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
              <Heart className="w-10 h-10 text-blue-400" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Chưa có giáo trình theo dõi</h2>
            <p className="text-gray-500 mb-6">Khám phá và theo dõi những giáo trình bạn quan tâm</p>
            <button
              onClick={() => navigate('/public/search')}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition font-medium"
            >
              Tìm Giáo Trình
            </button>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="mb-8">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Đang theo dõi</p>
                  <p className="text-3xl font-bold text-blue-600">{followedSyllabi.length}</p>
                  <p className="text-xs text-gray-400 mt-1">Cập nhật theo danh sách đã theo dõi</p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
                  <BookOpen className="w-7 h-7 text-blue-500" />
                </div>
              </div>
            </div>

            {/* Syllabi List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {followedSyllabi.map((syllabus) => {
                if (!syllabus) return null
                
                // Filter by student's major - only show if major matches or major is not set
                if (studentMajor && syllabus.programName && syllabus.programName !== studentMajor) {
                  return null
                }

                return (
                  <div
                    key={syllabus.rootId}
                    className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-200 overflow-hidden border border-slate-100 group"
                  >
                    {/* Card Header */}
                    <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 text-white p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="inline-block bg-blue-700 text-white px-3 py-1 rounded-full text-xs font-semibold">
                          {syllabus.subjectCode}
                        </span>
                        <button
                          onClick={() => handleRemove(syllabus.rootId)}
                          className="text-blue-100 hover:text-white transition p-1 rounded-md hover:bg-white/10"
                          title="Hủy theo dõi"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      <h3 className="text-lg font-bold text-white group-hover:text-blue-100 transition">
                        {syllabus.subjectName}
                      </h3>
                    </div>

                    {/* Card Body */}
                    <div className="p-4">
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {syllabus.summary || syllabus.content || 'Không có mô tả'}
                      </p>

                      {/* Info Grid */}
                      <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Trạng thái:</span>
                          <span className="font-semibold text-gray-900">{syllabus.status || 'N/A'}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Phiên bản:</span>
                          <span className="font-semibold text-gray-900">{syllabus.versionNo || '1'}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Tác giả:</span>
                          <span className="font-semibold text-gray-900">{syllabus.createdBy || 'N/A'}</span>
                        </div>
                        {syllabus.followedAt && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Theo dõi từ:</span>
                            <span className="font-semibold text-gray-900 text-right">
                              {new Date(syllabus.followedAt).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => handleViewDetail(syllabus.rootId)}
                        className="w-full bg-blue-600 text-white py-2.5 rounded-xl hover:bg-blue-700 transition font-medium flex items-center justify-center gap-2"
                      >
                        <BookMarked size={16} />
                        Xem Chi Tiết
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
