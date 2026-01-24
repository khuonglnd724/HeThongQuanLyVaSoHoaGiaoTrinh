import React from 'react'
import { Download } from 'lucide-react'

export default function PDFExportButton({ syllabusId, syllabusTitle, loading = false }) {
  const handleExport = () => {
    alert('Chức năng export PDF sẽ được triển khai')
    // TODO: Implement PDF export functionality
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="flex items-center gap-2 px-6 py-3 border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-50 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Download size={18} />
      {loading ? 'Đang xuất...' : 'Xuất PDF'}
    </button>
  )
}
