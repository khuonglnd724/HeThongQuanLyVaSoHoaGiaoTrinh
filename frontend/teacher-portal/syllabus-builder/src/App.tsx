import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import SyllabusListPage from "./features/syllabus-list/SyllabusListPage";
import SyllabusEditorPage from "./features/syllabus-editor/SyllabusEditorPage";
import SyllabusComparePage from "./features/syllabus-compare/SyllabusComparePage";
import NotificationPage from "./features/notifications/NotificationPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Trang danh sách đề cương */}
        <Route path="/" element={<SyllabusListPage />} />

        {/* Tạo mới đề cương */}
        <Route
          path="/syllabus/new"
          element={<SyllabusEditorPage mode="create" />}
        />

        {/* Chỉnh sửa đề cương (tạo version mới) */}
        <Route
          path="/syllabus/:id"
          element={<SyllabusEditorPage mode="edit" />}
        />

        {/* So sánh các phiên bản */}
        <Route
          path="/syllabus/:rootId/compare"
          element={<SyllabusComparePage />}
        />

        {/* Thông báo */}
        <Route path="/notifications" element={<NotificationPage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
