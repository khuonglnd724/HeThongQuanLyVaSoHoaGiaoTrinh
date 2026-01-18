import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getSystemSettings, updateSemester } from '../utils/api';

function SystemSettings() {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingSemester, setEditingSemester] = useState(false);
    const [semesterForm, setSemesterForm] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        if (!localStorage.getItem('token')) {
            navigate('/');
            return;
        }
        loadSettings();
    }, [navigate]);

    const loadSettings = async () => {
        try {
            const data = await getSystemSettings();
            setSettings(data);
            setSemesterForm(data.semester);
        } catch (err) {
            setError('Failed to load settings');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSemesterUpdate = async (e) => {
        e.preventDefault();
        try {
            await updateSemester(semesterForm);
            setEditingSemester(false);
            loadSettings();
        } catch (err) {
            setError('Failed to update semester');
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
                    <Link to="/system-settings" className="nav-item active">
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
                    <h1>System Settings</h1>
                </header>

                <div className="content">
                    {error && <div className="error-message">{error}</div>}

                    {loading ? (
                        <p>Loading settings...</p>
                    ) : (
                        <>
                            {/* Semester Configuration */}
                            <div className="card">
                                <div className="card-header">
                                    <h2>Semester Configuration</h2>
                                    <button 
                                        className="btn btn-primary btn-sm"
                                        onClick={() => setEditingSemester(!editingSemester)}
                                    >
                                        {editingSemester ? 'Cancel' : 'Edit'}
                                    </button>
                                </div>
                                <div className="card-body">
                                    {editingSemester ? (
                                        <form onSubmit={handleSemesterUpdate} className="form">
                                            <div className="form-row">
                                                <div className="form-group">
                                                    <label>Semester Name</label>
                                                    <input
                                                        type="text"
                                                        value={semesterForm.name || ''}
                                                        onChange={(e) => setSemesterForm({...semesterForm, name: e.target.value})}
                                                        required
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>Semester Code</label>
                                                    <input
                                                        type="text"
                                                        value={semesterForm.code || ''}
                                                        onChange={(e) => setSemesterForm({...semesterForm, code: e.target.value})}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="form-row">
                                                <div className="form-group">
                                                    <label>Start Date</label>
                                                    <input
                                                        type="date"
                                                        value={semesterForm.startDate || ''}
                                                        onChange={(e) => setSemesterForm({...semesterForm, startDate: e.target.value})}
                                                        required
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>End Date</label>
                                                    <input
                                                        type="date"
                                                        value={semesterForm.endDate || ''}
                                                        onChange={(e) => setSemesterForm({...semesterForm, endDate: e.target.value})}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <button type="submit" className="btn btn-primary">Save Changes</button>
                                        </form>
                                    ) : (
                                        <table className="table">
                                            <tbody>
                                                <tr>
                                                    <th>Semester Name</th>
                                                    <td>{settings?.semester?.name}</td>
                                                </tr>
                                                <tr>
                                                    <th>Semester Code</th>
                                                    <td>{settings?.semester?.code}</td>
                                                </tr>
                                                <tr>
                                                    <th>Start Date</th>
                                                    <td>{settings?.semester?.startDate}</td>
                                                </tr>
                                                <tr>
                                                    <th>End Date</th>
                                                    <td>{settings?.semester?.endDate}</td>
                                                </tr>
                                                <tr>
                                                    <th>Status</th>
                                                    <td>
                                                        <span className={`badge badge-${settings?.semester?.isActive ? 'success' : 'danger'}`}>
                                                            {settings?.semester?.isActive ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </div>

                            {/* Workflow Configuration */}
                            <div className="card">
                                <div className="card-header">
                                    <h2>Workflow Configuration</h2>
                                </div>
                                <div className="card-body">
                                    <table className="table">
                                        <tbody>
                                            <tr>
                                                <th>Approval Levels</th>
                                                <td>{settings?.workflow?.approvalLevels?.join(' → ')}</td>
                                            </tr>
                                            <tr>
                                                <th>Auto Publish</th>
                                                <td>
                                                    <span className={`badge badge-${settings?.workflow?.autoPublish ? 'success' : 'secondary'}`}>
                                                        {settings?.workflow?.autoPublish ? 'Enabled' : 'Disabled'}
                                                    </span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <th>Require All Approvals</th>
                                                <td>
                                                    <span className={`badge badge-${settings?.workflow?.requireAllApprovals ? 'warning' : 'info'}`}>
                                                        {settings?.workflow?.requireAllApprovals ? 'Yes' : 'No'}
                                                    </span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <th>Notifications</th>
                                                <td>
                                                    <span className={`badge badge-${settings?.workflow?.notificationsEnabled ? 'success' : 'secondary'}`}>
                                                        {settings?.workflow?.notificationsEnabled ? 'Enabled' : 'Disabled'}
                                                    </span>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Templates */}
                            <div className="card">
                                <div className="card-header">
                                    <h2>Syllabus Templates</h2>
                                    <button className="btn btn-primary btn-sm">+ Add Template</button>
                                </div>
                                <div className="card-body">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Template Name</th>
                                                <th>Type</th>
                                                <th>Default</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {settings?.templates?.map((template) => (
                                                <tr key={template.id}>
                                                    <td><strong>{template.name}</strong></td>
                                                    <td>{template.type}</td>
                                                    <td>
                                                        {template.isDefault && (
                                                            <span className="badge badge-success">Default</span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <button className="btn btn-sm btn-secondary">Edit</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* System Info */}
                            <div className="card">
                                <div className="card-header">
                                    <h2>System Information</h2>
                                </div>
                                <div className="card-body">
                                    <table className="table">
                                        <tbody>
                                            <tr>
                                                <th>Version</th>
                                                <td>{settings?.systemInfo?.version}</td>
                                            </tr>
                                            <tr>
                                                <th>Environment</th>
                                                <td>
                                                    <span className="badge badge-success">
                                                        {settings?.systemInfo?.environment}
                                                    </span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <th>Build Date</th>
                                                <td>{settings?.systemInfo?.buildDate}</td>
                                            </tr>
                                            <tr>
                                                <th>Java Version</th>
                                                <td>{settings?.systemInfo?.javaVersion}</td>
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

export default SystemSettings;
