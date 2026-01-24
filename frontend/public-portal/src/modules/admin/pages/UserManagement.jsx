import React, { useState, useEffect } from 'react'
import { Plus, Upload, Lock, Trash2, Eye, Users, Pencil } from 'lucide-react'

export default function UserManagement() {
  const [activeTab, setActiveTab] = useState('create')
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({ 
    RECTOR: { email: '', name: '', phone: '', password: '', confirmPassword: '' },
    LECTURER: { email: '', name: '', phone: '', password: '', confirmPassword: '' }, 
    HOD: { email: '', name: '', phone: '', password: '', confirmPassword: '' }, 
    ACADEMIC: { email: '', name: '', phone: '', password: '', confirmPassword: '' }, 
    STUDENT: { email: '', name: '', phone: '', password: '', confirmPassword: '' } 
  })
  const [showPassword, setShowPassword] = useState({ RECTOR: false, LECTURER: false, HOD: false, ACADEMIC: false, STUDENT: false })
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredUsers, setFilteredUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editFormData, setEditFormData] = useState({ email: '', fullName: '', phoneNumber: '', roles: [], password: '', confirmPassword: '' })
  const [showEditPassword, setShowEditPassword] = useState(false)
  const [showDetailPassword, setShowDetailPassword] = useState(false)
  const [csvFile, setCsvFile] = useState(null)
  const [csvImporting, setCsvImporting] = useState(false)
  const [csvResults, setCsvResults] = useState(null)

  // Lấy danh sách người dùng
  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      console.log('[UserManagement] Fetching users...')
      console.log('[UserManagement] Token:', token ? `${token.substring(0, 20)}...` : 'NOT FOUND')
      
      if (!token) {
        throw new Error('Chưa đăng nhập. Vui lòng đăng nhập lại.')
      }
      
      const response = await fetch('/api/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      console.log('[UserManagement] Response status:', response.status)
      
      if (response.status === 401) {
        throw new Error('Token hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.')
      }
      
      if (!response.ok) throw new Error(`API Error: ${response.status}`)
      
      const data = await response.json()
      console.log('[UserManagement] Data received:', data)
      
      let users = Array.isArray(data) ? data : data.content || []
      if (users.length > 0) {
        console.log('[UserManagement] First user sample:', users[0])
        console.log('[UserManagement] All properties:', Object.keys(users[0]))
        console.log('[UserManagement] First user roles:', users[0].roles, 'type:', typeof users[0].roles)
        users.forEach((user, idx) => {
          console.log(`[UserManagement] User ${idx}: ${user.email} - roles:`, user.roles)
        })
      }
      
      setUsers(users)
      setFilteredUsers(users)
      setError(null)
    } catch (err) {
      console.error('Lỗi:', err)
      setError(err.message)
      
      // Mock data nếu API không hoạt động
      const mockUsers = [
        { id: 1, email: 'teacher1@smd.edu.vn', name: 'Nguyễn Văn A', role: 'Giáo viên', status: 'Hoạt động' },
        { id: 2, email: 'hod@smd.edu.vn', name: 'Trần Thị B', role: 'Trưởng bộ môn', status: 'Hoạt động' }
      ]
      setUsers(mockUsers)
      setFilteredUsers(mockUsers)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (role) => {
    const roleFormData = formData[role]
    
    // Validate input
    if (!roleFormData.email || !roleFormData.name || !roleFormData.password || !roleFormData.confirmPassword) {
      alert('Vui lòng điền đầy đủ: Email, Tên, Mật khẩu, Xác nhận mật khẩu')
      return
    }
    
    // Validate phone (optional but if provided must be valid)
    if (roleFormData.phone && !/^[0-9]{10,11}$/.test(roleFormData.phone)) {
      alert('Số điện thoại không hợp lệ (phải là 10-11 chữ số)')
      return
    }
    
    if (!roleFormData.email.includes('@')) {
      alert('Email không hợp lệ')
      return
    }
    
    if (roleFormData.password.length < 6) {
      alert('Mật khẩu phải tối thiểu 6 ký tự')
      return
    }
    
    if (roleFormData.password !== roleFormData.confirmPassword) {
      alert('Mật khẩu xác nhận không khớp')
      return
    }
    
    if (!role) {
      alert('Vui lòng chọn vai trò')
      return
    }

    try {
      const token = localStorage.getItem('token')
      console.log('[UserManagement] Creating user:', {
        email: roleFormData.email,
        fullName: roleFormData.name,
        role: role
      })
      
      // Map role to roleIds (database role IDs)
      // From auth_db: ROLE_RECTOR=2, ROLE_HOD=4, ROLE_ACADEMIC_AFFAIRS=3, ROLE_LECTURER=5, ROLE_STUDENT=6
      const roleIdMap = {
        'RECTOR': [2],        // ROLE_RECTOR
        'LECTURER': [5],      // ROLE_LECTURER
        'HOD': [4],           // ROLE_HOD
        'ACADEMIC': [3],      // ROLE_ACADEMIC_AFFAIRS
        'STUDENT': [6]        // ROLE_STUDENT
      }
      const roleIds = roleIdMap[role] || []
      
      if (roleIds.length === 0) {
        alert('Vai trò không hợp lệ')
        return
      }
      
      // Send to API with correct format per RegisterRequest
      const payload = {
        username: roleFormData.email.split('@')[0], // Generate username from email
        email: roleFormData.email,
        fullName: roleFormData.name,
        password: roleFormData.password,
        phoneNumber: roleFormData.phone || '', // Include phone number
        roleIds: roleIds
      }
      
      console.log('[UserManagement] API Payload:', payload)
      
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      })
      
      console.log('[UserManagement] Response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('[UserManagement] Error response:', errorData)
        throw new Error(errorData.message || `Lỗi: ${response.status}`)
      }
      
      const result = await response.json()
      console.log('[UserManagement] User created successfully:', result)
      
      alert(`✅ Tạo tài khoản thành công!\nEmail: ${roleFormData.email}\nTên: ${roleFormData.name}\nVai trò: ${role}`)
      setFormData({ ...formData, [role]: { email: '', name: '', phone: '', password: '', confirmPassword: '' } })
      fetchUsers() // Refresh danh sách
    } catch (err) {
      console.error('[UserManagement] Create user error:', err)
      alert(`❌ Lỗi tạo tài khoản: ${err.message}`)
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Xác nhận xóa người dùng này?')) return
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/users/${userId}`, { 
        method: 'DELETE',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      })
      if (!response.ok) throw new Error('Lỗi xóa người dùng')
      alert('Xóa thành công')
      fetchUsers()
    } catch (err) {
      alert('Lỗi: ' + err.message)
    }
  }

  const handleLockUser = async (userId, isLocked) => {
    const action = isLocked ? 'unlock' : 'lock'
    const actionText = isLocked ? 'mở khóa' : 'khóa'
    
    if (!window.confirm(`Xác nhận ${actionText} người dùng này?`)) return
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/users/${userId}/${action}`, { 
        method: 'PUT',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      })
      if (!response.ok) throw new Error(`Lỗi ${actionText} người dùng`)
      alert(`${actionText.charAt(0).toUpperCase() + actionText.slice(1)} người dùng thành công`)
      fetchUsers()
    } catch (err) {
      alert('Lỗi: ' + err.message)
    }
  }
  
  const handleViewDetail = (user) => {
    setSelectedUser(user)
    setShowDetailModal(true)
    setShowDetailPassword(false)
  }

  const handleEditUser = (user) => {
    setSelectedUser(user)
    setEditFormData({
      email: user.email || '',
      fullName: user.fullName || '',
      phoneNumber: user.phoneNumber || '',
      roles: user.roles || [],
      password: '',
      confirmPassword: ''
    })
    setShowEditPassword(false)
    setShowEditModal(true)
  }

  const handleUpdateUser = async () => {
    if (!editFormData.email || !editFormData.fullName) {
      alert('Vui lòng điền đầy đủ: Email, Tên')
      return
    }

    if (!/^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(editFormData.email)) {
      alert('Email không hợp lệ')
      return
    }

    if (editFormData.phoneNumber && !/^[0-9]{10,11}$/.test(editFormData.phoneNumber)) {
      alert('Số điện thoại không hợp lệ (phải là 10-11 chữ số)')
      return
    }

    // Validate password if provided
    if (editFormData.password || editFormData.confirmPassword) {
      if (editFormData.password.length < 6) {
        alert('Mật khẩu phải tối thiểu 6 ký tự')
        return
      }
      if (editFormData.password !== editFormData.confirmPassword) {
        alert('Mật khẩu xác nhận không khớp')
        return
      }
    }

    try {
      const token = localStorage.getItem('token')
      
      const payload = {
        email: editFormData.email,
        fullName: editFormData.fullName,
        phoneNumber: editFormData.phoneNumber || ''
      }

      // Add password if user wants to change it
      if (editFormData.password) {
        payload.password = editFormData.password
      }
      
      console.log('[UserManagement] Updating user:', selectedUser.userId, payload)
      
      const response = await fetch(`/api/users/${selectedUser.userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Lỗi: ${response.status}`)
      }
      
      alert('✅ Cập nhật tài khoản thành công!')
      setShowEditModal(false)
      fetchUsers()
    } catch (err) {
      console.error('[UserManagement] Update user error:', err)
      alert(`❌ Lỗi cập nhật: ${err.message}`)
    }
  }

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase()
    setSearchTerm(e.target.value)
    const filtered = users.filter(user =>
      user.email.toLowerCase().includes(term) || user.name.toLowerCase().includes(term)
    )
    setFilteredUsers(filtered)
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setCsvFile(file)
    }
  }

  const downloadSampleCSV = () => {
    const sampleData = 'email,fullName,phoneNumber,role,password,confirmPassword\nnguyenvana@smd.edu.vn,Nguyễn Văn A,0987654321,LECTURER,Lecturer@123,Lecturer@123\ntranthib@smd.edu.vn,Trần Thị B,0976543210,LECTURER,Lecturer@123,Lecturer@123'
    const blob = new Blob([sampleData], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sample_users.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleCSVUpload = async () => {
    if (!csvFile) {
      alert('Vui lòng chọn file CSV')
      return
    }

    setCsvImporting(true)
    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const csv = e.target.result
        const lines = csv.split('\n').filter(line => line.trim())
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
        
        const results = { success: 0, failed: 0, errors: [] }
        const token = localStorage.getItem('token')

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim())
          if (values.length < 4) continue

          const userData = {}
          headers.forEach((header, index) => {
            userData[header] = values[index]
          })

          try {
            const roleMap = {
              'RECTOR': [2],
              'LECTURER': [5],
              'HOD': [4],
              'ACADEMIC': [3],
              'STUDENT': [6]
            }

            const payload = {
              username: userData.email.split('@')[0],
              email: userData.email,
              fullName: userData.fullname || userData.fullName,
              password: userData.password,
              phoneNumber: userData.phonenumber || userData.phoneNumber || '',
              roleIds: roleMap[userData.role] || [6]
            }

            const response = await fetch('/api/users', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify(payload)
            })

            if (response.ok) {
              results.success++
            } else {
              results.failed++
              const error = await response.text()
              results.errors.push(`Dòng ${i+1}: ${userData.email} - ${error}`)
            }
          } catch (err) {
            results.failed++
            results.errors.push(`Dòng ${i+1}: ${userData.email} - ${err.message}`)
          }
        }

        setCsvResults(results)
        fetchUsers()
        setCsvImporting(false)
      }
      reader.readAsText(csvFile)
    } catch (err) {
      alert('Lỗi đọc file: ' + err.message)
      setCsvImporting(false)
    }
  }

  // Map role names to Vietnamese labels
  const getRoleLabel = (roleOrId) => {
    const roleMap = {
      'ROLE_ADMIN': 'Quản trị viên',
      'ROLE_RECTOR': 'Hiệu trưởng',
      'ROLE_ACADEMIC_AFFAIRS': 'Phòng Đào tạo',
      'ROLE_HOD': 'Trưởng bộ môn',
      'ROLE_LECTURER': 'Giáo viên',
      'ROLE_STUDENT': 'Sinh viên',
      'ROLE_COUNCIL_MEMBER': 'Thành viên hội đồng',
      // Fallback for string numeric IDs
      '1': 'Quản trị viên',
      '2': 'Hiệu trưởng',
      '3': 'Phòng Đào tạo',
      '4': 'Trưởng bộ môn',
      '5': 'Giáo viên',
      '6': 'Sinh viên',
      '7': 'Thành viên hội đồng'
    }
    
    // Handle array of roles (e.g., roles: ["ROLE_LECTURER"] or [5] or [{roleName: "ROLE_LECTURER"}])
    if (Array.isArray(roleOrId)) {
      if (roleOrId.length === 0) {
        console.warn('[getRoleLabel] Empty roles array - roles not loaded from backend')
        return 'Chưa được gán'
      }
      const firstRole = roleOrId[0]
      
      // Check if it's an object with roleName property
      if (typeof firstRole === 'object' && firstRole !== null && firstRole.roleName) {
        const result = roleMap[firstRole.roleName] || roleMap[firstRole.roleName.toUpperCase()] || firstRole.roleName
        console.log('[getRoleLabel] Object with roleName:', firstRole.roleName, '-> Label:', result)
        return result
      }
      
      // Try direct lookup, then uppercase, then toString
      let result = roleMap[firstRole]
      if (!result && typeof firstRole === 'string') {
        result = roleMap[firstRole.toUpperCase()]
      }
      if (!result && typeof firstRole === 'number') {
        result = roleMap[firstRole.toString()]
      }
      result = result || firstRole?.toString() || 'N/A'
      console.log('[getRoleLabel] Array role:', roleOrId, '-> Label:', result)
      return result
    }
    
    // Handle string or number role
    if (!roleOrId) return 'Chưa được gán'
    let result = roleMap[roleOrId]
    if (!result && typeof roleOrId === 'string') {
      result = roleMap[roleOrId.toUpperCase()]
    }
    if (!result && typeof roleOrId === 'number') {
      result = roleMap[roleOrId.toString()]
    }
    result = result || roleOrId?.toString() || 'Chưa được gán'
    console.log('[getRoleLabel] Single role:', roleOrId, '-> Label:', result)
    return result
  }

  const roles = [
    { value: 'RECTOR', label: 'Hiệu trưởng' },
    { value: 'LECTURER', label: 'Giáo viên' },
    { value: 'HOD', label: 'Trưởng bộ môn' },
    { value: 'ACADEMIC', label: 'Phòng Đào tạo' },
    { value: 'STUDENT', label: 'Sinh viên' }
  ]

  const tabs = [
    { id: 'create', label: 'Tạo tài khoản', icon: Plus },
    { id: 'import', label: 'Import từ CSV', icon: Upload },
    { id: 'manage', label: 'Quản lý tài khoản', icon: Users }
  ]

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="bg-white rounded-lg shadow border-b border-gray-200">
        <div className="flex overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-all border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {error && (
          <div className="mb-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 rounded">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center">
                  <div className="flex-shrink-0">⚠️</div>
                  <div className="ml-3">
                    <p className="text-sm font-medium">Lỗi kết nối API</p>
                    <p className="text-sm mt-1">{error}</p>
                    {error.includes('401') || error.includes('Token') ? (
                      <p className="text-sm mt-2 font-semibold">
                        Hiển thị dữ liệu mẫu. Hãy đăng nhập lại để truy cập dữ liệu thực.
                      </p>
                    ) : (
                      <p className="text-sm mt-2">Đang hiển thị dữ liệu mẫu.</p>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => window.location.href = '/login'}
                className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 whitespace-nowrap"
              >
                Đăng nhập lại
              </button>
            </div>
          </div>
        )}

        {loading && activeTab === 'manage' && (
          <div className="text-center py-8 text-gray-500">Đang tải dữ liệu...</div>
        )}

        {activeTab === 'create' && (
          <div>
            <h3 className="text-lg font-bold mb-4 text-gray-900">Tạo tài khoản mới</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {roles.map(role => (
                <div key={role.value} className="border-2 border-gray-200 rounded-lg p-5 hover:border-blue-300 transition-colors">
                  <h4 className="font-bold text-blue-600 mb-4">{role.label}</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        placeholder="user@smd.edu.vn"
                        value={formData[role.value].email}
                        onChange={(e) => setFormData({ ...formData, [role.value]: { ...formData[role.value], email: e.target.value } })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                      <input
                        type="text"
                        placeholder="Nguyễn Văn A"
                        value={formData[role.value].name}
                        onChange={(e) => setFormData({ ...formData, [role.value]: { ...formData[role.value], name: e.target.value } })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                      <input
                        type="tel"
                        placeholder="0912345678"
                        value={formData[role.value].phone}
                        onChange={(e) => setFormData({ ...formData, [role.value]: { ...formData[role.value], phone: e.target.value } })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                      <div className="relative">
                        <input
                          type={showPassword[role.value] ? 'text' : 'password'}
                          placeholder="Mật khẩu"
                          value={formData[role.value].password}
                          onChange={(e) => setFormData({ ...formData, [role.value]: { ...formData[role.value], password: e.target.value } })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword({ ...showPassword, [role.value]: !showPassword[role.value] })}
                          className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                        >
                          <Eye size={18} />
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu</label>
                      <div className="relative">
                        <input
                          type={showPassword[role.value] ? 'text' : 'password'}
                          placeholder="Xác nhận mật khẩu"
                          value={formData[role.value].confirmPassword}
                          onChange={(e) => setFormData({ ...formData, [role.value]: { ...formData[role.value], confirmPassword: e.target.value } })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword({ ...showPassword, [role.value]: !showPassword[role.value] })}
                          className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                        >
                          <Eye size={18} />
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCreateUser(role.value)}
                      type="button"
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 rounded-lg font-medium hover:shadow-lg transition-shadow"
                    >
                      Tạo tài khoản {role.label}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'import' && (
          <div>
            <h3 className="text-lg font-bold mb-4 text-gray-900">Import người dùng từ file</h3>
            <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center bg-blue-50">
              <Upload size={40} className="mx-auto text-blue-600 mb-2" />
              <p className="text-gray-700 mb-2">Kéo thả file hoặc nhấn để chọn</p>
              <p className="text-sm text-gray-500 mb-4">Hỗ trợ: CSV</p>
              <input 
                type="file" 
                accept=".csv" 
                id="csvInput"
                onChange={handleFileSelect}
                className="hidden" 
              />
              <button 
                type="button"
                onClick={() => document.getElementById('csvInput').click()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Chọn file {csvFile && `(${csvFile.name})`}
              </button>
            </div>
            <div className="mt-4 flex gap-3">
              <button 
                type="button"
                onClick={downloadSampleCSV}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 py-2 rounded-lg font-medium transition-colors"
              >
                Tải mẫu CSV
              </button>
              <button 
                type="button"
                onClick={handleCSVUpload}
                disabled={csvImporting}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-2 rounded-lg font-medium transition-colors"
              >
                {csvImporting ? 'Đang xử lý...' : 'Upload'}
              </button>
            </div>
            {csvResults && (
              <div className="mt-6 p-4 border rounded-lg bg-white">
                <h4 className="font-bold mb-3">Kết quả Import:</h4>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-3 bg-green-50 rounded">
                    <p className="text-green-700 font-semibold">✓ Thành công: {csvResults.success}</p>
                  </div>
                  <div className="p-3 bg-red-50 rounded">
                    <p className="text-red-700 font-semibold">✗ Thất bại: {csvResults.failed}</p>
                  </div>
                </div>
                {csvResults.errors.length > 0 && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-300 rounded max-h-48 overflow-y-auto">
                    <p className="font-semibold text-red-700 mb-2">Lỗi:</p>
                    {csvResults.errors.map((err, i) => (
                      <p key={i} className="text-sm text-red-600">{err}</p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'manage' && (
          <div>
            <h3 className="text-lg font-bold mb-4 text-gray-900">Danh sách người dùng ({filteredUsers.length})</h3>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Tìm kiếm theo email hoặc tên..."
                className="w-full md:w-1/2 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={fetchUsers}
                className="self-start md:self-auto px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium"
              >
                Làm mới
              </button>
            </div>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Đang tải dữ liệu...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Không có dữ liệu người dùng</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b-2 border-gray-300">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Email</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Tên</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Vai trò</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Điện thoại</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Trạng thái</th>
                      <th className="text-center px-4 py-3 font-semibold text-gray-700">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => (
                      <tr key={user.userId} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-gray-900">{user.email}</td>
                        <td className="px-4 py-3 text-gray-700">{user.fullName || 'N/A'}</td>
                        <td className="px-4 py-3">
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                            {getRoleLabel(user.roles)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-700">{user.phoneNumber || 'N/A'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            user.isLocked === true
                              ? 'bg-red-100 text-red-700'
                              : user.isActive === false
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {user.isLocked === true ? 'Đã khóa' : user.isActive === false ? 'Vô hiệu' : 'Hoạt động'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center space-x-2 flex justify-center">
                          <button 
                            onClick={() => handleViewDetail(user)}
                            className="p-2 hover:bg-blue-100 rounded-lg transition-colors" 
                            title="Xem chi tiết"
                          >
                            <Eye size={16} className="text-blue-600" />
                          </button>
                          <button 
                            onClick={() => handleEditUser(user)}
                            className="p-2 hover:bg-purple-100 rounded-lg transition-colors" 
                            title="Chỉnh sửa"
                          >
                            <Pencil size={16} className="text-purple-600" />
                          </button>
                          <button
                            onClick={() => handleLockUser(user.userId, user.isLocked)}
                            className={`p-2 rounded-lg transition-colors ${
                              user.isLocked 
                                ? 'hover:bg-green-100' 
                                : 'hover:bg-yellow-100'
                            }`}
                            title={user.isLocked ? "Mở khóa" : "Khóa"}
                          >
                            <Lock size={16} className={user.isLocked ? 'text-green-600' : 'text-yellow-600'} />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.userId)}
                            className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                            title="Xóa"
                          >
                            <Trash2 size={16} className="text-red-600" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Detail Modal */}
      {showDetailModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowDetailModal(false)}>
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4 text-gray-900">Chi tiết người dùng</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Email:</p>
                  <p className="font-medium text-gray-900">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tên đầy đủ:</p>
                  <p className="font-medium text-gray-900">{selectedUser.fullName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Username:</p>
                  <p className="font-medium text-gray-900">{selectedUser.username || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Số điện thoại:</p>
                  <p className="font-medium text-gray-900">{selectedUser.phoneNumber || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Vai trò:</p>
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    {getRoleLabel(selectedUser.roles)}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Trạng thái:</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    selectedUser.isLocked === true
                      ? 'bg-red-100 text-red-700'
                      : selectedUser.isActive === false
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {selectedUser.isLocked === true ? 'Đã khóa' : selectedUser.isActive === false ? 'Vô hiệu' : 'Hoạt động'}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ngày tạo:</p>
                  <p className="font-medium text-gray-900">{selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Đăng nhập lần cuối:</p>
                  <p className="font-medium text-gray-900">{selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString('vi-VN') : 'Chưa đăng nhập'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-600">Mật khẩu:</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="font-medium text-gray-900">
                      {showDetailPassword ? (selectedUser.password || '••••••••') : '••••••••'}
                    </p>
                    <button
                      onClick={() => setShowDetailPassword(!showDetailPassword)}
                      className="text-gray-600 hover:text-gray-900 transition-colors"
                      title={showDetailPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
                    >
                      <Eye size={18} />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">(Mật khẩu được mã hóa trong cơ sở dữ liệu)</p>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg font-medium transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowEditModal(false)}>
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4 text-gray-900">Chỉnh sửa tài khoản người dùng</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                <input
                  type="text"
                  value={editFormData.fullName}
                  onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                <input
                  type="tel"
                  value={editFormData.phoneNumber}
                  onChange={(e) => setEditFormData({ ...editFormData, phoneNumber: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
                <p className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-700">
                  {getRoleLabel(editFormData.roles)} (Không thể thay đổi vai trò)
                </p>
              </div>
              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <input
                    type="checkbox"
                    checked={showEditPassword}
                    onChange={(e) => setShowEditPassword(e.target.checked)}
                    className="mr-2"
                  />
                  Đổi mật khẩu
                </label>
              </div>
              {showEditPassword && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
                    <div className="relative">
                      <input
                        type={showEditPassword ? 'text' : 'password'}
                        value={editFormData.password}
                        onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                        placeholder="Nhập mật khẩu mới"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowEditPassword(!showEditPassword)}
                        className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                      >
                        <Eye size={18} />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu</label>
                    <input
                      type={showEditPassword ? 'text' : 'password'}
                      value={editFormData.confirmPassword}
                      onChange={(e) => setEditFormData({ ...editFormData, confirmPassword: e.target.value })}
                      placeholder="Xác nhận mật khẩu"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg font-medium transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleUpdateUser}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
