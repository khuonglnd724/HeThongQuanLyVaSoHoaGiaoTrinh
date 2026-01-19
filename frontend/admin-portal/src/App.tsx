import { useState } from 'react'
import PendingList from './pages/PendingList'
import ReviewPage from './pages/ReviewPage'
import SearchAnalysisPage from './pages/SearchAnalysisPage'

type View = 'PENDING' | 'REVIEW' | 'SEARCH'

function App() {
  const [view, setView] = useState<View>('PENDING')
  const [selectedWorkflowId, setSelectedWorkflowId] =
    useState<string | null>(null)

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow p-4">
        <h1 className="text-xl font-bold">
          Hệ thống Phê duyệt Giáo trình
        </h1>

        <div className="mt-2 flex gap-4 text-sm">
          <button
            className="underline text-blue-600"
            onClick={() => {
              setView('PENDING')
              setSelectedWorkflowId(null)
            }}
          >
            📥 Chờ duyệt
          </button>

          <button
            className="underline text-blue-600"
            onClick={() => {
              setView('SEARCH')
              setSelectedWorkflowId(null)
            }}
          >
            🔍 Tra cứu & Phân tích
          </button>
        </div>
      </header>

      <main className="p-6">
        {view === 'PENDING' && (
          <PendingList
            onSelect={workflowId => {
              setSelectedWorkflowId(workflowId)
              setView('REVIEW')
            }}
          />
        )}

        {view === 'REVIEW' && selectedWorkflowId && (
          <ReviewPage
            workflowId={selectedWorkflowId}
            onBack={() => {
              setSelectedWorkflowId(null)
              setView('PENDING')
            }}
          />
        )}

        {view === 'SEARCH' && <SearchAnalysisPage />}
      </main>
    </div>
  )
}

export default App
