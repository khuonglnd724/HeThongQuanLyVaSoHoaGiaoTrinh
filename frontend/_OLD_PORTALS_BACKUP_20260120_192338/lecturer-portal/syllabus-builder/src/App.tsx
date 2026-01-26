import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";

import SyllabusListPage from "./features/syllabus-list/SyllabusListPage";
import SyllabusEditorPage from "./features/syllabus-editor/SyllabusEditorPage";
import SyllabusComparePage from "./features/syllabus-compare/SyllabusComparePage";
import NotificationPage from "./features/notifications/NotificationPage";

import "./App.css";

function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>Lecturer Portal</h1>

          <div className="header-actions">
            <button
              className={`btn-nav ${isActive("/") ? "active" : ""}`}
              onClick={() => navigate("/")}
            >
              📋 Danh sách
            </button>

            <button
              className={`btn-nav ${isActive("/notifications") ? "active" : ""}`}
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
