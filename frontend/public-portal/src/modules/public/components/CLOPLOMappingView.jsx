import React from 'react'
import { Target, ArrowRight } from 'lucide-react'

export default function CLOPLOMappingView({ mapping = { clos: [], plos: [], mappings: [] } }) {
  const { clos = [], plos = [], mappings = [] } = mapping

  if (clos.length === 0 && plos.length === 0) {
    return (
      <div className="bg-indigo-50 rounded-lg p-6 border-2 border-indigo-200">
        <div className="flex items-center gap-2 mb-2">
          <Target size={20} className="text-indigo-600" />
          <h3 className="font-semibold text-indigo-900">CLO - PLO Mapping</h3>
        </div>
        <p className="text-indigo-700">Chưa có dữ liệu ánh xạ CLO - PLO.</p>
      </div>
    )
  }

  return (
    <div className="bg-indigo-50 rounded-lg p-6 border-2 border-indigo-200">
      <div className="flex items-center gap-2 mb-6">
        <Target size={20} className="text-indigo-600" />
        <h3 className="font-semibold text-indigo-900">CLO - PLO Mapping</h3>
      </div>

      <div className="space-y-6">
        {/* CLOs */}
        {clos.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">📍 Course Learning Outcomes (CLO)</h4>
            <div className="space-y-2">
              {clos.map((clo, idx) => (
                <div key={clo.id} className="bg-white p-3 rounded border-l-4 border-blue-500">
                  <div className="font-medium text-gray-900">CLO {idx + 1}: {clo.description}</div>
                  <div className="text-sm text-gray-600 mt-1">Level: {clo.level}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PLOs */}
        {plos.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">🎯 Program Learning Outcomes (PLO)</h4>
            <div className="space-y-2">
              {plos.map((plo, idx) => (
                <div key={plo.id} className="bg-white p-3 rounded border-l-4 border-green-500">
                  <div className="font-medium text-gray-900">PLO {idx + 1}: {plo.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mappings */}
        {mappings.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">🔗 Ánh xạ CLO → PLO</h4>
            <div className="space-y-3">
              {mappings.map((mapping, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-white p-3 rounded">
                  <div className="flex-1 font-medium text-blue-600">CLO {mapping.cloIndex}</div>
                  <ArrowRight size={20} className="text-gray-400" />
                  <div className="flex-1 font-medium text-green-600">PLO {mapping.ploIndex}</div>
                  <div className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                    {mapping.level || 'N/A'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
