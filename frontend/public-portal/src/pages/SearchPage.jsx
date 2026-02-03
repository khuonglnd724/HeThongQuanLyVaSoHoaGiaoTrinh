import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Search, BookOpen, Calendar, Tag, ChevronRight, Filter, X } from 'lucide-react'
import { publicService } from '../services'

const SearchPage = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({ total: 0, page: 1, size: 10 })
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    department: '',
    semester: '',
    year: ''
  })

  const fetchSyllabi = useCallback(async (searchQuery = '') => {
    setLoading(true)
    setError(null)
    try {
      const response = await publicService.searchPublicSyllabi(searchQuery)
      setResults(response.results || [])
      setPagination({
        total: response.total || 0,
        page: response.page || 1,
        size: response.size || 10
      })
    } catch (err) {
      console.error('Search error:', err)
      setError(err.message || 'Có lỗi xảy ra khi tìm kiếm')
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch on mount
  useEffect(() => {
    fetchSyllabi(query)
  }, [fetchSyllabi, query])

  const handleSearch = (e) => {
    e.preventDefault()
    setSearchParams(query ? { q: query } : {})
    fetchSyllabi(query)
  }

  const handleSyllabusSelect = (id) => {
    navigate(`/syllabus/${id}`)
  }

  return (
    <div className="container-custom py-8">
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🔍 Tìm Kiếm Giáo Trình</h1>
        <p className="text-gray-600 mb-6">Tìm kiếm giáo trình theo tên môn học, mã môn, giảng viên hoặc từ khóa</p>
        
        {/* Search Form */}
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Nhập tên môn học, mã môn, giảng viên hoặc từ khóa..."
                className="w-full pl-12 pr-4 py-3.5 text-lg border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Search size={20} />
              Tìm Kiếm
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="px-6 py-3.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
            >
              <Filter size={20} />
              Bộ Lọc
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Bộ lọc nâng cao</h3>
                <button
                  type="button"
                  onClick={() => setShowFilters(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Khoa/Ngành
                  </label>
                  <select
                    value={filters.department}
                    onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Tất cả</option>
                    <option value="CNTT">Công nghệ thông tin</option>
                    <option value="KT">Kinh tế</option>
                    <option value="QT">Quản trị kinh doanh</option>
                    <option value="NN">Ngoại ngữ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Học kỳ
                  </label>
                  <select
                    value={filters.semester}
                    onChange={(e) => setFilters({ ...filters, semester: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Tất cả</option>
                    <option value="1">Học kỳ 1</option>
                    <option value="2">Học kỳ 2</option>
                    <option value="3">Học kỳ hè</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Năm học
                  </label>
                  <select
                    value={filters.year}
                    onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Tất cả</option>
                    <option value="2025-2026">2025-2026</option>
                    <option value="2024-2025">2024-2025</option>
                    <option value="2023-2024">2023-2024</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setFilters({ department: '', semester: '', year: '' })
                    fetchSyllabi(query)
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                >
                  Xóa bộ lọc
                </button>
                <button
                  type="button"
                  onClick={() => fetchSyllabi(query)}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                >
                  Áp dụng
                </button>
              </div>
            </div>
          )}
        </form>

        {/* Quick Suggestions */}
        {!query && (
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="text-sm text-gray-600">Gợi ý:</span>
            {['Lập trình', 'Toán', 'Tiếng Anh', 'Quản trị', 'Marketing'].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => {
                  setQuery(suggestion)
                  fetchSyllabi(suggestion)
                }}
                className="px-3 py-1 bg-gray-100 hover:bg-primary-100 text-gray-700 hover:text-primary-700 rounded-full text-sm transition"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results */}
      <div className="space-y-4">
        {/* Stats and Active Filters */}
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-gray-600">
              Tìm thấy <strong className="text-primary-600 text-lg">{pagination.total}</strong> giáo trình
            </span>
            {query && (
              <span className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm">
                "{query}"
              </span>
            )}
          </div>
          
          {/* Active Filters Tags */}
          {(filters.department || filters.semester || filters.year) && (
            <div className="flex flex-wrap gap-2">
              {filters.department && (
                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm flex items-center gap-2">
                  Khoa: {filters.department}
                  <button
                    onClick={() => setFilters({ ...filters, department: '' })}
                    className="hover:text-blue-900"
                  >
                    <X size={14} />
                  </button>
                </span>
              )}
              {filters.semester && (
                <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm flex items-center gap-2">
                  Học kỳ {filters.semester}
                  <button
                    onClick={() => setFilters({ ...filters, semester: '' })}
                    className="hover:text-green-900"
                  >
                    <X size={14} />
                  </button>
                </span>
              )}
              {filters.year && (
                <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm flex items-center gap-2">
                  Năm: {filters.year}
                  <button
                    onClick={() => setFilters({ ...filters, year: '' })}
                    className="hover:text-purple-900"
                  >
                    <X size={14} />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tìm kiếm...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Results List */}
        {!loading && !error && results.length > 0 && (
          <div className="grid gap-4">
            {results.map((syllabus) => (
              <div
                key={syllabus.id}
                onClick={() => handleSyllabusSelect(syllabus.id)}
                className="card p-6 hover:shadow-lg transition cursor-pointer border-l-4 border-primary-500"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <BookOpen size={20} className="text-primary-600" />
                      {syllabus.title || syllabus.code}
                    </h3>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                      <span className="flex items-center gap-1">
                        <Tag size={16} />
                        Mã: {syllabus.code}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={16} />
                        Học kỳ: {syllabus.semester}
                      </span>
                      {syllabus.version && (
                        <span className="bg-gray-100 px-2 py-1 rounded">
                          v{syllabus.version}
                        </span>
                      )}
                    </div>
                    {syllabus.snippet && (
                      <p className="text-gray-600 line-clamp-2">{syllabus.snippet}</p>
                    )}
                  </div>
                  <ChevronRight size={24} className="text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && results.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy giáo trình</h3>
            <p className="text-gray-600">Hãy thử tìm kiếm với từ khóa khác</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default SearchPage
