import React, { useState, useEffect } from 'react'
import { Users, FileText, LogOut, CheckCircle, AlertCircle, Trash2, Edit2, Plus, X } from 'lucide-react'
import { userService, syllabusService } from '../../../services'

const AdminDashboard = ({ user, onLogout }) => {
  // State Management
  const [activeTab, setActiveTab] = useState('overview')
  const [users, setUsers] = useState([])
  const [pendingSyllabi, setPendingSyllabi] = useState([])
  const [showAddUser, setShowAddUser] = useState(false)
  const [showEditUser, setShowEditUser] = useState(false)
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'ROLE_STUDENT', password: '' })
  const [editingUser, setEditingUser] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Load data on mount
  useEffect(() => {
    loadUsers()
    loadPendingSyllabi()
  }, [])

  // Load users from API
  const loadUsers = async () => {
    try {
      setLoading(true)
      const data = await userService.getAllUsers()
      setUsers(Array.isArray(data) ? data : data.users || [])
    } catch (err) {
      console.error('Failed to load users:', err)
      setError('Failed to load users. Using demo data.')
      // Fallback to demo data
      setUsers([
        { id: 1, fullName: 'Admin User', email: 'admin@smd.edu.vn', roles: ['ROLE_ADMIN'], isActive: true },
        { id: 2, fullName: 'Nguyễn Văn A', email: 'lecturer1@smd.edu.vn', roles: ['ROLE_LECTURER'], isActive: true },
      ])
    } finally {
      setLoading(false)
    }
  }

  // Load pending syllabi from API
  const loadPendingSyllabi = async () => {
    try {
      const data = await syllabusService.getPendingSyllabi()
      setPendingSyllabi(Array.isArray(data) ? data : data.syllabi || [])
    } catch (err) {
      console.error('Failed to load syllabi:', err)
      // Fallback to demo data
      setPendingSyllabi([
        { id: 1, courseCode: 'CS-101', courseName: 'Lập trình C++', lecturerName: 'TS. Nguyễn Văn X', submittedDate: '2025-01-15' },
      ])
    }
  }

  // Role Display
  const getRoleDisplay = (role) => {
    const roleMap = {
      'ROLE_ADMIN': '🔐 Quản trị viên',
      'ROLE_HOD': '👔 Trưởng khoa',
      'ROLE_ACADEMIC_AFFAIRS': '🎓 Phòng Đào tạo',
      'ROLE_RECTOR': '🏆 Hiệu trưởng',
      'ROLE_STUDENT': '🎓 Sinh viên',
      'ROLE_LECTURER': '👨‍🏫 Giảng viên'
    }
    return roleMap[role] || role
  }

  // CRUD Operations
  const handleAddUser = async () => {
    if (newUser.name && newUser.email && newUser.password) {
      try {
        setLoading(true)
        const userData = {
          username: newUser.email.split('@')[0],
          email: newUser.email,
          fullName: newUser.name,
          password: newUser.password,
          roles: [newUser.role]
        }
        await userService.createUser(userData)
        await loadUsers() // Reload users list
        setNewUser({ name: '', email: '', role: 'ROLE_STUDENT', password: '' })
        setShowAddUser(false)
        setError('')
      } catch (err) {
        console.error('Failed to create user:', err)
        setError(err.message || 'Failed to create user')
      } finally {
        setLoading(false)
      }
    } else {
      setError('Please fill all fields')
    }
  }

  const handleDeleteUser = (id) => {
    setSelectedUserId(id)
    setShowDeleteModal(true)
  }

  const handleEditUser = (userToEdit) => {
    setEditingUser({
      id: userToEdit.userId || userToEdit.id,
      name: userToEdit.fullName || userToEdit.name,
      email: userToEdit.email,
      role: Array.isArray(userToEdit.roles) ? userToEdit.roles[0] : userToEdit.role,
      password: '' // Leave empty, only fill if changing password
    })
    setShowEditUser(true)
    setShowAddUser(false)
  }

  const handleUpdateUser = async () => {
    if (editingUser.name && editingUser.email) {
      try {
        setLoading(true)
        const updateData = {
          fullName: editingUser.name,
          email: editingUser.email,
          roles: [editingUser.role]
        }
        // Only include password if it's being changed
        if (editingUser.password && editingUser.password.trim() !== '') {
          updateData.password = editingUser.password
        }
        await userService.updateUser(editingUser.id, updateData)
        await loadUsers() // Reload users list
        setEditingUser(null)
        setShowEditUser(false)
        setError('')
      } catch (err) {
        console.error('Failed to update user:', err)
        setError(err.message || 'Failed to update user')
      } finally {
        setLoading(false)
      }
    } else {
      setError('Please fill required fields')
    }
  }

  const confirmDelete = async () => {
    try {
      setLoading(true)
      await userService.deleteUser(selectedUserId)
      await loadUsers() // Reload users list
      setShowDeleteModal(false)
      setSelectedUserId(null)
      setError('')
    } catch (err) {
      console.error('Failed to delete user:', err)
      setError(err.message || 'Failed to delete user')
      setShowDeleteModal(false)
    } finally {
      setLoading(false)
    }
  }

  const handleApproveSyllabus = async (id) => {
    try {
      setLoading(true)
      await syllabusService.approveSyllabus(id, 'Approved by admin')
      await loadPendingSyllabi() // Reload syllabi list
      setError('')
      alert('✅ Giáo trình đã được phê duyệt!')
    } catch (err) {
      console.error('Failed to approve syllabus:', err)
      setError(err.message || 'Failed to approve syllabus')
    } finally {
      setLoading(false)
    }
  }

  const handleRejectSyllabus = async (id) => {
    const reason = prompt('Lý do từ chối:')
    if (reason) {
      try {
        setLoading(true)
        await syllabusService.rejectSyllabus(id, reason)
        await loadPendingSyllabi() // Reload syllabi list
        setError('')
        alert('❌ Giáo trình đã bị từ chối!')
      } catch (err) {
        console.error('Failed to reject syllabus:', err)
        setError(err.message || 'Failed to reject syllabus')
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-md border-b border-gray-200">
        <div className="container mx-auto px-6 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">⚙️ Dashboard {getRoleDisplay(user?.role)}</h1>
            <p className="text-gray-600 mt-1">Xin chào, <span className="font-semibold">{user?.name}</span></p>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition font-medium"
          >
            <LogOut size={18} />
            Đăng xuất
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6">
          <div className="flex gap-8">
            {['overview', 'users', 'syllabi'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-4 font-medium border-b-2 transition ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab === 'overview' && '📊 Tổng quan'}
                {tab === 'users' && '👥 Quản lý người dùng'}
                {tab === 'syllabi' && '📋 Phê duyệt giáo trình'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-purple-500">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-600">Tổng giáo trình</h3>
                  <FileText size={24} className="text-purple-500" />
                </div>
                <p className="text-3xl font-bold text-purple-600">1,250</p>
                <p className="text-xs text-gray-600 mt-2">+12 hôm nay</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-blue-500">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-600">Người dùng</h3>
                  <Users size={24} className="text-blue-500" />
                </div>
                <p className="text-3xl font-bold text-blue-600">{users.length}</p>
                <p className="text-xs text-gray-600 mt-2">+{Math.floor(Math.random() * 10)} hôm nay</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-green-500">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-600">Chờ phê duyệt</h3>
                  <AlertCircle size={24} className="text-green-500" />
                </div>
                <p className="text-3xl font-bold text-green-600">{pendingSyllabi.length}</p>
                <p className="text-xs text-gray-600 mt-2">Cần xử lý</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-indigo-500">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-600">Phê duyệt</h3>
                  <CheckCircle size={24} className="text-indigo-500" />
                </div>
                <p className="text-3xl font-bold text-indigo-600">1,203</p>
                <p className="text-xs text-gray-600 mt-2">Hoàn thành</p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">📈 Hoạt động gần đây</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-l-4 border-green-500">
                  <div className="flex items-center gap-4">
                    <CheckCircle size={24} className="text-green-500" />
                    <div>
                      <p className="font-semibold text-gray-900">Giáo trình CS-101 được phê duyệt</p>
                      <p className="text-sm text-gray-600">bởi Admin - 15 phút trước</p>
                    </div>
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">Thành công</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                  <div className="flex items-center gap-4">
                    <Users size={24} className="text-blue-500" />
                    <div>
                      <p className="font-semibold text-gray-900">Người dùng mới được thêm</p>
                      <p className="text-sm text-gray-600">Tài khoản: lecturer@smd.edu.vn - 1 giờ trước</p>
                    </div>
                  </div>
                  <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold">Thêm mới</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">👥 Quản lý người dùng ({users.length})</h2>
              <button
                onClick={() => setShowAddUser(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
              >
                <Plus size={18} />
                Thêm người dùng
              </button>
            </div>

            {/* Add User Form */}
            {showAddUser && (
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-l-4 border-blue-600">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Thêm người dùng mới</h3>
                  <button onClick={() => setShowAddUser(false)} className="text-gray-500 hover:text-gray-700">
                    <X size={24} />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="Họ tên"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <input
                    type="password"
                    placeholder="Mật khẩu (bắt buộc)"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                  />
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="ROLE_STUDENT">Sinh viên</option>
                    <option value="ROLE_LECTURER">Giảng viên</option>
                    <option value="ROLE_ACADEMIC_AFFAIRS">Phòng Đào tạo</option>
                    <option value="ROLE_ADMIN">Quản trị viên</option>
                  </select>
                </div>
                {error && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
                    ⚠️ {error}
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={handleAddUser}
                    disabled={loading}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50"
                  >
                    {loading ? '⏳ Đang thêm...' : '✓ Thêm mới'}
                  </button>
                  <button
                    onClick={() => { setShowAddUser(false); setError('') }}
                    className="flex-1 bg-gray-300 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-400 transition font-medium"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            )}

            {/* Edit User Form */}
            {showEditUser && editingUser && (
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-l-4 border-yellow-600">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-gray-900">✏️ Chỉnh sửa người dùng</h3>
                  <button onClick={() => { setShowEditUser(false); setEditingUser(null); setError('') }} className="text-gray-500 hover:text-gray-700">
                    <X size={24} />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="Họ tên"
                    value={editingUser.name}
                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600"
                  />
                  <input
                    type="password"
                    placeholder="Mật khẩu mới (để trống nếu không đổi)"
                    value={editingUser.password}
                    onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600"
                  />
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600"
                  >
                    <option value="ROLE_STUDENT">Sinh viên</option>
                    <option value="ROLE_LECTURER">Giảng viên</option>
                    <option value="ROLE_ACADEMIC_AFFAIRS">Phòng Đào tạo</option>
                    <option value="ROLE_ADMIN">Quản trị viên</option>
                  </select>
                </div>
                {error && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
                    ⚠️ {error}
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={handleUpdateUser}
                    disabled={loading}
                    className="flex-1 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition font-medium disabled:opacity-50"
                  >
                    {loading ? '⏳ Đang cập nhật...' : '✓ Cập nhật'}
                  </button>
                  <button
                    onClick={() => { setShowEditUser(false); setEditingUser(null); setError('') }}
                    className="flex-1 bg-gray-300 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-400 transition font-medium"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            )}

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100 border-b border-gray-300">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-gray-900">Họ tên</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-900">Email</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-900">Vai trò</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-900">Trạng thái</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-900">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{u.name}</td>
                      <td className="px-6 py-4 text-gray-600">{u.email}</td>
                      <td className="px-6 py-4 text-gray-600">{getRoleDisplay(u.role)}</td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                          ✓ {u.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                        </span>
                      </td>
                      <td className="px-6 py-4 flex gap-2">
                        <button
                          onClick={() => handleEditUser(u)}
                          className="text-blue-600 hover:text-blue-800 transition"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="text-red-600 hover:text-red-800 transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SYLLABI TAB */}
        {activeTab === 'syllabi' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">📋 Phê duyệt giáo trình ({pendingSyllabi.length})</h2>

            <div className="space-y-4">
              {pendingSyllabi.length > 0 ? (
                pendingSyllabi.map((syllabus) => (
                  <div
                    key={syllabus.id}
                    className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500 hover:shadow-xl transition"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase">Mã giáo trình</p>
                        <p className="text-lg font-bold text-gray-900">{syllabus.code}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase">Tên giáo trình</p>
                        <p className="text-lg font-bold text-gray-900">{syllabus.name}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase">Giảng viên</p>
                        <p className="text-lg font-bold text-gray-900">{syllabus.lecturer}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase">Ngày gửi</p>
                        <p className="text-lg font-bold text-gray-900">{syllabus.submittedDate}</p>
                      </div>
                    </div>

                    <div className="flex gap-3 justify-end">
                      <button
                        onClick={() => handleApproveSyllabus(syllabus.id)}
                        className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition font-medium"
                      >
                        <CheckCircle size={18} />
                        Phê duyệt
                      </button>
                      <button
                        onClick={() => handleRejectSyllabus(syllabus.id)}
                        className="flex items-center gap-2 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition font-medium"
                      >
                        <AlertCircle size={18} />
                        Từ chối
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                  <CheckCircle size={48} className="mx-auto mb-4 text-green-500" />
                  <p className="text-xl font-semibold text-gray-900">Không có giáo trình chờ phê duyệt</p>
                  <p className="text-gray-600 mt-2">Tất cả giáo trình đã được xử lý!</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle size={32} className="text-red-600" />
              <h3 className="text-xl font-bold text-gray-900">Xác nhận xóa</h3>
            </div>
            <p className="text-gray-600 mb-6">Bạn có chắc muốn xóa người dùng này? Hành động này không thể hoàn tác.</p>
            <div className="flex gap-3">
              <button
                onClick={confirmDelete}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition font-medium"
              >
                ✓ Xóa
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 bg-gray-300 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-400 transition font-medium"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
