import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getSystemHealth } from '../utils/api';

function Monitoring() {
    const [health, setHealth] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (!localStorage.getItem('token')) {
            navigate('/');
            return;
        }
        loadHealth();
        
        // Auto-refresh every 30 seconds
        const interval = setInterval(loadHealth, 30000);
        return () => clearInterval(interval);
    }, [navigate]);

    const loadHealth = async () => {
        try {
            const data = await getSystemHealth();
            setHealth(data);
            setError('');
        } catch (err) {
            setError('Failed to load system health');
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
            <aside className="sidebar">
                <div className="sidebar-header">
                    <h2>SMD Admin</h2>
                </div>
                <nav className="sidebar-nav">
                    <Link to="/dashboard" className="nav-item">
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
                    <div className="nav-divider"></div>
                    <Link to="/system-settings" className="nav-item">
                        <span className="icon">⚙️</span>
                        <span>System Settings</span>
                    </Link>
                    <Link to="/publishing" className="nav-item">
                        <span className="icon">📢</span>
                        <span>Publishing</span>
                    </Link>
                    <Link to="/monitoring" className="nav-item active">
                        <span className="icon">📈</span>
                        <span>Monitoring</span>
                    </Link>
                    <Link to="/audit-logs" className="nav-item">
                        <span className="icon">📋</span>
                        <span>Audit Logs</span>
                    </Link>
                </nav>
                <div className="sidebar-footer">
                    <button className="btn btn-logout" onClick={handleLogout}>
                        <span className="icon">🚪</span>
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            <main className="main-content">
                <header className="header">
                    <h1>System Monitoring</h1>
                    <div className="header-actions">
                        <button className="btn btn-primary" onClick={loadHealth}>
                            🔄 Refresh
                        </button>
                    </div>
                </header>

                <div className="content">
                    {error && <div className="error-message">{error}</div>}

                    {loading ? (
                        <p>Loading system health...</p>
                    ) : (
                        <>
                            {/* Overall System Status */}
                            <div className="card">
                                <div className="card-header">
                                    <h2>System Status</h2>
                                    <span className={`badge badge-${health?.status === 'UP' ? 'success' : 'danger'}`}>
                                        {health?.status}
                                    </span>
                                </div>
                                <div className="card-body">
                                    <div className="stats-grid">
                                        <div className="stat-card">
                                            <div className="stat-icon">💾</div>
                                            <div className="stat-info">
                                                <h3>{health?.database?.connections}/{health?.database?.maxConnections}</h3>
                                                <p>Database Connections</p>
                                            </div>
                                        </div>
                                        
                                        <div className="stat-card">
                                            <div className="stat-icon">🧠</div>
                                            <div className="stat-info">
                                                <h3>{health?.memory?.percentage}%</h3>
                                                <p>Memory Usage</p>
                                            </div>
                                        </div>
                                        
                                        <div className="stat-card">
                                            <div className="stat-icon">⏱️</div>
                                            <div className="stat-info">
                                                <h3>{health?.uptime}</h3>
                                                <p>System Uptime</p>
                                            </div>
                                        </div>
                                        
                                        <div className="stat-card stat-success">
                                            <div className="stat-icon">✅</div>
                                            <div className="stat-info">
                                                <h3>{health?.services?.filter(s => s.status === 'UP').length}/{health?.services?.length}</h3>
                                                <p>Services Healthy</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Memory Details */}
                            <div className="card">
                                <div className="card-header">
                                    <h2>Memory Usage</h2>
                                </div>
                                <div className="card-body">
                                    <table className="table">
                                        <tbody>
                                            <tr>
                                                <th>Used Memory</th>
                                                <td>{health?.memory?.used}</td>
                                            </tr>
                                            <tr>
                                                <th>Total Memory</th>
                                                <td>{health?.memory?.total}</td>
                                            </tr>
                                            <tr>
                                                <th>Usage Percentage</th>
                                                <td>
                                                    <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                                                        <div style={{
                                                            width: '200px', 
                                                            height: '20px', 
                                                            background: '#e5e7eb', 
                                                            borderRadius: '10px',
                                                            overflow: 'hidden'
                                                        }}>
                                                            <div style={{
                                                                width: `${health?.memory?.percentage}%`,
                                                                height: '100%',
                                                                background: health?.memory?.percentage > 80 ? '#ef4444' : 
                                                                           health?.memory?.percentage > 60 ? '#f59e0b' : '#10b981',
                                                                transition: 'width 0.3s'
                                                            }}></div>
                                                        </div>
                                                        <span>{health?.memory?.percentage}%</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Services Health */}
                            <div className="card">
                                <div className="card-header">
                                    <h2>Services Health</h2>
                                </div>
                                <div className="card-body">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Service Name</th>
                                                <th>Status</th>
                                                <th>Response Time</th>
                                                <th>Health</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {health?.services?.map((service, idx) => (
                                                <tr key={idx}>
                                                    <td><strong>{service.name}</strong></td>
                                                    <td>
                                                        <span className={`badge badge-${service.status === 'UP' ? 'success' : 'danger'}`}>
                                                            {service.status}
                                                        </span>
                                                    </td>
                                                    <td>{service.responseTime}</td>
                                                    <td>
                                                        <div style={{
                                                            width: '100px',
                                                            height: '10px',
                                                            background: service.status === 'UP' ? '#10b981' : '#ef4444',
                                                            borderRadius: '5px'
                                                        }}></div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Database Health */}
                            <div className="card">
                                <div className="card-header">
                                    <h2>Database Health</h2>
                                </div>
                                <div className="card-body">
                                    <table className="table">
                                        <tbody>
                                            <tr>
                                                <th>Status</th>
                                                <td>
                                                    <span className={`badge badge-${health?.database?.status === 'UP' ? 'success' : 'danger'}`}>
                                                        {health?.database?.status}
                                                    </span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <th>Active Connections</th>
                                                <td>{health?.database?.connections}</td>
                                            </tr>
                                            <tr>
                                                <th>Max Connections</th>
                                                <td>{health?.database?.maxConnections}</td>
                                            </tr>
                                            <tr>
                                                <th>Connection Usage</th>
                                                <td>
                                                    <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                                                        <div style={{
                                                            width: '200px',
                                                            height: '20px',
                                                            background: '#e5e7eb',
                                                            borderRadius: '10px',
                                                            overflow: 'hidden'
                                                        }}>
                                                            <div style={{
                                                                width: `${(health?.database?.connections / health?.database?.maxConnections * 100)}%`,
                                                                height: '100%',
                                                                background: '#10b981'
                                                            }}></div>
                                                        </div>
                                                        <span>{((health?.database?.connections / health?.database?.maxConnections * 100).toFixed(1))}%</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}

export default Monitoring;
