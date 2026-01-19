import React, { useState } from 'react'
import SearchBar from '../components/SearchBar'
import SyllabusCard from '../components/SyllabusCard'
import { useSyllabusSearch } from '../hooks/useApi'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export const SearchPage = ({ onSyllabusSelect }) => {
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(0)
  const { data, loading, error } = useSyllabusSearch(query, page)

  const handleSearch = (searchQuery) => {
    setQuery(searchQuery)
    setPage(0)
  }

  const totalPages = data ? Math.ceil(data.totalElements / data.size) : 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-12">
        <div className="container-custom">
          <h1 className="text-4xl font-bold mb-4">🔍 Tìm kiếm Giáo Trình</h1>
          <p className="text-primary-100 max-w-2xl">
            Tìm kiếm giáo trình theo tên môn học, mã môn hoặc lọc theo chuyên ngành/học kỳ
          </p>
        </div>
      </div>

      {/* Search Section */}
      <div className="container-custom py-8">
        <div className="max-w-2xl mx-auto mb-12">
          <SearchBar
            value={query}
            onChange={setQuery}
            onSearch={() => handleSearch(query)}
            placeholder="Nhập tên môn học hoặc mã môn (VD: CS101, Lập trình Web)..."
          />
        </div>

        {/* Results Section */}
        {error && (
          <div className="bg-danger-50 border border-danger-200 rounded-lg p-4 text-danger-600 mb-6">
            {error}
          </div>
        )}

        {!query && (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">Nhập từ khóa để bắt đầu tìm kiếm</p>
          </div>
        )}

        {query && loading && (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="text-gray-500 mt-4">Đang tìm kiếm...</p>
          </div>
        )}

        {query && !loading && data?.content?.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">Không tìm thấy kết quả phù hợp</p>
          </div>
        )}

        {query && !loading && data?.content && (
          <>
            <div className="mb-6 text-gray-600">
              Tìm thấy <span className="font-semibold">{data.totalElements}</span> kết quả
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {data.content.map((syllabus) => (
                <div
                  key={syllabus.id}
                  onClick={() => onSyllabusSelect(syllabus.id)}
                  className="cursor-pointer"
                >
                  <SyllabusCard syllabus={syllabus} />
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="btn btn-secondary gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={18} />
                  Trang trước
                </button>

                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
                    const pageNum = Math.max(0, page - 2) + idx
                    return pageNum < totalPages ? (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`px-3 py-2 rounded-lg font-medium ${
                          pageNum === page
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {pageNum + 1}
                      </button>
                    ) : null
                  })}
                </div>

                <button
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1}
                  className="btn btn-secondary gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trang sau
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default SearchPage
