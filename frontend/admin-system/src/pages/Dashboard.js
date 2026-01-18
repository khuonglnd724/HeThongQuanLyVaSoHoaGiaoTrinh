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
                    <h2>SMD Admin</h2>
                </div>
                <nav className="sidebar-nav">
                    <Link to="/dashboard" className="nav-item active">
                        <span className="icon">📊</span>
                        <span>Dashboard</span>
                    </Link>
                    <Link to="/services" className="nav-item">
                        <span className="icon">⚙️</span>
                        <span>Services</span>
                    </Link>
                    <div className="nav-divider"></div>
                    <Link to="/users" className="nav-item">
                        <span className="icon">👥</span>
                        <span>User Management</span>
                    </Link>
                    <Link to="/roles" className="nav-item">
                        <span className="icon">🔐</span>
                        <span>Roles & Permissions</span>
                    </Link>
                </nav>
                <div className="sidebar-footer">
                    <button className="btn btn-logout" onClick={handleLogout}>
                        <span className="icon">🚪</span>
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                {/* Header */}
                <header className="header">
                    <h1>Dashboard</h1>
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
                                <p>Total Services</p>
                            </div>
                        </div>
                        
                        <div className="stat-card stat-success">
                            <div className="stat-icon">✅</div>
                            <div className="stat-info">
                                <h3>{upServices}</h3>
                                <p>Services Up</p>
                            </div>
                        </div>
                        
                        <div className="stat-card stat-danger">
                            <div className="stat-icon">❌</div>
                            <div className="stat-info">
                                <h3>{downServices}</h3>
                                <p>Services Down</p>
                            </div>
                        </div>
                        
                        <div className="stat-card stat-warning">
                            <div className="stat-icon">👥</div>
                            <div className="stat-info">
                                <h3>1</h3>
                                <p>Active Users</p>
                            </div>
                        </div>
                    </div>

                    {/* Services Table */}
                    <div className="card">
                        <div className="card-header">
                            <h2>Registered Services</h2>
                        </div>
                        <div className="card-body">
                            {loading ? (
                                <p>Loading services...</p>
                            ) : error ? (
                                <p className="error">{error}</p>
                            ) : (
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Service Name</th>
                                            <th>Status</th>
                                            <th>Instances</th>
                                            <th>Health</th>
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
                                                                {status}
                                                            </span>
                                                        </td>
                                                        <td>{instances.length}</td>
                                                        <td>{upCount}/{instances.length} UP</td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan="4" style={{textAlign: 'center'}}>No services found</td>
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
