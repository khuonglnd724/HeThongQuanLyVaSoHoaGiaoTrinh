import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { BookOpen } from 'lucide-react'
import SearchBar from '../components/SearchBar'
import FilterPanel from '../components/FilterPanel'
import { getPublishedSyllabi } from '../services/publicSyllabusService'

export default function PublicSyllabusSearchPage() {
  const [syllabi, setSyllabi] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({ major: '', semester: '' })
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [error, setError] = useState(null)

  const fetchSyllabi = useCallback(async (pageNum) => {
    setLoading(true)
    setError(null)
    try {
      const result = await getPublishedSyllabi(pageNum, 10, searchTerm)
      setSyllabi(result.content || [])
      setTotalPages(result.totalPages || 1)
      setPage(pageNum)
    } catch (err) {
      setError('Không thể tải danh sách syllabus. Vui lòng thử lại.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [searchTerm])

  const filteredSyllabi = useMemo(() => syllabi.filter(item => {
    const matchesMajor = filters.major ? String(item.majorId || item.major) === String(filters.major) : true
    const matchesSemester = filters.semester ? String(item.semester) === String(filters.semester) : true
    return matchesMajor && matchesSemester
  }), [filters, syllabi])

  useEffect(() => {
    fetchSyllabi(0)
  }, [fetchSyllabi])

  const handleSearch = (term) => {
    setSearchTerm(term)
    setPage(0)
  }

  const handleFilter = (newFilters) => {
    setFilters(newFilters)
    setPage(0)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="flex items-center gap-3 mb-3">
            <BookOpen size={32} />
            <h1 className="text-4xl font-bold">Kho Syllabus</h1>
          </div>
          <p className="text-blue-100">Tìm kiếm và xem chi tiết các syllabus môn học</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-6">
          <div className="space-y-4">
            <SearchBar 
              onSearch={handleSearch}
              onClear={() => setSearchTerm('')}
              placeholder="Tìm kiếm mã hoặc tên môn học..."
            />
            <div className="flex gap-4">
              <FilterPanel 
                onFilter={handleFilter}
                majors={[
                  { id: 1, name: 'Công nghệ thông tin' },
                  { id: 2, name: 'Kỹ thuật phần mềm' }
                ]}
                semesters={[
                  { id: 1, name: 'Học kì 1' },
                  { id: 2, name: 'Học kì 2' }
                ]}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        {error && (
          <div className="mb-6 p-4 bg-red-100 border-2 border-red-400 text-red-800 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin">⏳</div>
            <p className="mt-2 text-gray-600">Đang tải...</p>
          </div>
        ) : filteredSyllabi.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border-2 border-gray-200">
            <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">Không tìm thấy syllabus nào phù hợp</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSyllabi.map((syllabus) => (
              <div key={syllabus.id} className="bg-white rounded-lg border-2 border-gray-200 p-6 hover:shadow-lg transition">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                      {syllabus.subjectCode}: {syllabus.subjectName}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2">Giảng viên: {syllabus.instructor || 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      ✓ Đã xuất bản
                    </span>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-4 line-clamp-2">{syllabus.description}</p>
                
                <div className="flex gap-4 items-center text-sm text-gray-600">
                  <span>📚 {syllabus.credits || 3} tín chỉ</span>
                  <span>🎓 Kì {syllabus.semester || 1}</span>
                </div>

                <a
                  href={`/syllabus/${syllabus.id}`}
                  className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Xem chi tiết
                </a>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-12">
            <button
              onClick={() => fetchSyllabi(page - 1)}
              disabled={page === 0}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Trang trước
            </button>
            <span className="px-4 py-2 text-gray-600">
              Trang {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => fetchSyllabi(page + 1)}
              disabled={page >= totalPages - 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Trang sau
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
