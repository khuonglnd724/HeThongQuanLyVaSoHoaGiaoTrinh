import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { fetchEurekaApps } from '../utils/api';

function Dashboard() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const username = localStorage.getItem('username');

    useEffect(() => {
        if (!localStorage.getItem('token')) {
            navigate('/');
            return;
        }

        loadServices();
    }, [navigate]);

    const loadServices = async () => {
        try {
            const data = await fetchEurekaApps();
            if (data.applications && data.applications.application) {
                setServices(data.applications.application);
            }
        } catch (err) {
            setError('Failed to load services');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    const totalServices = services.length;
    const upServices = services.filter(s => 
        s.instance && s.instance.some(i => i.status === 'UP')
    ).length;
    const downServices = totalServices - upServices;

    return (
        <div className="app-container">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <h2>Quản trị SMD</h2>
                </div>
                <nav className="sidebar-nav">
                    <Link to="/dashboard" className="nav-item active">
                        <span className="icon">📊</span>
                        <span>Bảng điều khiển</span>
                    </Link>
                    <Link to="/services" className="nav-item">
                        <span className="icon">⚙️</span>
                        <span>Dịch vụ</span>
                    </Link>
                    <div className="nav-divider"></div>
                    <Link to="/users" className="nav-item">
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
                    <h1>Bảng điều khiển</h1>
                    <div className="header-actions">
                        <span className="user-info">{username}</span>
                        <button className="btn btn-icon" onClick={loadServices} title="Refresh">
                            🔄
                        </button>
                    </div>
                </header>

                {/* Content */}
                <div className="content">
                    {/* Statistics Cards */}
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon">🖥️</div>
                            <div className="stat-info">
                                <h3>{totalServices}</h3>
                                <p>Tổng số dịch vụ</p>
                            </div>
                        </div>
                        
                        <div className="stat-card stat-success">
                            <div className="stat-icon">✅</div>
                            <div className="stat-info">
                                <h3>{upServices}</h3>
                                <p>Dịch vụ hoạt động</p>
                            </div>
                        </div>
                        
                        <div className="stat-card stat-danger">
                            <div className="stat-icon">❌</div>
                            <div className="stat-info">
                                <h3>{downServices}</h3>
                                <p>Dịch vụ lỗi</p>
                            </div>
                        </div>
                        
                        <div className="stat-card stat-warning">
                            <div className="stat-icon">👥</div>
                            <div className="stat-info">
                                <h3>1</h3>
                                <p>Người dùng hoạt động</p>
                            </div>
                        </div>
                    </div>

                    {/* Services Table */}
                    <div className="card">
                        <div className="card-header">
                            <h2>Dịch vụ đã đăng ký</h2>
                        </div>
                        <div className="card-body">
                            {loading ? (
                                <p>Đang tải danh sách dịch vụ...</p>
                            ) : error ? (
                                <p className="error">{error}</p>
                            ) : (
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Tên dịch vụ</th>
                                            <th>Trạng thái</th>
                                            <th>Phiên bản chạy</th>
                                            <th>Sức khoẻ</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {services.length > 0 ? (
                                            services.map((service) => {
                                                const instances = service.instance || [];
                                                const upCount = instances.filter(i => i.status === 'UP').length;
                                                const status = upCount > 0 ? 'UP' : 'DOWN';
                                                
                                                return (
                                                    <tr key={service.name}>
                                                        <td><strong>{service.name}</strong></td>
                                                        <td>
                                                            <span className={`badge badge-${status === 'UP' ? 'success' : 'danger'}`}>
                                                                {status === 'UP' ? 'Hoạt động' : 'Lỗi'}
                                                            </span>
                                                        </td>
                                                        <td>{instances.length}</td>
                                                        <td>{upCount}/{instances.length} Hoạt động</td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan="4" style={{textAlign: 'center'}}>Không có dịch vụ nào</td>
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

export default Dashboard;
