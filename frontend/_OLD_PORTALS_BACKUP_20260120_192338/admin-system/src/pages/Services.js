import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { fetchEurekaApps } from '../utils/api';

function Services() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

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
                    <Link to="/services" className="nav-item active">
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
                    <h1>Khám phá Dịch vụ</h1>
                    <div className="header-actions">
                        <button className="btn btn-primary" onClick={loadServices}>
                            🔄 Tải lại
                        </button>
                    </div>
                </header>

                {/* Content */}
                <div className="content">
                    {error && <div className="error-message">{error}</div>}

                    <div className="card">
                        <div className="card-header">
                            <h2>Các Phiên bản Dịch vụ</h2>
                        </div>
                        <div className="card-body">
                            {loading ? (
                                <p>Đang tải dịch vụ...</p>
                            ) : (
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Tên dịch vụ</th>
                                            <th>ID Instance</th>
                                            <th>Địa chỉ IP</th>
                                            <th>Cổng</th>
                                            <th>Trạng thái</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {services.length > 0 ? (
                                            services.map((service) => {
                                                const instances = service.instance || [];
                                                return instances.map((instance, idx) => (
                                                    <tr key={`${service.name}-${idx}`}>
                                                        {idx === 0 && (
                                                            <td rowSpan={instances.length}>
                                                                <strong>{service.name}</strong>
                                                            </td>
                                                        )}
                                                        <td>{instance.instanceId}</td>
                                                        <td>{instance.ipAddr}</td>
                                                        <td>{instance.port?.['$']}</td>
                                                        <td>
                                                            <span className={`badge badge-${instance.status === 'UP' ? 'success' : 'danger'}`}>
                                                                {instance.status === 'UP' ? 'Hoạt động' : 'Lỗi'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ));
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan="5" style={{textAlign: 'center'}}>Không có dịch vụ nào</td>
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

export default Services;
