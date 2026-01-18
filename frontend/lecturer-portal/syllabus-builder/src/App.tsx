import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";

import SyllabusListPage from "./features/syllabus-list/SyllabusListPage";
import SyllabusEditorPage from "./features/syllabus-editor/SyllabusEditorPage";
import SyllabusComparePage from "./features/syllabus-compare/SyllabusComparePage";
import NotificationPage from "./features/notifications/NotificationPage";

import "./App.css";

function Layout() {
  const navigate = useNavigate();

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>Quản Lý Giáo Trình Học Thuật</h1>

          <div className="header-actions">
            <button
              className="btn-stats"
              onClick={() => navigate("/")}
            >
              📋 Danh sách
            </button>

            <button
              className="btn-notifications"
              onClick={() => navigate("/notifications")}
            >
              🔔 Thông báo
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<SyllabusListPage />} />
          <Route path="/syllabus/new" element={<SyllabusEditorPage mode="create" />} />
          <Route path="/syllabus/:id" element={<SyllabusEditorPage mode="edit" />} />
          <Route path="/syllabus/:rootId/compare" element={<SyllabusComparePage />} />
          <Route path="/notifications" element={<NotificationPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}
