import React, { useState, useEffect } from 'react'
import { Eye, Zap, Loader, CheckCircle } from 'lucide-react'
import syllabusServiceV2 from '../../modules/lecturer/services/syllabusServiceV2'
import apiClient from '../../services/api/apiClient'
import DocumentSummaryModal from '../../modules/lecturer/components/DocumentSummaryModal'

// CLO Details Display Component
const CLODetailsDisplay = ({ cloIds }) => {
  const [cloDetails, setCloDetails] = useState({})
  const [loading, setLoading] = useState(true)
  const [loadedIds, setLoadedIds] = useState([])

  useEffect(() => {
    const idsString = cloIds ? cloIds.sort().join(',') : ''
    const loadedString = loadedIds.sort().join(',')
    
    if (idsString === loadedString && Object.keys(cloDetails).length > 0) {
      setLoading(false)
      return
    }

    const fetchCLODetails = async () => {
      setLoading(true)
      const details = {}
      
      for (const id of (cloIds || [])) {
        try {
          const response = await syllabusServiceV2.getCLOById(id)
          const cloData = response.data?.data || response.data || response
          
          let mappedPlos = []
          try {
            const mappingRes = await apiClient.get(`/api/v1/mapping/clo/${id}`)
            const mappings = mappingRes.data?.data || []
            const ploIds = mappings.map(m => m.ploId || m.plo_id).filter(Boolean)
            
            mappedPlos = await Promise.all(
              ploIds.map(ploId => 
                apiClient.get(`/api/v1/plo/${ploId}`)
                  .then(r => r.data?.data || r.data)
                  .catch(() => null)
              )
            )
            mappedPlos = mappedPlos.filter(Boolean)
          } catch (mappingErr) {
            console.warn(`Failed to fetch PLO mappings for CLO ${id}:`, mappingErr)
          }
          
          details[id] = { ...cloData, mappedPlos }
        } catch (err) {
          console.error(`Failed to fetch CLO ${id}:`, err)
          details[id] = { id, cloCode: `CLO-${id}`, description: 'Không thể tải', mappedPlos: [] }
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
      <h4 className="font-semibold text-gray-900 mb-3">CLO liên kết ({cloIds?.length || 0})</h4>
      {loading ? (
        <div className="text-gray-600 text-sm py-2">
          Đang tải thông tin CLO...
        </div>
      ) : (
        <div className="space-y-3">
          {(cloIds || []).map((id) => {
            const clo = cloDetails[id]
            const cloCode = clo?.cloCode || clo?.name || `CLO-${id}`
            const description = clo?.description || ''
            const mappedPlos = clo?.mappedPlos || []
            
            return (
              <div key={id} className="bg-white border border-indigo-200 rounded-lg p-4 hover:shadow-md transition">
                <div className="flex items-start justify-between gap-3 mb-2">
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
                
                {mappedPlos && mappedPlos.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-indigo-100">
                    <p className="text-xs font-medium text-gray-700 mb-2">PLO liên kết:</p>
                    <div className="space-y-2">
                      {mappedPlos.map((plo, idx) => (
                        <div
                          key={idx}
                          className="text-xs bg-purple-50 border border-purple-200 rounded p-2"
                        >
                          <p className="font-medium text-purple-700">
                            {plo.ploCode || plo.code || 'PLO'}
                          </p>
                          <p className="text-purple-600 mt-0.5">
                            {plo.description || plo.ploName || 'Không có mô tả'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

const SyllabusDetailModal = ({
  isOpen,
  onClose,
  syllabusDetailData,
  syllabusDetailLoading,
  syllabusDetailDocuments,
  syllabusDetailDocumentsLoading,
  documentSummaries,
  documentSummarizingId,
  cloCheckLoading,
  cloCheckHistory,
  handleViewSyllabusDetail,
  handleCheckCLOPLOConsistency,
  handleViewCLOCheckHistory,
  handleClearCLOCheckHistory,
  handleViewDocument,
  generateDocumentSummary,
  setShowDocumentSummaryModal,
  setSelectedDocumentForSummary,
  showToast,
}) => {
  const [showDocumentSummaryModal, setLocalShowDocumentSummaryModal] = useState(false)
  const [selectedDocumentForSummary, setLocalSelectedDocumentForSummary] = useState(null)

  const handleClose = () => {
    setLocalShowDocumentSummaryModal(false)
    setLocalSelectedDocumentForSummary(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-8 py-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Chi tiết giáo trình</h2>
          <button 
            onClick={handleClose} 
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>
        
        <div className="p-8 space-y-6">
          {syllabusDetailLoading ? (
            <div className="text-center py-8 text-gray-600">
              Đang tải thông tin giáo trình...
            </div>
          ) : syllabusDetailData ? (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin cơ bản</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Mã môn học:</span>
                    <div className="font-semibold text-gray-900">{syllabusDetailData.subjectCode}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Tên môn học:</span>
                    <div className="font-semibold text-gray-900">{syllabusDetailData.subjectName}</div>
                  </div>
                  {(syllabusDetailData.programInfo || syllabusDetailData.programName) && (
                    <div className="col-span-2">
                      <span className="text-sm text-gray-600">Chương trình đào tạo:</span>
                      <div className="font-semibold text-gray-900">
                        {syllabusDetailData.programInfo
                          ? `${syllabusDetailData.programInfo.programCode} - ${syllabusDetailData.programInfo.programName}`
                          : syllabusDetailData.programName}
                      </div>
                    </div>
                  )}
                  {syllabusDetailData.subjectInfo && (
                    <>
                      <div>
                        <span className="text-sm text-gray-600">Số tín chỉ:</span>
                        <div className="font-semibold text-gray-900">{syllabusDetailData.subjectInfo.credits || '-'}</div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Học kỳ:</span>
                        <div className="font-semibold text-gray-900">{syllabusDetailData.subjectInfo.semester || '-'}</div>
                      </div>
                    </>
                  )}
                  <div>
                    <span className="text-sm text-gray-600">Trạng thái:</span>
                    <div className="font-semibold">
                      <span className={`px-2 py-1 rounded text-xs ${
                        syllabusDetailData.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        syllabusDetailData.status === 'PENDING_REVIEW' ? 'bg-yellow-100 text-yellow-800' :
                        syllabusDetailData.status === 'PENDING_APPROVAL' ? 'bg-blue-100 text-blue-800' :
                        syllabusDetailData.status === 'DRAFT' ? 'bg-gray-100 text-gray-800' :
                        syllabusDetailData.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {syllabusDetailData.status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Phiên bản:</span>
                    <div className="font-semibold text-gray-900">v{syllabusDetailData.versionNo || 1}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Người tạo:</span>
                    <div className="font-semibold text-gray-900">{syllabusDetailData.createdBy}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Ngày tạo:</span>
                    <div className="font-semibold text-gray-900">
                      {syllabusDetailData.createdAt ? new Date(syllabusDetailData.createdAt).toLocaleString('vi-VN') : '-'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Workflow Timeline */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Lịch sử workflow</h3>
                <div className="space-y-3">
                  {syllabusDetailData.submittedAt && (
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <div>
                        <span className="text-sm font-medium text-gray-900">Đã nộp:</span>
                        <span className="text-sm text-gray-600 ml-2">
                          {new Date(syllabusDetailData.submittedAt).toLocaleString('vi-VN')}
                        </span>
                      </div>
                    </div>
                  )}
                  {syllabusDetailData.reviewedAt && (
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                      <div>
                        <span className="text-sm font-medium text-gray-900">Đã duyệt bởi HoD:</span>
                        <span className="text-sm text-gray-600 ml-2">
                          {new Date(syllabusDetailData.reviewedAt).toLocaleString('vi-VN')}
                        </span>
                      </div>
                    </div>
                  )}
                  {syllabusDetailData.approvedAt && (
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <div>
                        <span className="text-sm font-medium text-gray-900">Đã phê duyệt:</span>
                        <span className="text-sm text-gray-600 ml-2">
                          {new Date(syllabusDetailData.approvedAt).toLocaleString('vi-VN')}
                        </span>
                      </div>
                    </div>
                  )}
                  {syllabusDetailData.rejectedAt && (
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div>
                        <span className="text-sm font-medium text-gray-900">Bị từ chối:</span>
                        <span className="text-sm text-gray-600 ml-2">
                          {new Date(syllabusDetailData.rejectedAt).toLocaleString('vi-VN')}
                        </span>
                        {syllabusDetailData.rejectionReason && (
                          <div className="text-sm text-red-600 mt-1">Lý do: {syllabusDetailData.rejectionReason}</div>
                        )}
                      </div>
                    </div>
                  )}
                  {syllabusDetailData.publishedAt && (
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      <div>
                        <span className="text-sm font-medium text-gray-900">Đã công bố:</span>
                        <span className="text-sm text-gray-600 ml-2">
                          {new Date(syllabusDetailData.publishedAt).toLocaleString('vi-VN')}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Summary */}
              {syllabusDetailData.summary && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Tóm tắt</h3>
                  <p className="text-gray-700">{syllabusDetailData.summary}</p>
                </div>
              )}

              {/* Content Preview */}
              {syllabusDetailData.content && syllabusDetailData.content !== '{}' && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Nội dung giáo trình</h3>
                  <div className="text-sm text-gray-700">
                    {(() => {
                      try {
                        const content = typeof syllabusDetailData.content === 'string' 
                          ? JSON.parse(syllabusDetailData.content) 
                          : syllabusDetailData.content
                        
                        if (typeof content === 'object') {
                          return (
                            <div className="space-y-4">
                              {(content.subjectCode || content.academicYear || content.semester) && (
                                <div className="bg-white p-3 rounded border border-gray-200">
                                  <h4 className="font-semibold text-gray-900 mb-2">Thông tin</h4>
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    {content.subjectCode && <div><span className="text-gray-600">Mã môn:</span> <span className="font-medium">{content.subjectCode}</span></div>}
                                    {content.syllabusCode && <div><span className="text-gray-600">Mã giáo trình:</span> <span className="font-medium">{content.syllabusCode}</span></div>}
                                    {content.academicYear && <div><span className="text-gray-600">Năm học:</span> <span className="font-medium">{content.academicYear}</span></div>}
                                    {content.semester && <div><span className="text-gray-600">Học kỳ:</span> <span className="font-medium">{content.semester}</span></div>}
                                  </div>
                                </div>
                              )}

                              {content.modules && content.modules.length > 0 && (
                                <div>
                                  <h4 className="font-semibold text-gray-900 mb-2">Các module ({content.modules.length})</h4>
                                  <ul className="space-y-1 ml-4">
                                    {content.modules.map((mod, idx) => (
                                      <li key={idx} className="text-gray-700">
                                        • {mod.title || mod.name || `Module ${idx + 1}`}
                                        {mod.description && ` - ${mod.description}`}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {content.learningObjectives && content.learningObjectives.trim() && (
                                <div>
                                  <h4 className="font-semibold text-gray-900 mb-2">Mục tiêu học tập</h4>
                                  <p className="text-gray-700 whitespace-pre-wrap">{content.learningObjectives}</p>
                                </div>
                              )}

                              {content.teachingMethods && content.teachingMethods.trim() && (
                                <div>
                                  <h4 className="font-semibold text-gray-900 mb-2">Phương pháp giảng dạy</h4>
                                  <p className="text-gray-700 whitespace-pre-wrap">{content.teachingMethods}</p>
                                </div>
                              )}

                              {content.assessmentMethods && content.assessmentMethods.trim() && (
                                <div>
                                  <h4 className="font-semibold text-gray-900 mb-2">Phương pháp đánh giá</h4>
                                  <p className="text-gray-700 whitespace-pre-wrap">{content.assessmentMethods}</p>
                                </div>
                              )}

                              {content.cloPairIds && content.cloPairIds.length > 0 && (
                                <CLODetailsDisplay cloIds={content.cloPairIds} />
                              )}

                              {(!content.modules || content.modules.length === 0) &&
                               (!content.learningObjectives || !content.learningObjectives.trim()) &&
                               (!content.teachingMethods || !content.teachingMethods.trim()) &&
                               (!content.assessmentMethods || !content.assessmentMethods.trim()) &&
                               (!content.cloPairIds || content.cloPairIds.length === 0) && (
                                <div className="text-gray-500 italic">
                                  Chưa có nội dung chi tiết. Hãy thêm modules, mục tiêu, phương pháp giảng dạy và đánh giá.
                                </div>
                              )}
                            </div>
                          )
                        } else {
                          return <pre className="whitespace-pre-wrap overflow-x-auto">{content}</pre>
                        }
                      } catch (err) {
                        return (
                          <div>
                            <p className="text-red-600 text-xs mb-2">⚠️ Không thể parse JSON, hiển thị thô:</p>
                            <pre className="bg-white p-3 rounded border border-gray-300 text-xs overflow-x-auto max-h-48">
                              {syllabusDetailData.content}
                            </pre>
                          </div>
                        )
                      }
                    })()}
                  </div>
                </div>
              )}

              {/* Documents Section */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tệp bài giảng ({syllabusDetailDocuments.length})</h3>
                {syllabusDetailDocumentsLoading ? (
                  <div className="text-center py-4 text-gray-600">
                    <p className="text-sm">Đang tải tệp...</p>
                  </div>
                ) : syllabusDetailDocuments.length > 0 ? (
                  <div className="space-y-3">
                    {syllabusDetailDocuments.map((doc) => (
                      <div key={doc.id} className="bg-white p-4 rounded border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{doc.originalName || doc.title || doc.fileName || 'Unnamed Document'}</p>
                            {doc.description && (
                              <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
                            )}
                            <div className="flex gap-4 mt-2 text-xs text-gray-600">
                              {doc.fileSize && (
                                <span>Kích thước: {(doc.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                              )}
                              {doc.uploadedAt && (
                                <span>Ngày tải: {new Date(doc.uploadedAt).toLocaleString('vi-VN')}</span>
                              )}
                              {doc.uploadedBy && (
                                <span>Người tải: {doc.uploadedBy}</span>
                              )}
                            </div>

                            {documentSummaries[doc.id] && (
                              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded text-sm space-y-2">
                                <div>
                                  <p className="font-semibold text-blue-900 mb-1">Tóm tắt:</p>
                                  <p className="text-blue-800">{documentSummaries[doc.id].summary}</p>
                                </div>

                                {documentSummaries[doc.id].bullets && documentSummaries[doc.id].bullets.length > 0 && (
                                  <div>
                                    <p className="font-semibold text-blue-900 mb-1">Nội dung chính:</p>
                                    <ul className="list-disc list-inside text-blue-800 space-y-1">
                                      {documentSummaries[doc.id].bullets.map((bullet, idx) => (
                                        <li key={idx} className="text-xs">
                                          {bullet}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {documentSummaries[doc.id].keywords && documentSummaries[doc.id].keywords.length > 0 && (
                                  <div>
                                    <p className="font-semibold text-blue-900 mb-1">Từ khoá:</p>
                                    <div className="flex flex-wrap gap-1">
                                      {documentSummaries[doc.id].keywords.map((kw, idx) => (
                                        <span
                                          key={idx}
                                          className="inline-block px-2 py-1 bg-blue-200 text-blue-900 text-xs rounded"
                                        >
                                          {kw}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {documentSummaries[doc.id].targetAudience && (
                                  <div>
                                    <p className="font-semibold text-blue-900 mb-1">Đối tượng học:</p>
                                    <p className="text-blue-800 text-xs">{documentSummaries[doc.id].targetAudience}</p>
                                  </div>
                                )}

                                {documentSummaries[doc.id].prerequisites && (
                                  <div>
                                    <p className="font-semibold text-blue-900 mb-1">Điều kiện tiên quyết:</p>
                                    <p className="text-blue-800 text-xs">{documentSummaries[doc.id].prerequisites}</p>
                                  </div>
                                )}

                                {documentSummaries[doc.id].ragUsed && (
                                  <div className="bg-purple-100 p-2 rounded">
                                    <p className="font-semibold text-purple-900 mb-1">RAG Context:</p>
                                    <p className="text-purple-800 text-xs whitespace-pre-wrap">{documentSummaries[doc.id].ragContext}</p>
                                  </div>
                                )}

                                {documentSummaries[doc.id].model && (
                                  <p className="text-xs text-blue-600 italic border-t border-blue-200 pt-2">
                                    Model: {documentSummaries[doc.id].model} | Tokens: {documentSummaries[doc.id].tokens}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2 flex-shrink-0 flex-col">
                            <button
                              onClick={() => handleViewDocument(doc.id)}
                              title="Xem trực tiếp"
                              className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs font-medium flex items-center gap-1 whitespace-nowrap"
                            >
                              <Eye size={14} />
                              Xem
                            </button>
                            {doc.aiIngestionJobId && (
                              <button
                                onClick={() => {
                                  setLocalSelectedDocumentForSummary(doc)
                                  setLocalShowDocumentSummaryModal(true)
                                }}
                                title="Xem tóm tắt tài liệu"
                                className="px-3 py-1.5 bg-purple-600 text-white rounded hover:bg-purple-700 text-xs font-medium flex items-center gap-1 whitespace-nowrap"
                              >
                                <Zap size={14} />
                                Xem tóm tắt
                              </button>
                            )}
                            <button
                              onClick={() => generateDocumentSummary(doc.id, doc.fileName)}
                              disabled={documentSummarizingId === doc.id}
                              title="Tóm tắt tài liệu bằng AI"
                              className="px-3 py-1.5 bg-amber-600 text-white rounded hover:bg-amber-700 text-xs font-medium flex items-center gap-1 whitespace-nowrap disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                              {documentSummarizingId === doc.id ? (
                                <Loader size={14} className="animate-spin" />
                              ) : (
                                <Zap size={14} />
                              )}
                              {documentSummarizingId === doc.id ? 'Đang...' : 'Tóm tắt'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <p className="text-sm italic">Chưa có tệp bài giảng nào được tải lên</p>
                  </div>
                )}
              </div>

              {/* Additional Info */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin khác</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Workflow ID:</span>
                    <div className="font-mono text-xs text-gray-900 mt-1">{syllabusDetailData.workflowId || '-'}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Người cập nhật gần nhất:</span>
                    <div className="text-gray-900 mt-1">{syllabusDetailData.lastActionBy || syllabusDetailData.updatedBy || '-'}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Root ID:</span>
                    <div className="font-mono text-xs text-gray-900 mt-1">{syllabusDetailData.rootId || '-'}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Cập nhật lần cuối:</span>
                    <div className="text-gray-900 mt-1">
                      {syllabusDetailData.updatedAt ? new Date(syllabusDetailData.updatedAt).toLocaleString('vi-VN') : '-'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-red-600">
              Không tải được thông tin giáo trình
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-gray-50 px-8 py-4 flex justify-between items-center border-t">
          <div className="flex items-center gap-2">
            {cloCheckHistory && cloCheckHistory[syllabusDetailData?.id] && (
              <div className="flex items-center gap-2">
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  ✓ Đã check: {cloCheckHistory[syllabusDetailData?.id].timestamp}
                </span>
                <button
                  onClick={() => handleViewCLOCheckHistory(syllabusDetailData?.id)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex items-center gap-2"
                >
                  <Eye size={14} />
                  Xem kết quả lần trước
                </button>
                <button
                  onClick={() => handleClearCLOCheckHistory(syllabusDetailData?.id)}
                  className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-xs"
                  title="Xoá kết quả lưu trữ"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleCheckCLOPLOConsistency}
              disabled={cloCheckLoading}
              className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:bg-gray-400 flex items-center gap-2"
            >
              {cloCheckLoading ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  Kiểm tra...
                </>
              ) : (
                <>
                  <CheckCircle size={16} />
                  Kiểm tra CLO-PLO
                </>
              )}
            </button>
            <button 
              onClick={handleClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Đóng
            </button>
          </div>
        </div>

        {/* Document Summary Modal */}
        {showDocumentSummaryModal && selectedDocumentForSummary && (
          <DocumentSummaryModal 
            document={selectedDocumentForSummary}
            onClose={() => {
              setLocalShowDocumentSummaryModal(false)
              setLocalSelectedDocumentForSummary(null)
            }}
          />
        )}
      </div>
    </div>
  )
}

export default SyllabusDetailModal
