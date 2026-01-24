import React, { useState } from 'react'
import { FileText, Globe, Archive, Eye, Download, CheckCircle, AlertCircle } from 'lucide-react'

export default function PublishingManagement() {
  const [publications] = useState([
    {
      id: 1,
      title: 'Lập trình Java cơ bản',
      code: 'IT101',
      faculty: 'Khoa CNTT',
      lecturer: 'Nguyễn Văn A',
      status: 'Công bố',
      publishDate: '01/11/2024',
      effectiveDate: '15/11/2024',
      version: 'v1.0'
    },
    {
      id: 2,
      title: 'Cơ sở dữ liệu',
      code: 'IT102',
      faculty: 'Khoa CNTT',
      lecturer: 'Trần Thị B',
      status: 'Chờ công bố',
      publishDate: null,
      effectiveDate: '01/12/2024',
      version: 'v1.0'
    },
    {
      id: 3,
      title: 'Phân tích và thiết kế hệ thống',
      code: 'IT201',
      faculty: 'Khoa CNTT',
      lecturer: 'Lê Văn C',
      status: 'Lưu trữ',
      publishDate: '15/08/2023',
      effectiveDate: '15/09/2023',
      version: 'v2.1'
    }
  ])

  const getStatusColor = (status) => {
    switch (status) {
      case 'Công bố':
        return 'green'
      case 'Chờ công bố':
        return 'yellow'
      case 'Lưu trữ':
        return 'gray'
      default:
        return 'blue'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Công bố':
        return <CheckCircle size={16} />
      case 'Chờ công bố':
        return <AlertCircle size={16} />
      case 'Lưu trữ':
        return <Archive size={16} />
      default:
        return <FileText size={16} />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Thống kê công bố</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Tổng syllabus', value: '156', color: 'blue' },
            { label: 'Đã công bố', value: '132', color: 'green' },
            { label: 'Chờ công bố', value: '18', color: 'yellow' },
            { label: 'Lưu trữ', value: '6', color: 'gray' }
          ].map((stat, i) => (
            <div key={i} className={`border-l-4 border-${stat.color}-500 bg-${stat.color}-50 p-4 rounded`}>
              <p className={`text-sm font-medium text-${stat.color}-700`}>{stat.label}</p>
              <p className={`text-2xl font-bold text-${stat.color}-900 mt-1`}>{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Tìm kiếm và lọc</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Tìm theo tên hoặc mã môn học"
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <select className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500">
            <option value="">Tất cả trạng thái</option>
            <option value="published">Công bố</option>
            <option value="pending">Chờ công bố</option>
            <option value="archived">Lưu trữ</option>
          </select>
          <select className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500">
            <option value="">Tất cả khoa</option>
            <option value="it">Khoa CNTT</option>
            <option value="eng">Khoa Kỹ thuật</option>
          </select>
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            Tìm kiếm
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-green-50 to-blue-50 border-b-2 border-green-300">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Tên môn học</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Mã</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Khoa</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Giáo viên</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Trạng thái</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Ngày công bố</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Ngày hiệu lực</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {publications.map((pub, i) => (
                <tr key={i} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{pub.title}</p>
                    <p className="text-xs text-gray-500">{pub.version}</p>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-700">{pub.code}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{pub.faculty}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{pub.lecturer}</td>
                  <td className="px-4 py-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 w-fit bg-${getStatusColor(pub.status)}-100 text-${getStatusColor(pub.status)}-700`}>
                      {getStatusIcon(pub.status)}
                      {pub.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{pub.publishDate || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{pub.effectiveDate}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Xem chi tiết"
                      >
                        <Eye size={16} className="text-blue-600" />
                      </button>
                      {pub.status === 'Chờ công bố' && (
                        <>
                          <button
                            className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                            title="Công bố"
                          >
                            <Globe size={16} className="text-green-600" />
                          </button>
                          <button
                            className="p-2 hover:bg-yellow-100 rounded-lg transition-colors"
                            title="Lưu trữ"
                          >
                            <Archive size={16} className="text-yellow-600" />
                          </button>
                        </>
                      )}
                      {pub.status === 'Công bố' && (
                        <button
                          className="p-2 hover:bg-yellow-100 rounded-lg transition-colors"
                          title="Hủy công bố"
                        >
                          <Archive size={16} className="text-yellow-600" />
                        </button>
                      )}
                      <button
                        className="p-2 hover:bg-purple-100 rounded-lg transition-colors"
                        title="Tải xuống"
                      >
                        <Download size={16} className="text-purple-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Hành động loạt</h3>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors">
            Công bố tất cả được chọn
          </button>
          <button className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors">
            Lưu trữ tất cả được chọn
          </button>
          <button className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg font-medium transition-colors">
            Hủy công bố tất cả được chọn
          </button>
        </div>
      </div>
    </div>
  )
}
