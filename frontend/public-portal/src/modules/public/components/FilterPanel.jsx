import React, { useState } from 'react'
import { Filter, X } from 'lucide-react'

export default function FilterPanel({ onFilter, majors = [], semesters = [] }) {
  const [showFilter, setShowFilter] = useState(false)
  const [selectedMajor, setSelectedMajor] = useState('')
  const [selectedSemester, setSelectedSemester] = useState('')

  const handleApplyFilter = () => {
    onFilter({
      major: selectedMajor,
      semester: selectedSemester
    })
    setShowFilter(false)
  }

  const handleClearFilter = () => {
    setSelectedMajor('')
    setSelectedSemester('')
    onFilter({
      major: '',
      semester: ''
    })
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowFilter(!showFilter)}
        className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
      >
        <Filter size={18} />
        Lọc kết quả
      </button>

      {showFilter && (
        <div className="absolute top-12 right-0 bg-white border-2 border-gray-300 rounded-lg shadow-lg p-4 min-w-64 z-10">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-900">Lọc</h3>
            <button onClick={() => setShowFilter(false)}>
              <X size={18} />
            </button>
          </div>

          <div className="space-y-4">
            {majors.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ngành học</label>
                <select
                  value={selectedMajor}
                  onChange={(e) => setSelectedMajor(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tất cả ngành</option>
                  {majors.map((major) => (
                    <option key={major.id} value={major.id}>{major.name}</option>
                  ))}
                </select>
              </div>
            )}

            {semesters.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Học kì</label>
                <select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tất cả học kì</option>
                  {semesters.map((semester) => (
                    <option key={semester.id} value={semester.id}>{semester.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={handleApplyFilter}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-medium"
            >
              Áp dụng
            </button>
            <button
              onClick={handleClearFilter}
              className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition"
            >
              Xóa bộ lọc
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
