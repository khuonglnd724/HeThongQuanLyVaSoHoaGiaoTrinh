import { useState } from 'react'
import PendingList from './pages/PendingList'
import ReviewPage from './pages/ReviewPage'
import SearchAnalysisPage from './pages/SearchAnalysisPage'

type Role = 'ROLE_HOD' | 'ROLE_RECTOR'
type View = 'PENDING' | 'REVIEW' | 'SEARCH'

function App() {
  const [view, setView] = useState<View>('PENDING')
  const [selectedWorkflowId, setSelectedWorkflowId] =
    useState<string | null>(null)
  const [role, setRole] = useState<Role>('ROLE_HOD')

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow p-4">
        <h1 className="text-xl font-bold">Workflow Portal</h1>

        <div className="mt-2 flex flex-wrap items-center gap-4 text-sm">
          <div className="flex gap-2 items-center">
            <span className="font-semibold">Chọn vai trò:</span>
            <button
              className={`px-2 py-1 rounded border ${role === 'ROLE_HOD' ? 'bg-blue-100 border-blue-400' : 'border-gray-300'}`}
              onClick={() => {
                setRole('ROLE_HOD')
                setView('PENDING')
                setSelectedWorkflowId(null)
              }}
            >
              HoD (Cấp 1)
            </button>
            <button
              className={`px-2 py-1 rounded border ${role === 'ROLE_RECTOR' ? 'bg-green-100 border-green-400' : 'border-gray-300'}`}
              onClick={() => {
                setRole('ROLE_RECTOR')
                setView('PENDING')
                setSelectedWorkflowId(null)
              }}
            >
              Principal (Cấp cuối)
            </button>
          </div>

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

        <div className="mt-3 text-sm text-gray-700">
          {role === 'HOD' ? (
            <ul className="list-disc ml-5">
              <li>Duyệt Level 1: kiểm tra nội dung, CLO, AI change detection</li>
              <li>Quyết định: Approve → chuyển AA; Reject/Require Edit → trả Lecturer</li>
              <li>Quản lý review: mở/đóng collaborative review; tổng hợp góp ý</li>
              <li>Tra cứu trong khoa, so sánh syllabus theo năm</li>
            </ul>
          ) : (
            <ul className="list-disc ml-5">
              <li>Duyệt cuối: xem báo cáo tổng hợp, đánh giá tác động</li>
              <li>Quyết định: Approve → cho phép công bố; Reject → trả về AA</li>
              <li>Giám sát KPI hệ thống, báo cáo tổng quan</li>
              <li>Không chỉnh sửa syllabus</li>
            </ul>
          )}
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
            role={role}
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
