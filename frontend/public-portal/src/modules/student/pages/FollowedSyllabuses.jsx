import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, BookOpen, Heart, Trash2, Clock, GraduationCap, BookMarked } from 'lucide-react'
import syllabusService from '../../../services/syllabusService'

export default function FollowedSyllabuses({ user }) {
  const navigate = useNavigate()
  const [followedSyllabi, setFollowedSyllabi] = useState([])
  const [loading, setLoading] = useState(true)
  const [syllabusDetails, setSyllabusDetails] = useState({})
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
      // Get followed IDs from localStorage
      const followed = JSON.parse(localStorage.getItem('followedSyllabuses') || '[]')
      setFollowedSyllabi(followed)

      // Load details for each followed syllabus
      const details = {}
      for (const id of followed) {
        try {
          // Use academic-service API so we get programName for filtering
          const data = await syllabusService.getSyllabusById(id)
          details[id] = data
        } catch (err) {
          console.warn('Could not load details for', id)
        }
      }
      setSyllabusDetails(details)
    } catch (err) {
      console.error('Error loading followed syllabi:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = (id) => {
    const updated = followedSyllabi.filter(sid => sid !== id)
    setFollowedSyllabi(updated)
    localStorage.setItem('followedSyllabuses', JSON.stringify(updated))

    // Remove from details
    const newDetails = { ...syllabusDetails }
    delete newDetails[id]
    setSyllabusDetails(newDetails)
  }

  const handleViewDetail = (id) => {
    navigate(`/public/syllabus/${id}`)
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
        <div className="container mx-auto px-6 py-8">
          <button
            onClick={() => navigate('/student')}
            className="flex items-center gap-2 mb-6 text-blue-100 hover:text-white transition"
          >
            <ArrowLeft size={20} />
            Quay lại
          </button>
          <h1 className="text-4xl font-bold mb-2">📚 Giáo Trình Theo Dõi</h1>
          <p className="text-blue-100">Danh sách tất cả giáo trình bạn đang theo dõi</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        {followedSyllabi.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-md">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">Chưa có giáo trình theo dõi</h2>
            <p className="text-gray-500 mb-6">Hãy khám phá và theo dõi những giáo trình mà bạn quan tâm</p>
            <button
              onClick={() => navigate('/public/search')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Tìm Giáo Trình
            </button>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Đang theo dõi</p>
                    <p className="text-3xl font-bold text-blue-600">{followedSyllabi.length}</p>
                  </div>
                  <BookOpen className="w-12 h-12 text-blue-200" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Đã hoàn thành</p>
                    <p className="text-3xl font-bold text-purple-600">0</p>
                  </div>
                  <GraduationCap className="w-12 h-12 text-purple-200" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Gần đây xem</p>
                    <p className="text-3xl font-bold text-orange-600">
                      {JSON.parse(localStorage.getItem('recentlySyllabuses') || '[]').length}
                    </p>
                  </div>
                  <Clock className="w-12 h-12 text-orange-200" />
                </div>
              </div>
            </div>

            {/* Syllabi List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {followedSyllabi.map((id) => {
                const syllabus = syllabusDetails[id]
                if (!syllabus) return null
                
                // Filter by student's major - only show if major matches or major is not set
                if (studentMajor && syllabus.programName && syllabus.programName !== studentMajor) {
                  return null
                }

                return (
                  <div
                    key={id}
                    className="bg-white rounded-lg shadow-md hover:shadow-xl transition overflow-hidden border-l-4 border-blue-500 group"
                  >
                    {/* Card Header */}
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="inline-block bg-blue-700 text-white px-3 py-1 rounded-full text-xs font-semibold">
                          {syllabus.subjectCode}
                        </span>
                        <button
                          onClick={() => handleRemove(id)}
                          className="text-blue-100 hover:text-white transition p-1"
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
                        {syllabus.content || 'Không có mô tả'}
                      </p>

                      {/* Info Grid */}
                      <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Kỳ:</span>
                          <span className="font-semibold text-gray-900">{syllabus.semester}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Năm học:</span>
                          <span className="font-semibold text-gray-900">{syllabus.academicYear}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Mã:</span>
                          <span className="font-semibold text-gray-900">{syllabus.syllabusCode}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Ngành:</span>
                          <span className="font-semibold text-gray-900 text-right">{syllabus.programName}</span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => handleViewDetail(id)}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium flex items-center justify-center gap-2"
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
