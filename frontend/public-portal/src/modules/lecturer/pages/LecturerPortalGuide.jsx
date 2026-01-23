import React from 'react'
import { BookOpen, FileText, Zap, Settings } from 'lucide-react'

const LecturerPortalGuide = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <BookOpen size={48} className="mx-auto text-blue-600 mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Cổng Giảng viên</h1>
          <p className="text-gray-600 text-lg">Xây dựng, quản lý và phê duyệt giáo trình</p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow p-6">
            <FileText size={32} className="text-blue-600 mb-3" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">📋 Quản lý Giáo trình</h3>
            <ul className="text-gray-600 space-y-1">
              <li>✓ Tạo giáo trình mới (bản nháp)</li>
              <li>✓ Chỉnh sửa và cập nhật phiên bản</li>
              <li>✓ Gửi để xem xét và phê duyệt</li>
              <li>✓ Theo dõi trạng thái xuất bản</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <FileText size={32} className="text-green-600 mb-3" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">📎 Tài liệu Giảng dạy</h3>
            <ul className="text-gray-600 space-y-1">
              <li>✓ Tải lên PDF, Word, TXT (tối đa 50MB)</li>
              <li>✓ Gắn tài liệu với giáo trình</li>
              <li>✓ Tải xuống tài liệu của bạn</li>
              <li>✓ Quản lý phiên bản tài liệu</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <Zap size={32} className="text-orange-600 mb-3" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">🔄 Workflow Phê duyệt</h3>
            <ul className="text-gray-600 space-y-1">
              <li>✓ Nháp → Xem xét → Phê duyệt</li>
              <li>✓ Nhận phản hồi từ reviewer</li>
              <li>✓ Sửa chữa theo gợi ý</li>
              <li>✓ Xuất bản cuối cùng</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <Settings size={32} className="text-purple-600 mb-3" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">💬 Bình luận & Phản hồi</h3>
            <ul className="text-gray-600 space-y-1">
              <li>✓ Bình luận chi tiết từng phần</li>
              <li>✓ Theo dõi các vấn đề (issues)</li>
              <li>✓ Trao đổi với reviewer</li>
              <li>✓ Lịch sử thay đổi</li>
            </ul>
          </div>
        </div>

        {/* Status Guide */}
        <div className="bg-white rounded-lg shadow p-6 mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📊 Trạng thái Giáo trình</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="border-l-4 border-gray-400 pl-4">
              <p className="font-semibold text-gray-900">📝 Nháp (DRAFT)</p>
              <p className="text-sm text-gray-600">Đang soạn thảo, chưa gửi</p>
            </div>
            <div className="border-l-4 border-yellow-400 pl-4">
              <p className="font-semibold text-gray-900">👀 Chờ Xem xét (PENDING_REVIEW)</p>
              <p className="text-sm text-gray-600">Đang được reviewer xem</p>
            </div>
            <div className="border-l-4 border-blue-400 pl-4">
              <p className="font-semibold text-gray-900">⏳ Chờ Phê duyệt (PENDING_APPROVAL)</p>
              <p className="text-sm text-gray-600">Reviewer hoàn tất, chờ approver</p>
            </div>
            <div className="border-l-4 border-green-400 pl-4">
              <p className="font-semibold text-gray-900">✅ Đã Duyệt (APPROVED)</p>
              <p className="text-sm text-gray-600">Được phê duyệt, sẵn sàng xuất bản</p>
            </div>
            <div className="border-l-4 border-purple-400 pl-4">
              <p className="font-semibold text-gray-900">📢 Đã Xuất bản (PUBLISHED)</p>
              <p className="text-sm text-gray-600">Công khai trên portal</p>
            </div>
            <div className="border-l-4 border-red-400 pl-4">
              <p className="font-semibold text-gray-900">❌ Bị Từ chối (REJECTED)</p>
              <p className="text-sm text-gray-600">Cần sửa chữa lại</p>
            </div>
          </div>
        </div>

        {/* Quick Start */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">🚀 Bắt đầu nhanh</h2>
          <ol className="text-gray-700 space-y-2">
            <li>1. Nhấp "Tạo mới" để tạo giáo trình bản nháp</li>
            <li>2. Điền thông tin cơ bản (mã môn, tên môn)</li>
            <li>3. Tải lên tài liệu giảng dạy (tuỳ chọn)</li>
            <li>4. Nhấp "Gửi để xem xét" khi hoàn tất</li>
            <li>5. Chờ phản hồi từ reviewer, sửa chữa nếu cần</li>
            <li>6. Sau khi được duyệt, giáo trình sẽ xuất bản</li>
          </ol>
        </div>
      </div>
    </div>
  )
}

export default LecturerPortalGuide
