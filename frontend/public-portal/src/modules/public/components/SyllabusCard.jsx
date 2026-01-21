import React from 'react'
import { BookOpen } from 'lucide-react'

export const SyllabusCard = ({ syllabus, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="card p-4 hover:shadow-lg cursor-pointer transition-all duration-200 group"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 bg-primary-100 rounded-lg group-hover:bg-primary-200 transition">
          <BookOpen size={20} className="text-primary-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition line-clamp-2">
            {syllabus.subjectName}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Mã: <span className="font-mono font-semibold">{syllabus.subjectCode}</span>
          </p>
          <p className="text-xs text-gray-500 mt-2 line-clamp-2">
            {syllabus.description}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <div className="flex gap-2">
          <span className="badge badge-primary text-xs">{syllabus.credits} TC</span>
          <span className="badge badge-secondary text-xs">Học kỳ {syllabus.semester}</span>
        </div>
        {syllabus.followers && (
          <span className="text-xs text-gray-500">❤️ {syllabus.followers}</span>
        )}
      </div>
    </div>
  )
}

export default SyllabusCard
