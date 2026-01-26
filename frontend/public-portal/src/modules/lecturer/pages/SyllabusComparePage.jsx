import React, { useState, useEffect } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import syllabusServiceV2 from '../services/syllabusServiceV2'

const SyllabusComparePage = ({ rootId, user, onBack }) => {
  const [versions, setVersions] = useState([])
  const [selectedV1, setSelectedV1] = useState(null)
  const [selectedV2, setSelectedV2] = useState(null)
  const [compareResult, setCompareResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [comparing, setComparing] = useState(false)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadVersions()
  }, [rootId])

  const loadVersions = async () => {
    setLoading(true)
    try {
      const res = await syllabusServiceV2.getVersions(rootId)
      setVersions(res.data || [])
      if (res.data?.length >= 2) {
        setSelectedV1(res.data[res.data.length - 2].version)
        setSelectedV2(res.data[res.data.length - 1].version)
      }
    } catch (err) {
      console.error('Failed to load versions:', err)
      alert('Không thể tải danh sách phiên bản')
    } finally {
      setLoading(false)
    }
  }

  const handleCompare = async () => {
    if (!selectedV1 || !selectedV2) {
      alert('Vui lòng chọn 2 phiên bản')
      return
    }

    setComparing(true)
    try {
      const res = await syllabusServiceV2.compare(rootId, selectedV1, selectedV2)
      setCompareResult(res.data)
    } catch (err) {
      console.error('Compare failed:', err)
      alert('So sánh thất bại')
    } finally {
      setComparing(false)
    }
  }

  if (loading) {
    return <div className="p-8 text-center">Đang tải...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-200 rounded-lg">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">So sánh phiên bản</h1>
        </div>

        {/* Comparison Setup */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phiên bản 1</label>
              <select
                value={selectedV1 || ''}
                onChange={(e) => setSelectedV1(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">-- Chọn --</option>
                {versions.map(v => (
                  <option key={v.version} value={v.version}>
                    v{v.version}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-center">
              <ArrowRight size={24} className="mx-auto text-gray-400" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phiên bản 2</label>
              <select
                value={selectedV2 || ''}
                onChange={(e) => setSelectedV2(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">-- Chọn --</option>
                {versions.map(v => (
                  <option key={v.version} value={v.version}>
                    v{v.version}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleCompare}
            disabled={comparing || !selectedV1 || !selectedV2}
            className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            {comparing ? '⏳ Đang so sánh...' : 'So sánh'}
          </button>
        </div>

        {/* Results */}
        {compareResult && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Kết quả so sánh</h2>
            <div className="space-y-4">
              {compareResult.length === 0 ? (
                <p className="text-gray-600">Không có sự thay đổi giữa hai phiên bản</p>
              ) : (
                compareResult.map((change, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 border border-gray-200 rounded">
                    <p className="font-medium text-gray-900">{change.field}</p>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div>
                        <p className="text-xs text-red-600 mb-1">Trước:</p>
                        <p className="text-sm text-gray-700">{change.oldValue}</p>
                      </div>
                      <div>
                        <p className="text-xs text-green-600 mb-1">Sau:</p>
                        <p className="text-sm text-gray-700">{change.newValue}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SyllabusComparePage
