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
                    <h2>SMD Admin</h2>
                </div>
                <nav className="sidebar-nav">
                    <Link to="/dashboard" className="nav-item">
                        <span className="icon">📊</span>
                        <span>Dashboard</span>
                    </Link>
                    <Link to="/services" className="nav-item active">
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
                    <h1>Service Discovery</h1>
                    <div className="header-actions">
                        <button className="btn btn-primary" onClick={loadServices}>
                            🔄 Refresh
                        </button>
                    </div>
                </header>

                {/* Content */}
                <div className="content">
                    {error && <div className="error-message">{error}</div>}

                    <div className="card">
                        <div className="card-header">
                            <h2>Service Instances</h2>
                        </div>
                        <div className="card-body">
                            {loading ? (
                                <p>Loading services...</p>
                            ) : (
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Service Name</th>
                                            <th>Instance ID</th>
                                            <th>IP Address</th>
                                            <th>Port</th>
                                            <th>Status</th>
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
                                                                {instance.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ));
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan="5" style={{textAlign: 'center'}}>No services found</td>
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
