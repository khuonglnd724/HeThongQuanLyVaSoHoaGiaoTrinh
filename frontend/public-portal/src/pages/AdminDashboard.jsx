import React from 'react'
import { Link } from 'react-router-dom'

const AdminDashboard = ({ user, onLogout }) => (
  <div className="p-6">
    <h1 className="text-2xl font-bold">Admin Dashboard</h1>
    <p className="mt-2 text-gray-700">Welcome, {user?.name || 'Admin'}</p>
    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
      <Link to="/admin/users" className="border rounded p-4 hover:bg-gray-50">
        <h3 className="font-semibold">User Management</h3>
        <p className="text-sm text-gray-600">Tạo/Import người dùng, RBAC, khóa/mở, reset mật khẩu</p>
      </Link>
      <Link to="/admin/system" className="border rounded p-4 hover:bg-gray-50">
        <h3 className="font-semibold">System Configuration</h3>
        <p className="text-sm text-gray-600">Năm học, học kỳ, khoa/bộ môn, workflow, templates</p>
      </Link>
      <Link to="/admin/publishing" className="border rounded p-4 hover:bg-gray-50">
        <h3 className="font-semibold">Publishing Management</h3>
        <p className="text-sm text-gray-600">Publish/Unpublish/Archive, ngày hiệu lực, phiên bản</p>
      </Link>
      <Link to="/admin/audit" className="border rounded p-4 hover:bg-gray-50">
        <h3 className="font-semibold">Audit & Monitoring</h3>
        <p className="text-sm text-gray-600">Log đăng nhập, chỉnh sửa, duyệt; xuất báo cáo</p>
      </Link>
    </div>
    <button onClick={onLogout} className="mt-6 px-4 py-2 bg-red-600 text-white rounded">Logout</button>
  </div>
)

export default AdminDashboard
