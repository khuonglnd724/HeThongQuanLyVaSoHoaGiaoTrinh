import React, { useState } from 'react'
import { Header, Footer } from './components/Layout'
import HomePage from './pages/HomePage'
import SearchPage from './pages/SearchPage'
import SyllabusDetailPage from './pages/SyllabusDetailPage'

function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [selectedSyllabusId, setSelectedSyllabusId] = useState(null)

  const goToHome = () => setCurrentPage('home')
  const goToSearch = () => setCurrentPage('search')
  const viewSyllabus = (id) => {
    setSelectedSyllabusId(id)
    setCurrentPage('detail')
  }
  const backFromDetail = () => setCurrentPage('search')

  return (
    <div className="flex flex-col min-h-screen">
      <Header onHomeClick={goToHome} onSearchClick={goToSearch} />

      <main className="flex-1">
        {currentPage === 'home' && (
          <HomePage onSearchClick={goToSearch} />
        )}

        {currentPage === 'search' && (
          <SearchPage onSyllabusSelect={viewSyllabus} />
        )}

        {currentPage === 'detail' && selectedSyllabusId && (
          <SyllabusDetailPage
            syllabusId={selectedSyllabusId}
            onBack={backFromDetail}
          />
        )}
      </main>

      <Footer />
    </div>
  )
}

export default App
