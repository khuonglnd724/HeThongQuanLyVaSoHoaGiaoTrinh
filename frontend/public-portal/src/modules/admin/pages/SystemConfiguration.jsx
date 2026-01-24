import React, { useState } from 'react'
import { Plus, Trash2, Edit, Calendar } from 'lucide-react'

export default function SystemConfiguration() {
  const [activeTab, setActiveTab] = useState('academic')
  const [academicYears] = useState([
    { id: 1, year: '2023-2024', status: 'Hoàn tất' },
    { id: 2, year: '2024-2025', status: 'Đang diễn ra' },
    { id: 3, year: '2025-2026', status: 'Sắp tới' }
  ])

  const tabs = [
    { id: 'academic', label: 'Năm học & Học kỳ' },
    { id: 'organization', label: 'Khoa & Bộ môn' },
    { id: 'templates', label: 'Template CLO/Rubric' },
    { id: 'workflow', label: 'Quy trình Workflow' }
  ]

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="bg-white rounded-lg shadow border-b border-gray-200">
        <div className="flex overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 font-medium transition-all border-b-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-green-600 text-green-600 bg-green-50'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {activeTab === 'academic' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900">Năm học và Học kỳ</h3>
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors">
                <Plus size={18} />
                Thêm năm học
              </button>
            </div>

            <div className="space-y-4">
              {academicYears.map(ay => (
                <div key={ay.id} className="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-gray-900 flex items-center gap-2">
                        <Calendar size={18} className="text-green-600" />
                        Năm học {ay.year}
                      </h4>
                      <div className="mt-3 space-y-2">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {[
                            { label: 'Học kỳ 1', start: '01/09/2024', end: '15/12/2024' },
                            { label: 'Học kỳ 2', start: '02/01/2025', end: '30/04/2025' },
                            { label: 'Học kỳ 3', start: '01/06/2025', end: '31/08/2025' }
                          ].map((sem, i) => (
                            <div key={i} className="border border-gray-100 rounded p-3 bg-gray-50">
                              <p className="font-medium text-sm text-gray-700">{sem.label}</p>
                              <p className="text-xs text-gray-500 mt-1">{sem.start} → {sem.end}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        ay.status === 'Đang diễn ra' ? 'bg-blue-100 text-blue-700' :
                        ay.status === 'Hoàn tất' ? 'bg-gray-100 text-gray-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {ay.status}
                      </span>
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <Edit size={16} className="text-blue-600" />
                      </button>
                      <button className="p-2 hover:bg-red-100 rounded-lg transition-colors">
                        <Trash2 size={16} className="text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'organization' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900">Khoa & Bộ môn</h3>
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors">
                <Plus size={18} />
                Thêm khoa
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Khoa Công nghệ Thông tin', code: 'IT', depts: 5 },
                { name: 'Khoa Kỹ thuật', code: 'ENG', depts: 4 },
                { name: 'Khoa Kinh tế', code: 'ECON', depts: 3 }
              ].map((faculty, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold text-gray-900">{faculty.name}</h4>
                      <p className="text-sm text-gray-500">Mã: {faculty.code}</p>
                    </div>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <Edit size={16} className="text-blue-600" />
                    </button>
                  </div>
                  <div className="bg-green-50 p-3 rounded border border-green-100">
                    <p className="text-sm font-medium text-green-700">{faculty.depts} bộ môn</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'templates' && (
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-6">Template CLO/Rubric</h3>
            <div className="space-y-4">
              {['CLO Template', 'Rubric Tiêu chí', 'Thang đánh giá'].map((template, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-gray-900">{template}</h4>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors text-sm font-medium">
                        Xem
                      </button>
                      <button className="px-3 py-1 bg-yellow-100 text-yellow-600 rounded hover:bg-yellow-200 transition-colors text-sm font-medium">
                        Sửa
                      </button>
                      <button className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors text-sm font-medium">
                        Xóa
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Cập nhật lần cuối: 15/11/2024</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'workflow' && (
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-6">Quy trình Workflow</h3>
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border border-green-200">
              <div className="flex items-center justify-between mb-6">
                {[
                  { status: 'Nháp', color: 'gray' },
                  { status: 'Gửi duyệt', color: 'blue' },
                  { status: 'Đang duyệt', color: 'yellow' },
                  { status: 'Đã duyệt', color: 'green' }
                ].map((step, i, arr) => (
                  <div key={i} className="flex items-center flex-1">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white bg-${step.color}-500`}>
                      {i + 1}
                    </div>
                    <p className="text-sm font-medium text-gray-700 ml-2">{step.status}</p>
                    {i < arr.length - 1 && <div className="flex-1 h-1 bg-gray-300 mx-2" />}
                  </div>
                ))}
              </div>
              <div className="bg-white p-4 rounded border border-gray-200">
                <p className="font-medium text-gray-900 mb-2">Quy tắc chuyển trạng thái:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Giáo viên: Nháp → Gửi duyệt</li>
                  <li>• Trưởng bộ môn: Gửi duyệt → Đang duyệt</li>
                  <li>• Phòng Đào tạo: Đang duyệt → Đã duyệt</li>
                  <li>• Admin: Công bố hoặc hủy công bố</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
