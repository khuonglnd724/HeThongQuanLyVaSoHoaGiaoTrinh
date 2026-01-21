import React from 'react'

const SearchPage = ({ onSyllabusSelect }) => (
  <div className="p-6">
    <h1 className="text-2xl font-bold">Search Page</h1>
    <button onClick={() => onSyllabusSelect('demo-id')} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">Open Syllabus</button>
  </div>
)

export default SearchPage
