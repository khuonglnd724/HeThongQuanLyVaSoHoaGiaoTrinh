import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getPublishingStates, updatePublishingState } from '../utils/api';

function Publishing() {
    const [syllabuses, setSyllabuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterState, setFilterState] = useState('ALL');
    const navigate = useNavigate();

    useEffect(() => {
        if (!localStorage.getItem('token')) {
            navigate('/');
            return;
        }
        loadPublishingStates();
    }, [navigate]);

    const loadPublishingStates = async () => {
        try {
            const data = await getPublishingStates();
            setSyllabuses(data);
        } catch (err) {
            setError('Failed to load publishing states');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleStateChange = async (syllabusId, newState) => {
        if (!window.confirm(`Are you sure you want to change state to ${newState}?`)) return;

        try {
            await updatePublishingState(syllabusId, newState);
            loadPublishingStates();
        } catch (err) {
            setError('Failed to update publishing state');
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    const filteredSyllabuses = filterState === 'ALL' 
        ? syllabuses 
        : syllabuses.filter(s => s.state === filterState);

    const stats = {
        published: syllabuses.filter(s => s.state === 'PUBLISHED').length,
        draft: syllabuses.filter(s => s.state === 'DRAFT').length,
        unpublished: syllabuses.filter(s => s.state === 'UNPUBLISHED').length,
        archived: syllabuses.filter(s => s.state === 'ARCHIVED').length,
    };

    return (
        <div className="app-container">
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
                    <Link to="/users" className="nav-item">
                        <span className="icon">👥</span>
                        <span>Quản lý người dùng</span>
                    </Link>
                    <Link to="/roles" className="nav-item">
                        <span className="icon">🔐</span>
                        <span>Vai trò & Quyền</span>
                    </Link>
                    <Link to="/publishing" className="nav-item active">
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

            <main className="main-content">
                <header className="header">
                    <h1>Quản lý Xuất bản</h1>
                    <div className="header-actions">
                        <button className="btn btn-icon" onClick={loadPublishingStates} title="Refresh">
                            🔄
                        </button>
                    </div>
                </header>

                <div className="content">
                    {error && <div className="error-message">{error}</div>}

                    {/* Statistics Cards */}
                    <div className="stats-grid">
                        <div className="stat-card stat-success">
                            <div className="stat-icon">✅</div>
                            <div className="stat-info">
                                <h3>{stats.published}</h3>
                                <p>Published</p>
                            </div>
                        </div>
                        
                        <div className="stat-card">
                            <div className="stat-icon">📝</div>
                            <div className="stat-info">
                                <h3>{stats.draft}</h3>
                                <p>Draft</p>
                            </div>
                        </div>
                        
                        <div className="stat-card stat-warning">
                            <div className="stat-icon">⏸️</div>
                            <div className="stat-info">
                                <h3>{stats.unpublished}</h3>
                                <p>Unpublished</p>
                            </div>
                        </div>
                        
                        <div className="stat-card stat-danger">
                            <div className="stat-icon">📦</div>
                            <div className="stat-info">
                                <h3>{stats.archived}</h3>
                                <p>Archived</p>
                            </div>
                        </div>
                    </div>

                    {/* Filter Buttons */}
                    <div className="card">
                        <div className="card-header">
                            <h2>Syllabuses</h2>
                            <div style={{display: 'flex', gap: '10px'}}>
                                <button 
                                    className={`btn btn-sm ${filterState === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
                                    onClick={() => setFilterState('ALL')}
                                >
                                    All
                                </button>
                                <button 
                                    className={`btn btn-sm ${filterState === 'PUBLISHED' ? 'btn-primary' : 'btn-secondary'}`}
                                    onClick={() => setFilterState('PUBLISHED')}
                                >
                                    Published
                                </button>
                                <button 
                                    className={`btn btn-sm ${filterState === 'DRAFT' ? 'btn-primary' : 'btn-secondary'}`}
                                    onClick={() => setFilterState('DRAFT')}
                                >
                                    Draft
                                </button>
                                <button 
                                    className={`btn btn-sm ${filterState === 'UNPUBLISHED' ? 'btn-primary' : 'btn-secondary'}`}
                                    onClick={() => setFilterState('UNPUBLISHED')}
                                >
                                    Unpublished
                                </button>
                                <button 
                                    className={`btn btn-sm ${filterState === 'ARCHIVED' ? 'btn-primary' : 'btn-secondary'}`}
                                    onClick={() => setFilterState('ARCHIVED')}
                                >
                                    Archived
                                </button>
                            </div>
                        </div>
                        <div className="card-body">
                            {loading ? (
                                <p>Loading syllabuses...</p>
                            ) : (
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Code</th>
                                            <th>Name</th>
                                            <th>Author</th>
                                            <th>Last Modified</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredSyllabuses.length > 0 ? (
                                            filteredSyllabuses.map((syllabus) => (
                                                <tr key={syllabus.id}>
                                                    <td>{syllabus.id}</td>
                                                    <td><strong>{syllabus.code}</strong></td>
                                                    <td>{syllabus.name}</td>
                                                    <td>{syllabus.author}</td>
                                                    <td>{syllabus.lastModified}</td>
                                                    <td>
                                                        <span className={`badge badge-${
                                                            syllabus.state === 'PUBLISHED' ? 'success' :
                                                            syllabus.state === 'DRAFT' ? 'secondary' :
                                                            syllabus.state === 'UNPUBLISHED' ? 'warning' :
                                                            'danger'
                                                        }`}>
                                                            {syllabus.state}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <select 
                                                            className="form-control form-control-sm"
                                                            value={syllabus.state}
                                                            onChange={(e) => handleStateChange(syllabus.id, e.target.value)}
                                                            style={{width: 'auto', display: 'inline-block'}}
                                                        >
                                                            <option value="DRAFT">Draft</option>
                                                            <option value="PUBLISHED">Publish</option>
                                                            <option value="UNPUBLISHED">Unpublish</option>
                                                            <option value="ARCHIVED">Archive</option>
                                                        </select>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="7" style={{textAlign: 'center'}}>
                                                    No syllabuses found
                                                </td>
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

export default Publishing;
