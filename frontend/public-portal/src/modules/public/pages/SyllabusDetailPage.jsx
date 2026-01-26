import React, { useState } from 'react'
import { ArrowLeft, Loader } from 'lucide-react'
import AISummary from '../../lecturer/components/AISummary'
import SubjectTree from '../components/SubjectTree'
import CLOPLOMap from '../../lecturer/components/CLOPLOMap'
import DiffViewer from '../../lecturer/components/DiffViewer'
import FollowButton from '../../student/components/FollowButton'
import FeedbackForm from '../../student/components/FeedbackForm'
import { useSyllabusDetail, useSyllabusTree, useSyllabusDiff } from '../../../shared/hooks/useApi'

export const SyllabusDetailPage = ({ syllabusId, onBack }) => {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedVersion, setSelectedVersion] = useState(null)

  const { syllabus, loading: detailLoading, error: detailError } = useSyllabusDetail(syllabusId)
  const { tree, loading: treeLoading } = useSyllabusTree(syllabusId)
  const { diff, loading: diffLoading, fetchDiff } = useSyllabusDiff(syllabusId, selectedVersion)

  React.useEffect(() => {
    if (selectedVersion) {
      fetchDiff()
    }
  }, [selectedVersion])

  if (detailLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="animate-spin h-12 w-12 text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải thông tin giáo trình...</p>
        </div>
      </div>
    )
  }

  if (detailError) {
    return (
      <div className="min-h-screen bg-danger-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-danger-600 mb-4">{detailError}</p>
          <button onClick={onBack} className="btn btn-primary">
            ← Quay lại
          </button>
        </div>
      </div>
    )
  }

  if (!syllabus) {
    return null
  }

  const tabs = [
    { id: 'overview', label: '📋 Tổng quan' },
    { id: 'tree', label: '🌳 Sơ đồ Môn học' },
    { id: 'clo-plo', label: '🎯 CLO-PLO' },
    { id: 'diff', label: '📊 So sánh' },
    { id: 'feedback', label: '💬 Phản hồi' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container-custom py-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-4"
          >
            <ArrowLeft size={20} />
            Quay lại
          </button>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {syllabus.subjectName}
          </h1>
          <p className="text-gray-600">
            Mã môn: <span className="font-mono font-semibold">{syllabus.subjectCode}</span>
            {' • '}
            <span className="badge badge-primary">{syllabus.credits} Tín chỉ</span>
            {' • '}
            <span className="badge badge-secondary">Học kỳ {syllabus.semester}</span>
          </p>

          <div className="mt-6">
            <FollowButton syllabusId={syllabusId} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container-custom">
          <div className="flex overflow-x-auto gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 font-medium transition-colors border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container-custom py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* AI Summary */}
            <AISummary syllabus={syllabus} loading={detailLoading} />

            {/* Course Info */}
            <div className="card p-6 space-y-6">
              <h2 className="text-xl font-semibold">Thông tin Môn học</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Mô tả môn học</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {syllabus.description || 'Không có mô tả'}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Điều kiện tiên quyết</h3>
                  <p className="text-gray-600">
                    {syllabus.prerequisites || 'Không có tiên quyết'}
                  </p>
                </div>
              </div>

              {/* Learning Objectives */}
              {syllabus.learningObjectives?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Mục tiêu Học tập</h3>
                  <ul className="space-y-2">
                    {syllabus.learningObjectives.map((obj, idx) => (
                      <li key={idx} className="flex gap-3 text-gray-700">
                        <span className="text-primary-600 font-bold flex-shrink-0">✓</span>
                        {obj}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Teaching Methods */}
              {syllabus.teachingMethods?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Phương pháp Giảng dạy</h3>
                  <div className="flex flex-wrap gap-2">
                    {syllabus.teachingMethods.map((method, idx) => (
                      <span key={idx} className="badge badge-secondary">
                        {method}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Assessment Methods */}
              {syllabus.assessmentMethods?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Phương pháp Đánh giá</h3>
                  <div className="space-y-2">
                    {syllabus.assessmentMethods.map((method, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span>{method.name}</span>
                        <span className="font-semibold text-primary-600">{method.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tree Tab */}
        {activeTab === 'tree' && (
          <SubjectTree tree={tree} loading={treeLoading} />
        )}

        {/* CLO-PLO Tab */}
        {activeTab === 'clo-plo' && (
          <CLOPLOMap syllabus={syllabus} loading={detailLoading} />
        )}

        {/* Diff Tab */}
        {activeTab === 'diff' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chọn phiên bản để so sánh
              </label>
              <select
                value={selectedVersion || ''}
                onChange={(e) => setSelectedVersion(e.target.value || null)}
                className="input-base"
              >
                <option value="">-- Chọn phiên bản --</option>
                {syllabus.versions?.map((v) => (
                  <option key={v.id} value={v.id}>
                    v{v.version} - {new Date(v.createdAt).toLocaleDateString('vi-VN')}
                  </option>
                ))}
              </select>
            </div>

            {selectedVersion && (
              <DiffViewer diff={diff} loading={diffLoading} />
            )}
          </div>
        )}

        {/* Feedback Tab */}
        {activeTab === 'feedback' && (
          <FeedbackForm syllabusId={syllabusId} />
        )}
      </div>
    </div>
  )
}

export default SyllabusDetailPage
