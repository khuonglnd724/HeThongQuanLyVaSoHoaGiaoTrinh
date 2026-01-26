import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, BookOpen, Calendar, User, Clock, FileText, Target, CheckSquare } from 'lucide-react'
import { publicService } from '../services'
import syllabusServiceV2 from '../modules/lecturer/services/syllabusServiceV2'

// CLO Details Display Component
const CLODetailsDisplay = ({ cloIds }) => {
  const [cloDetails, setCloDetails] = useState({})
  const [loading, setLoading] = useState(true)
  const [loadedIds, setLoadedIds] = useState([])

  useEffect(() => {
    // Check if we've already loaded these CLO IDs
    const idsString = cloIds ? cloIds.sort().join(',') : ''
    const loadedString = loadedIds.sort().join(',')
    
    if (idsString === loadedString && Object.keys(cloDetails).length > 0) {
      setLoading(false)
      return // Already loaded, skip
    }

    const fetchCLODetails = async () => {
      setLoading(true)
      const details = {}
      
      for (const id of (cloIds || [])) {
        try {
          const response = await syllabusServiceV2.getCLOById(id)
          // API returns { success, message, data: {...}, timestamp }
          const cloData = response.data?.data || response.data || response
          console.log(`CLO ${id} fetched:`, cloData)
          details[id] = cloData
        } catch (err) {
          console.error(`Failed to fetch CLO ${id}:`, err)
          details[id] = { id, cloCode: `CLO-${id}`, description: 'Không thể tải' }
        }
      }
      
      setCloDetails(details)
      setLoadedIds(cloIds || [])
      setLoading(false)
    }

    if (cloIds && cloIds.length > 0) {
      fetchCLODetails()
    } else {
      setLoading(false)
    }
  }, [cloIds, loadedIds, cloDetails])

  return (
    <div>
      <h4 className="font-semibold text-gray-900 mb-3">🎓 CLO liên kết ({cloIds?.length || 0})</h4>
      {loading ? (
        <div className="text-gray-600 text-sm py-2">
          Đang tải thông tin CLO...
        </div>
      ) : (
        <div className="space-y-2">
          {(cloIds || []).map((id) => {
            const clo = cloDetails[id]
            const cloCode = clo?.cloCode || clo?.name || `CLO-${id}`
            const description = clo?.description || ''
            
            return (
              <div key={id} className="bg-white border border-indigo-200 rounded-lg p-3 hover:shadow-md transition">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-indigo-900">
                      {cloCode}
                    </div>
                    {description && (
                      <div className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {description}
                      </div>
                    )}
                    {clo?.level && (
                      <div className="text-xs text-gray-500 mt-1">
                        Level: {clo.level}
                      </div>
                    )}
                  </div>
                  <span className="ml-2 bg-indigo-100 text-indigo-800 px-3 py-1 rounded text-xs font-medium whitespace-nowrap flex-shrink-0">
                    #{id}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

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
              <div className="text-gray-700">
                {(() => {
                  try {
                    const content = typeof syllabus.content === 'string' 
                      ? JSON.parse(syllabus.content) 
                      : syllabus.content
                    
                    // Nếu là object, render từng field
                    if (typeof content === 'object') {
                      return (
                        <div className="space-y-4">
                          {/* Metadata Section */}
                          {(content.subjectCode || content.academicYear || content.semester) && (
                            <div className="bg-gray-100 p-4 rounded border border-gray-300">
                              <h3 className="font-semibold text-gray-900 mb-2">📋 Thông tin</h3>
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                {content.subjectCode && <div><span className="text-gray-600">Mã môn:</span> <span className="font-medium">{content.subjectCode}</span></div>}
                                {content.syllabusCode && <div><span className="text-gray-600">Mã giáo trình:</span> <span className="font-medium">{content.syllabusCode}</span></div>}
                                {content.academicYear && <div><span className="text-gray-600">Năm học:</span> <span className="font-medium">{content.academicYear}</span></div>}
                                {content.semester && <div><span className="text-gray-600">Học kỳ:</span> <span className="font-medium">{content.semester}</span></div>}
                              </div>
                            </div>
                          )}

                          {/* Modules */}
                          {content.modules && content.modules.length > 0 && (
                            <div>
                              <h3 className="font-semibold text-gray-900 mb-2">📚 Các Module ({content.modules.length})</h3>
                              <ul className="space-y-2 ml-4">
                                {content.modules.map((mod, idx) => (
                                  <li key={idx} className="text-gray-700">
                                    <strong>{mod.title || mod.name || `Module ${idx + 1}`}</strong>
                                    {mod.description && <p className="text-sm text-gray-600 mt-1">{mod.description}</p>}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Learning Objectives */}
                          {content.learningObjectives && content.learningObjectives.trim() && (
                            <div>
                              <h3 className="font-semibold text-gray-900 mb-2">🎯 Mục Tiêu Học Tập</h3>
                              <p className="whitespace-pre-wrap">{content.learningObjectives}</p>
                            </div>
                          )}

                          {/* Teaching Methods */}
                          {content.teachingMethods && content.teachingMethods.trim() && (
                            <div>
                              <h3 className="font-semibold text-gray-900 mb-2">👨‍🏫 Phương Pháp Giảng Dạy</h3>
                              <p className="whitespace-pre-wrap">{content.teachingMethods}</p>
                            </div>
                          )}

                          {/* Assessment Methods */}
                          {content.assessmentMethods && content.assessmentMethods.trim() && (
                            <div>
                              <h3 className="font-semibold text-gray-900 mb-2">📝 Phương Pháp Đánh Giá</h3>
                              <p className="whitespace-pre-wrap">{content.assessmentMethods}</p>
                            </div>
                          )}

                          {/* CLO Pair IDs */}
                          {content.cloPairIds && content.cloPairIds.length > 0 && (
                            <CLODetailsDisplay cloIds={content.cloPairIds} />
                          )}

                          {/* Empty state */}
                          {(!content.modules || content.modules.length === 0) &&
                           (!content.learningObjectives || !content.learningObjectives.trim()) &&
                           (!content.teachingMethods || !content.teachingMethods.trim()) &&
                           (!content.assessmentMethods || !content.assessmentMethods.trim()) &&
                           (!content.cloPairIds || content.cloPairIds.length === 0) && (
                            <div className="text-gray-500 italic text-center py-8">
                              ℹ️ Chưa có nội dung chi tiết. Hãy thêm modules, mục tiêu, phương pháp giảng dạy và đánh giá.
                            </div>
                          )}
                        </div>
                      )
                    } else {
                      // Nếu là string, hiển thị thô
                      return <div className="whitespace-pre-line">{content}</div>
                    }
                  } catch (err) {
                    // Nếu parse lỗi, hiển thị thô
                    return (
                      <div>
                        <p className="text-red-600 text-xs mb-2">⚠️ Không thể parse JSON</p>
                        <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto max-h-48">
                          {syllabus.content}
                        </pre>
                      </div>
                    )
                  }
                })()}
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
