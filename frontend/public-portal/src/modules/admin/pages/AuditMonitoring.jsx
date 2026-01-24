import React, { useState } from 'react'
import { BarChart3, Download, Eye, Filter, Calendar } from 'lucide-react'

export default function AuditMonitoring() {
  const [activeTab, setActiveTab] = useState('login')
  const [logs] = useState([
    {
      id: 1,
      timestamp: '2024-11-15 14:30:25',
      user: 'teacher1@smd.edu.vn',
      action: 'Đăng nhập',
      resource: 'Hệ thống',
      status: 'Thành công',
      ip: '192.168.1.100'
    },
    {
      id: 2,
      timestamp: '2024-11-15 14:45:12',
      user: 'teacher1@smd.edu.vn',
      action: 'Chỉnh sửa',
      resource: 'Syllabus IT101',
      status: 'Thành công',
      ip: '192.168.1.100'
    },
    {
      id: 3,
      timestamp: '2024-11-15 15:02:30',
      user: 'hod@smd.edu.vn',
      action: 'Duyệt',
      resource: 'Syllabus IT201',
      status: 'Thành công',
      ip: '192.168.1.105'
    }
  ])

  const tabs = [
    { id: 'login', label: 'Log đăng nhập', count: '1,240' },
    { id: 'edit', label: 'Log chỉnh sửa', count: '856' },
    { id: 'approval', label: 'Lịch sử duyệt', count: '342' },
    { id: 'publish', label: 'Log công bố', count: '128' }
  ]

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {tabs.map((tab, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-4 border-l-4 border-indigo-500">
            <p className="text-sm font-medium text-gray-600">{tab.label}</p>
            <p className="text-3xl font-bold text-indigo-900 mt-2">{tab.count}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow border-b border-gray-200">
        <div className="flex overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 font-medium transition-all border-b-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600 bg-indigo-50'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Filter size={20} />
          Bộ lọc
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Từ ngày</label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Đến ngày</label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Người dùng</label>
            <input
              type="text"
              placeholder="Email hoặc tên"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Tất cả</option>
              <option value="success">Thành công</option>
              <option value="failed">Thất bại</option>
            </select>
          </div>
          <div className="flex items-end">
            <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium transition-colors">
              Tìm kiếm
            </button>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b-2 border-indigo-300">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Thời gian</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Người dùng</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Hành động</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Tài nguyên</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Trạng thái</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">IP</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, i) => (
                <tr key={i} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">{log.timestamp}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-xs font-bold text-indigo-700">
                        {log.user.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{log.user}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{log.resource}</td>
                  <td className="px-4 py-3">
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      {log.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 font-mono">{log.ip}</td>
                  <td className="px-4 py-3 text-center">
                    <button className="p-2 hover:bg-blue-100 rounded-lg transition-colors">
                      <Eye size={16} className="text-blue-600" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
          <p className="text-sm text-gray-600">Hiển thị 1-20 của 1,240 bản ghi</p>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm">Trước</button>
            <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm">1</button>
            <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm">2</button>
            <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm">Tiếp</button>
          </div>
        </div>
      </div>

      {/* Export Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Download size={20} />
          Xuất báo cáo
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { format: 'PDF', icon: '📄', color: 'red' },
            { format: 'Excel (XLSX)', icon: '📊', color: 'green' },
            { format: 'CSV', icon: '📋', color: 'blue' }
          ].map((exp, i) => (
            <button
              key={i}
              className={`border-2 border-${exp.color}-300 rounded-lg p-4 hover:bg-${exp.color}-50 transition-colors text-center`}
            >
              <span className="text-3xl mb-2 block">{exp.icon}</span>
              <p className="font-medium text-gray-900">Xuất {exp.format}</p>
              <p className="text-xs text-gray-500 mt-1">Tất cả bản ghi đã lọc</p>
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="bg-gradient-to-r from-indigo-500 to-blue-500 rounded-lg shadow-md p-6 text-white">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <BarChart3 size={20} />
          Thống kê tổng quan (hôm nay)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Đăng nhập', value: '245' },
            { label: 'Chỉnh sửa', value: '128' },
            { label: 'Duyệt', value: '45' },
            { label: 'Lỗi', value: '3' }
          ].map((stat, i) => (
            <div key={i}>
              <p className="text-sm opacity-90">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
