import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Search, BookOpen, Calendar, Tag, ChevronRight } from 'lucide-react'
import { publicService } from '../services'

const SearchPage = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({ total: 0, page: 1, size: 10 })

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
        <h1 className="text-3xl font-bold text-gray-900 mb-4">🔍 Tìm Kiếm Giáo Trình</h1>
        
        {/* Search Form */}
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nhập tên môn học, mã môn hoặc từ khóa..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition flex items-center gap-2"
          >
            <Search size={20} />
            Tìm Kiếm
          </button>
        </form>
      </div>

      {/* Results */}
      <div className="space-y-4">
        {/* Stats */}
        <div className="flex justify-between items-center text-gray-600">
          <span>Tìm thấy <strong>{pagination.total}</strong> giáo trình</span>
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
