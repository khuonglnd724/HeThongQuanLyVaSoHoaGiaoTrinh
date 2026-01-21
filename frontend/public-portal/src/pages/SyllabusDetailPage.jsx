import React from 'react'

const SyllabusDetailPage = ({ syllabusId, onBack }) => (
  <div className="p-6">
    <h1 className="text-2xl font-bold">Syllabus Detail</h1>
    <p className="mt-2 text-gray-700">Syllabus ID: {syllabusId}</p>
    <button onClick={onBack} className="mt-4 px-4 py-2 bg-gray-800 text-white rounded">Back</button>
  </div>
)

export default SyllabusDetailPage
