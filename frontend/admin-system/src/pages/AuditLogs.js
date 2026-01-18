import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getAuditLogs } from '../utils/api';

function AuditLogs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(0);
    const [filterAction, setFilterAction] = useState('ALL');
    const navigate = useNavigate();

    useEffect(() => {
        if (!localStorage.getItem('token')) {
            navigate('/');
            return;
        }
        loadLogs();
    }, [navigate, page]);

    const loadLogs = async () => {
        try {
            const data = await getAuditLogs(page, 50);
            setLogs(data.content || []);
        } catch (err) {
            setError('Failed to load audit logs');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    const filteredLogs = filterAction === 'ALL' 
        ? logs 
        : logs.filter(log => log.action === filterAction);

    const actionTypes = [...new Set(logs.map(log => log.action))];

    const getActionColor = (action) => {
        if (action.includes('LOGIN')) return 'success';
        if (action.includes('CREATED')) return 'info';
        if (action.includes('UPDATED')) return 'warning';
        if (action.includes('DELETED')) return 'danger';
        return 'secondary';
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
                    <Link to="/monitoring" className="nav-item">
                        <span className="icon">📈</span>
                        <span>Monitoring</span>
                    </Link>
                    <Link to="/audit-logs" className="nav-item active">
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
                    <h1>Audit Logs</h1>
                    <div className="header-actions">
                        <button className="btn btn-secondary btn-sm">
                            📥 Export
                        </button>
                        <button className="btn btn-icon" onClick={loadLogs} title="Refresh">
                            🔄
                        </button>
                    </div>
                </header>

                <div className="content">
                    {error && <div className="error-message">{error}</div>}

                    {/* Statistics */}
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon">📝</div>
                            <div className="stat-info">
                                <h3>{logs.length}</h3>
                                <p>Total Events</p>
                            </div>
                        </div>
                        
                        <div className="stat-card stat-success">
                            <div className="stat-icon">🔐</div>
                            <div className="stat-info">
                                <h3>{logs.filter(l => l.action.includes('LOGIN')).length}</h3>
                                <p>Login Events</p>
                            </div>
                        </div>
                        
                        <div className="stat-card stat-info">
                            <div className="stat-icon">➕</div>
                            <div className="stat-info">
                                <h3>{logs.filter(l => l.action.includes('CREATED')).length}</h3>
                                <p>Create Events</p>
                            </div>
                        </div>
                        
                        <div className="stat-card stat-warning">
                            <div className="stat-icon">✏️</div>
                            <div className="stat-info">
                                <h3>{logs.filter(l => l.action.includes('UPDATED')).length}</h3>
                                <p>Update Events</p>
                            </div>
                        </div>
                    </div>

                    {/* Filter Buttons */}
                    <div className="card">
                        <div className="card-header">
                            <h2>Activity Log</h2>
                            <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                                <button 
                                    className={`btn btn-sm ${filterAction === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
                                    onClick={() => setFilterAction('ALL')}
                                >
                                    All
                                </button>
                                {actionTypes.map(action => (
                                    <button 
                                        key={action}
                                        className={`btn btn-sm ${filterAction === action ? 'btn-primary' : 'btn-secondary'}`}
                                        onClick={() => setFilterAction(action)}
                                    >
                                        {action.replace(/_/g, ' ')}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="card-body">
                            {loading ? (
                                <p>Loading audit logs...</p>
                            ) : (
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Timestamp</th>
                                            <th>User</th>
                                            <th>Action</th>
                                            <th>Description</th>
                                            <th>IP Address</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredLogs.length > 0 ? (
                                            filteredLogs.map((log) => (
                                                <tr key={log.id}>
                                                    <td>{new Date(log.timestamp).toLocaleString()}</td>
                                                    <td><strong>{log.user}</strong></td>
                                                    <td>
                                                        <span className={`badge badge-${getActionColor(log.action)}`}>
                                                            {log.action}
                                                        </span>
                                                    </td>
                                                    <td>{log.description}</td>
                                                    <td>{log.ipAddress}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" style={{textAlign: 'center'}}>
                                                    No logs found
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>

                    {/* Timeline View */}
                    <div className="card">
                        <div className="card-header">
                            <h2>Recent Activity Timeline</h2>
                        </div>
                        <div className="card-body">
                            <div className="timeline">
                                {filteredLogs.slice(0, 10).map((log, idx) => (
                                    <div key={log.id} className="timeline-item">
                                        <div className="timeline-marker"></div>
                                        <div className="timeline-content">
                                            <div className="timeline-header">
                                                <strong>{log.user}</strong>
                                                <span className="timeline-time">{new Date(log.timestamp).toLocaleString()}</span>
                                            </div>
                                            <div className="timeline-body">
                                                <span className={`badge badge-${getActionColor(log.action)}`}>
                                                    {log.action}
                                                </span>
                                                <p>{log.description}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default AuditLogs;
