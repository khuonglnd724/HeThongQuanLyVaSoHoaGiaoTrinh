import React from 'react'

const HomePage = ({ onSearchClick }) => (
  <div className="p-6">
    <h1 className="text-2xl font-bold">Home Page</h1>
    <button onClick={onSearchClick} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">Search Syllabus</button>
  </div>
)

export default HomePage
