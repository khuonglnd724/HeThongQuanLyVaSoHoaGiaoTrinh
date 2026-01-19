import React from 'react'
import { BookOpen, Users, Clock, CheckCircle } from 'lucide-react'

export const CLOPLOMap = ({ syllabus, loading }) => {
  if (loading) {
    return <div className="text-center py-8 text-gray-500">Đang tải...</div>
  }

  if (!syllabus?.cloMap) {
    return <div className="text-center py-8 text-gray-500">Không có dữ liệu CLO-PLO</div>
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Bản đồ Chuẩn Đầu Ra (CLO-PLO)</h3>

      {/* CLO Section */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <BookOpen size={18} className="text-primary-600" />
          Chuẩn Đầu Ra Môn Học (CLO)
        </h4>
        <div className="space-y-2">
          {syllabus.cloMap.clos?.map((clo, idx) => (
            <div key={idx} className="card p-4">
              <div className="font-medium text-gray-900">{clo.code}</div>
              <div className="text-sm text-gray-600 mt-1">{clo.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* PLO Section */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <CheckCircle size={18} className="text-success-600" />
          Chuẩn Đầu Ra Chương Trình (PLO)
        </h4>
        <div className="space-y-2">
          {syllabus.cloMap.plos?.map((plo, idx) => (
            <div key={idx} className="card p-4">
              <div className="font-medium text-gray-900">{plo.code}</div>
              <div className="text-sm text-gray-600 mt-1">{plo.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Mapping Table */}
      {syllabus.cloMap.mappings && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Ánh xạ CLO → PLO</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">CLO</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">PLO</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Mức độ</th>
                </tr>
              </thead>
              <tbody>
                {syllabus.cloMap.mappings.map((mapping, idx) => (
                  <tr key={idx} className="border-t border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-2">{mapping.clo}</td>
                    <td className="px-4 py-2">{mapping.plo}</td>
                    <td className="px-4 py-2">
                      <span className="badge badge-primary">{mapping.level}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default CLOPLOMap
