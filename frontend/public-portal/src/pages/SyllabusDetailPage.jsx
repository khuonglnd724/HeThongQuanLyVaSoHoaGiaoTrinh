import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, BookOpen, Calendar, User, Clock, FileText, Target, CheckSquare } from 'lucide-react'
import { publicService } from '../services'

const SyllabusDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [syllabus, setSyllabus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const doFetch = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await publicService.getSyllabusDetails(id)
        setSyllabus(data)
      } catch (err) {
        console.error('Fetch syllabus error:', err)
        setError(err.message || 'Không thể tải thông tin giáo trình')
      } finally {
        setLoading(false)
      }
    }
    doFetch()
  }, [id])

  const handleBack = () => {
    navigate('/search')
  }

  if (loading) {
    return (
      <div className="container-custom py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Đang tải thông tin giáo trình...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container-custom py-12">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
          <h3 className="font-semibold mb-2">Lỗi</h3>
          <p>{error}</p>
          <button onClick={handleBack} className="mt-4 text-red-600 underline">
            Quay lại tìm kiếm
          </button>
        </div>
      </div>
    )
  }

  if (!syllabus) {
    return (
      <div className="container-custom py-12 text-center">
        <p className="text-gray-600">Không tìm thấy giáo trình</p>
        <button onClick={handleBack} className="mt-4 text-primary-600 underline">
          Quay lại tìm kiếm
        </button>
      </div>
    )
  }

  return (
    <div className="container-custom py-8">
      {/* Back Button */}
      <button
        onClick={handleBack}
        className="flex items-center gap-2 text-gray-600 hover:text-primary-600 mb-6 transition"
      >
        <ArrowLeft size={20} />
        Quay lại tìm kiếm
      </button>

      {/* Header */}
      <div className="card p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <BookOpen size={32} className="text-primary-600" />
              {syllabus.subject?.subjectName || syllabus.syllabusCode}
            </h1>
            <div className="flex flex-wrap gap-4 text-gray-600">
              <span className="flex items-center gap-1">
                <FileText size={18} />
                Mã: {syllabus.subject?.subjectCode || syllabus.syllabusCode}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={18} />
                Năm học: {syllabus.academicYear} - HK{syllabus.semester}
              </span>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                v{syllabus.version}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm ${
                syllabus.status === 'APPROVED' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {syllabus.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Learning Objectives */}
          {syllabus.learningObjectives && (
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Target size={24} className="text-primary-600" />
                Mục Tiêu Học Tập
              </h2>
              <div className="prose max-w-none text-gray-700 whitespace-pre-line">
                {syllabus.learningObjectives}
              </div>
            </div>
          )}

          {/* Content */}
          {syllabus.content && (
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FileText size={24} className="text-primary-600" />
                Nội Dung Giáo Trình
              </h2>
              <div className="prose max-w-none text-gray-700 whitespace-pre-line">
                {syllabus.content}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Teaching Methods */}
          {syllabus.teachingMethods && (
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <User size={20} className="text-primary-600" />
                Phương Pháp Giảng Dạy
              </h3>
              <p className="text-gray-700">{syllabus.teachingMethods}</p>
            </div>
          )}

          {/* Assessment Methods */}
          {syllabus.assessmentMethods && (
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <CheckSquare size={20} className="text-primary-600" />
                Phương Pháp Đánh Giá
              </h3>
              <p className="text-gray-700">{syllabus.assessmentMethods}</p>
            </div>
          )}

          {/* Subject Info */}
          {syllabus.subject && (
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-3">Thông Tin Môn Học</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Số tín chỉ:</dt>
                  <dd className="font-medium">{syllabus.subject.credits}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Loại môn:</dt>
                  <dd className="font-medium">{syllabus.subject.subjectType || 'N/A'}</dd>
                </div>
              </dl>
            </div>
          )}

          {/* Last Updated */}
          {syllabus.updatedAt && (
            <div className="card p-6 bg-gray-50">
              <div className="flex items-center gap-2 text-gray-600">
                <Clock size={18} />
                <span className="text-sm">
                  Cập nhật: {new Date(syllabus.updatedAt).toLocaleDateString('vi-VN')}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SyllabusDetailPage
