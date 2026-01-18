import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { fetchRoles, fetchPermissions } from '../utils/api';

function Roles() {
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (!localStorage.getItem('token')) {
            navigate('/');
            return;
        }

        loadData();
    }, [navigate]);

    const loadData = async () => {
        try {
            const [rolesData, permsData] = await Promise.all([
                fetchRoles(),
                fetchPermissions()
            ]);
            setRoles(rolesData || []);
            setPermissions(permsData || {});
        } catch (err) {
            setError('Failed to load roles and permissions');
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
                    <Link to="/roles" className="nav-item active">
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
                    <h1>Roles & Permissions</h1>
                </header>

                {/* Content */}
                <div className="content">
                    {error && <div className="error-message">{error}</div>}

                    {loading ? (
                        <p>Loading roles...</p>
                    ) : (
                        <>
                            <div className="card">
                                <div className="card-header">
                                    <h2>Available Roles</h2>
                                </div>
                                <div className="card-body">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Role Name</th>
                                                <th>Description</th>
                                                <th>Permissions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {roles.map(role => (
                                                <tr key={role.roleId}>
                                                    <td><strong>{role.name}</strong></td>
                                                    <td>{role.description || '-'}</td>
                                                    <td>
                                                        {role.permissions && role.permissions.map(perm => (
                                                            <span key={perm.permissionId} className="badge badge-info">
                                                                {perm.name}
                                                            </span>
                                                        ))}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="card" style={{marginTop: '20px'}}>
                                <div className="card-header">
                                    <h2>Permissions by Category</h2>
                                </div>
                                <div className="card-body">
                                    {Object.entries(permissions).map(([category, perms]) => (
                                        <div key={category} className="permission-category">
                                            <h4>{category.toUpperCase()}</h4>
                                            <div className="permission-tags">
                                                {perms.map(perm => (
                                                    <span key={perm} className="badge badge-secondary">
                                                        {perm}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}

export default Roles;
