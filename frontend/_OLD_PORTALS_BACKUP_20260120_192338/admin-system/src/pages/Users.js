import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { fetchUsers, deleteUser, createUser, fetchRoles } from '../utils/api';

function Users() {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        fullName: '',
        roleIds: []
    });
    const navigate = useNavigate();

    useEffect(() => {
        if (!localStorage.getItem('token')) {
            navigate('/');
            return;
        }

        loadUsers();
        loadRoles();
    }, [navigate]);

    const loadUsers = async () => {
        try {
            const data = await fetchUsers();
            setUsers(data.content || []);
        } catch (err) {
            setError('Failed to load users');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadRoles = async () => {
        try {
            const data = await fetchRoles();
            // Filter out any roles with undefined roleId
            const validRoles = (data || []).filter(role => role && role.roleId !== undefined && role.roleId !== null);
            setRoles(validRoles);
        } catch (err) {
            console.error('Failed to load roles:', err);
            setRoles([]);
        }
    };

    const handleDelete = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;

        try {
            await deleteUser(userId);
            setUsers(users.filter(u => u.userId !== userId));
        } catch (err) {
            setError('Failed to delete user');
            console.error(err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const newUser = await createUser(formData);
            setUsers([...users, newUser]);
            setFormData({ username: '', email: '', password: '', fullName: '', roleIds: [] });
            setShowForm(false);
        } catch (err) {
            setError('Failed to create user');
            console.error(err);
        }
    };

    const handleRoleToggle = (roleId) => {
        setFormData(prev => {
            const roleIds = prev.roleIds.includes(roleId)
                ? prev.roleIds.filter(id => id !== roleId)
                : [...prev.roleIds, roleId];
            return { ...prev, roleIds };
        });
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    return (
        <div className="app-container">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <h2>Quản trị SMD</h2>
                </div>
                <nav className="sidebar-nav">
                    <Link to="/dashboard" className="nav-item">
                        <span className="icon">📊</span>
                        <span>Bảng điều khiển</span>
                    </Link>
                    <Link to="/services" className="nav-item">
                        <span className="icon">⚙️</span>
                        <span>Dịch vụ</span>
                    </Link>
                    <div className="nav-divider"></div>
                    <Link to="/users" className="nav-item active">
                        <span className="icon">👥</span>
                        <span>Quản lý người dùng</span>
                    </Link>
                    <Link to="/roles" className="nav-item">
                        <span className="icon">🔐</span>
                        <span>Vai trò & Quyền</span>
                    </Link>
                    <Link to="/publishing" className="nav-item">
                        <span className="icon">📤</span>
                        <span>Xuất bản</span>
                    </Link>
                    <Link to="/syllabus-management" className="nav-item">
                        <span className="icon">📚</span>
                        <span>Lưu trữ Giáo trình</span>
                    </Link>
                </nav>
                <div className="sidebar-footer">
                    <button className="btn btn-logout" onClick={handleLogout}>
                        <span className="icon">🚪</span>
                        <span>Đăng xuất</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                {/* Header */}
                <header className="header">
                    <h1>Quản lý Người dùng</h1>
                    <div className="header-actions">
                        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                            {showForm ? 'Hủy' : '+ Thêm Người dùng'}
                        </button>
                    </div>
                </header>

                {/* Content */}
                <div className="content">
                    {error && <div className="error-message">{error}</div>}

                    {showForm && (
                        <div className="card">
                            <div className="card-header">
                                <h2>Thêm Người dùng Mới</h2>
                            </div>
                            <div className="card-body">
                                <form onSubmit={handleSubmit} className="form">
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Tên đăng nhập</label>
                                            <input
                                                type="text"
                                                value={formData.username}
                                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Email</label>
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Mật khẩu</label>
                                            <input
                                                type="password"
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Họ và tên</label>
                                            <input
                                                type="text"
                                                value={formData.fullName}
                                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Chọn vai trò chính</label>
                                        <select
                                            value={formData.roleIds.length > 0 ? formData.roleIds[0] : ''}
                                            onChange={(e) => {
                                                const roleId = parseInt(e.target.value);
                                                setFormData({ ...formData, roleIds: roleId ? [roleId] : [] });
                                            }}
                                            className="form-control"
                                            required
                                        >
                                            <option value="">-- Chọn vai trò --</option>
                                            {roles.map(role => (
                                                <option key={`role-option-${role.roleId}`} value={role.roleId}>
                                                    {role.name} {role.description ? `- ${role.description}` : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <button type="submit" className="btn btn-primary">Tạo Người dùng</button>
                                </form>
                            </div>
                        </div>
                    )}

                    <div className="card">
                        <div className="card-header">
                            <h2>Danh sách Người dùng</h2>
                        </div>
                        <div className="card-body">
                            {loading ? (
                                <p>Đang tải người dùng...</p>
                            ) : (
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Tên đăng nhập</th>
                                            <th>Email</th>
                                            <th>Họ và tên</th>
                                            <th>Vai trò</th>
                                            <th>Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.length > 0 ? (
                                            users.map((user) => (
                                                <tr key={user.userId}>
                                                    <td>{user.userId}</td>
                                                    <td><strong>{user.username}</strong></td>
                                                    <td>{user.email}</td>
                                                    <td>{user.fullName}</td>
                                                    <td>
                                                        {user.roles?.map(role => (
                                                            <span key={role.roleId} className="badge badge-info">
                                                                {role.name}
                                                            </span>
                                                        ))}
                                                    </td>
                                                    <td>
                                                        <button 
                                                            className="btn btn-sm btn-danger"
                                                            onClick={() => handleDelete(user.userId)}
                                                        >
                                                            Xóa
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" style={{textAlign: 'center'}}>Không có người dùng nào</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Users;
