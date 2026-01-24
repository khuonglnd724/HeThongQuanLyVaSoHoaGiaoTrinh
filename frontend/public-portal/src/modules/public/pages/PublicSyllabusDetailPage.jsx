import React, { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import AISummaryBox from '../components/AISummaryBox'
import CLOPLOMappingView from '../components/CLOPLOMappingView'
import RelationshipTree from '../components/RelationshipTree'
import SubscribeButton from '../components/SubscribeButton'
import PDFExportButton from '../components/PDFExportButton'
import FeedbackForm from '../components/FeedbackForm'
import {
  getSyllabusDetail,
  getCLOPLOMapping,
  getAISummary,
  getSubjectRelationships,
  subscribeSyllabus,
  unsubscribeSyllabus,
  submitFeedback
} from '../services/publicSyllabusService'

export default function PublicSyllabusDetailPage() {
  const { id } = useParams()
  const [syllabus, setSyllabus] = useState(null)
  const [aiSummary, setAiSummary] = useState(null)
  const [cloploMapping, setCloploMapping] = useState(null)
  const [relationships, setRelationships] = useState(null)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')

  const loadSyllabusDetail = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [syllabusData, mapping, summary, rels] = await Promise.all([
        getSyllabusDetail(id),
        getCLOPLOMapping(id),
        getAISummary(id),
        getSubjectRelationships(id)
      ])

      setSyllabus(syllabusData)
      setCloploMapping(mapping)
      setAiSummary(summary?.summary)
      setRelationships(rels)
    } catch (err) {
      setError('Không thể tải chi tiết syllabus. Vui lòng thử lại.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadSyllabusDetail()
  }, [loadSyllabusDetail])

  const handleSubscribe = async () => {
    try {
      await subscribeSyllabus(id)
      setIsSubscribed(true)
    } catch (err) {
      alert('Lỗi: ' + err.message)
    }
  }

  const handleUnsubscribe = async () => {
    try {
      await unsubscribeSyllabus(id)
      setIsSubscribed(false)
    } catch (err) {
      alert('Lỗi: ' + err.message)
    }
  }

  const handleSubmitFeedback = async (feedback) => {
    await submitFeedback(feedback)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    )
  }

  if (error || !syllabus) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="text-xl font-semibold mb-2">⚠️ Lỗi</p>
          <p>{error || 'Không tìm thấy syllabus'}</p>
          <a href="/search" className="mt-4 inline-block text-blue-600 hover:underline">
            ← Quay lại tìm kiếm
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
        <div className="container mx-auto px-6">
          <h1 className="text-3xl font-bold mb-2">{syllabus.subjectCode}: {syllabus.subjectName}</h1>
          <p className="text-blue-100">Giảng viên: {syllabus.instructor || 'N/A'}</p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex gap-4 items-center justify-end">
          <SubscribeButton
            syllabusId={id}
            isSubscribed={isSubscribed}
            onSubscribe={handleSubscribe}
            onUnsubscribe={handleUnsubscribe}
          />
          <PDFExportButton syllabusId={id} syllabusTitle={syllabus.subjectName} />
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6">
          <div className="flex gap-8">
            {[
              { id: 'overview', label: '📋 Tổng quan' },
              { id: 'cloplo', label: '🎯 CLO-PLO Mapping' },
              { id: 'relationships', label: '🔗 Quan hệ môn học' },
              { id: 'feedback', label: '💬 Phản hồi' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 font-medium border-b-2 transition ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
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
      <div className="container mx-auto px-6 py-12">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
                <div className="text-sm text-gray-600">Tín chỉ</div>
                <div className="text-3xl font-bold text-blue-600">{syllabus.credits || 3}</div>
              </div>
              <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
                <div className="text-sm text-gray-600">Học kì</div>
                <div className="text-3xl font-bold text-green-600">Kì {syllabus.semester || 1}</div>
              </div>
              <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
                <div className="text-sm text-gray-600">Trạng thái</div>
                <div className="text-2xl font-bold text-green-600">✓ Đã xuất bản</div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-lg border-2 border-gray-200">
              <p className="text-gray-700 leading-relaxed">{syllabus.description}</p>
            </div>

            {aiSummary && (
              <AISummaryBox summary={aiSummary} loading={false} />
            )}

            <div className="bg-white p-8 rounded-lg border-2 border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Nội dung chi tiết</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700">{syllabus.content || 'Chưa có nội dung chi tiết'}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'cloplo' && (
          <CLOPLOMappingView mapping={cloploMapping} />
        )}

        {activeTab === 'relationships' && (
          <RelationshipTree relationships={relationships} />
        )}

        {activeTab === 'feedback' && (
          <FeedbackForm syllabusId={id} onSubmit={handleSubmitFeedback} />
        )}
      </div>
    </div>
  )
}
