import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './AdminSyllabusManagement.css';

interface Syllabus {
  id: number;
  subjectCode: string;
  subjectName: string;
  lecturerName: string;
  department: string;
  status: string;
  version: number;
  lastModified: string;
  publishedDate?: string;
}

type TabType = 'approved' | 'published' | 'archived';

const AdminSyllabusManagement: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('approved');
  const [syllabuses, setSyllabuses] = useState<Syllabus[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSyllabus, setSelectedSyllabus] = useState<number | null>(null);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [archiveReason, setArchiveReason] = useState('');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  useEffect(() => {
    fetchSyllabuses();
  }, [activeTab]);

  const fetchSyllabuses = async () => {
    try {
      setLoading(true);
      // Mock data - Replace with actual API calls
      const mockData: Record<TabType, Syllabus[]> = {
        approved: [
          {
            id: 1,
            subjectCode: 'CS101',
            subjectName: 'Nhập môn Lập trình',
            lecturerName: 'Dr. Nguyen Van A',
            department: 'Khoa Công nghệ Thông tin',
            status: 'APPROVED_BY_PRINCIPAL',
            version: 2,
            lastModified: '2026-01-17'
          },
          {
            id: 2,
            subjectCode: 'CS201',
            subjectName: 'Cấu trúc Dữ liệu',
            lecturerName: 'Dr. Tran Thi B',
            department: 'Khoa Công nghệ Thông tin',
            status: 'APPROVED_BY_PRINCIPAL',
            version: 1,
            lastModified: '2026-01-16'
          }
        ],
        published: [
          {
            id: 10,
            subjectCode: 'MATH101',
            subjectName: 'Giải tích I',
            lecturerName: 'Prof. Le Van C',
            department: 'Khoa Toán',
            status: 'PUBLISHED',
            version: 3,
            lastModified: '2026-01-10',
            publishedDate: '2026-01-10'
          },
          {
            id: 11,
            subjectCode: 'PHY101',
            subjectName: 'Vật lý I',
            lecturerName: 'Dr. Pham Thi D',
            department: 'Khoa Vật lý',
            status: 'PUBLISHED',
            version: 2,
            lastModified: '2026-01-08',
            publishedDate: '2026-01-08'
          }
        ],
        archived: [
          {
            id: 20,
            subjectCode: 'CS099',
            subjectName: 'Khoá học Lập trình cũ',
            lecturerName: 'Dr. Nguyen Van E',
            department: 'Khoa Công nghệ Thông tin',
            status: 'ARCHIVED',
            version: 1,
            lastModified: '2025-12-01'
          }
        ]
      };

      setSyllabuses(mockData[activeTab]);
    } catch (error) {
      console.error('Error fetching syllabuses:', error);
      alert('Failed to load syllabuses');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (syllabusId: number) => {
    if (!window.confirm('Bạn có chắc muốn xuất bản giáo trình này? Giáo trình sẽ hiển thị cho sinh viên và công chúng.')) {
      return;
    }

    try {
      console.log('Publishing syllabus:', syllabusId);
      // await publishSyllabus(syllabusId);
      
      alert('Xuất bản giáo trình thành công!');
      fetchSyllabuses();
    } catch (error) {
      console.error('Error publishing syllabus:', error);
      alert('Xuất bản thất bại');
    }
  };

  const handleUnpublish = async (syllabusId: number) => {
    if (!window.confirm('Bạn có chắc muốn gỡ giáo trình này xuống? Giáo trình sẽ không còn hiển thị công khai.')) {
      return;
    }

    try {
      console.log('Unpublishing syllabus:', syllabusId);
      // await unpublishSyllabus(syllabusId);
      
      alert('Đã gỡ giáo trình xuống thành công!');
      fetchSyllabuses();
    } catch (error) {
      console.error('Error unpublishing syllabus:', error);
      alert('Gỡ xuống thất bại');
    }
  };

  const handleArchive = async () => {
    if (!selectedSyllabus) return;

    if (!archiveReason.trim()) {
      alert('Vui lòng nhập lý do lưu trữ');
      return;
    }

    try {
      console.log('Archiving syllabus:', selectedSyllabus, 'Reason:', archiveReason);
      // await archiveSyllabus(selectedSyllabus, archiveReason);
      
      alert('Lưu trữ giáo trình thành công!');
      setShowArchiveModal(false);
      setArchiveReason('');
      setSelectedSyllabus(null);
      fetchSyllabuses();
    } catch (error) {
      console.error('Error archiving syllabus:', error);
      alert('Lưu trữ thất bại');
    }
  };

  const openArchiveModal = (syllabusId: number) => {
    setSelectedSyllabus(syllabusId);
    setShowArchiveModal(true);
  };

  const filteredSyllabuses = syllabuses.filter(s =>
    s.subjectCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.lecturerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="loading">Đang tải danh sách giáo trình...</div>;
  }

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
          <Link to="/publishing" className="nav-item">
            <span className="icon">📤</span>
            <span>Xuất bản</span>
          </Link>
          <Link to="/syllabus-management" className="nav-item active">
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
        <div className="admin-syllabus-management">
      <div className="header">
        <h1>Quản lý Giáo Trình (Quản trị)</h1>
        <div className="search-box">
          <input
            type="text"
            placeholder="Tìm theo mã, tên học phần hoặc giảng viên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="tabs">
        <button
          className={activeTab === 'approved' ? 'active' : ''}
          onClick={() => setActiveTab('approved')}
        >
          Đã duyệt (Sẵn sàng xuất bản)
          <span className="count">{activeTab === 'approved' ? syllabuses.length : 0}</span>
        </button>
        <button
          className={activeTab === 'published' ? 'active' : ''}
          onClick={() => setActiveTab('published')}
        >
          Đã xuất bản
          <span className="count">{activeTab === 'published' ? syllabuses.length : 0}</span>
        </button>
        <button
          className={activeTab === 'archived' ? 'active' : ''}
          onClick={() => setActiveTab('archived')}
        >
          Đã lưu trữ
          <span className="count">{activeTab === 'archived' ? syllabuses.length : 0}</span>
        </button>
      </div>

      <div className="syllabuses-table">
        <table>
          <thead>
            <tr>
              <th>Mã học phần</th>
              <th>Tên học phần</th>
              <th>Giảng viên</th>
              <th>Khoa</th>
              <th>Phiên bản</th>
              <th>Sửa lần cuối</th>
              {activeTab === 'published' && <th>Ngày xuất bản</th>}
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredSyllabuses.length === 0 ? (
              <tr>
                <td colSpan={activeTab === 'published' ? 8 : 7} className="no-data">
                  Không có giáo trình nào
                </td>
              </tr>
            ) : (
              filteredSyllabuses.map(syllabus => (
                <tr key={syllabus.id}>
                  <td><strong>{syllabus.subjectCode}</strong></td>
                  <td>{syllabus.subjectName}</td>
                  <td>{syllabus.lecturerName}</td>
                  <td>{syllabus.department}</td>
                  <td>v{syllabus.version}</td>
                  <td>{new Date(syllabus.lastModified).toLocaleDateString()}</td>
                  {activeTab === 'published' && (
                    <td>{syllabus.publishedDate ? new Date(syllabus.publishedDate).toLocaleDateString() : '-'}</td>
                  )}
                  <td>
                    <div className="action-buttons">
                      {activeTab === 'approved' && (
                        <>
                          <button
                            className="publish-btn"
                            onClick={() => handlePublish(syllabus.id)}
                          >
                            📢 Xuất bản
                          </button>
                          <button
                            className="archive-btn"
                            onClick={() => openArchiveModal(syllabus.id)}
                          >
                            📦 Lưu trữ
                          </button>
                        </>
                      )}
                      {activeTab === 'published' && (
                        <>
                          <button
                            className="unpublish-btn"
                            onClick={() => handleUnpublish(syllabus.id)}
                          >
                            🔒 Gỡ xuống
                          </button>
                          <button
                            className="archive-btn"
                            onClick={() => openArchiveModal(syllabus.id)}
                          >
                            📦 Lưu trữ
                          </button>
                        </>
                      )}
                      {activeTab === 'archived' && (
                        <span className="archived-label">Đã lưu trữ</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="stats-summary">
        <div className="stat-card">
          <span className="stat-label">Tổng số giáo trình</span>
          <span className="stat-value">{syllabuses.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Cập nhật gần nhất</span>
          <span className="stat-value">
            {syllabuses.length > 0
              ? new Date(Math.max(...syllabuses.map(s => new Date(s.lastModified).getTime()))).toLocaleDateString()
              : 'N/A'}
          </span>
        </div>
      </div>

      {showArchiveModal && (
        <div className="modal-overlay" onClick={() => setShowArchiveModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Lưu trữ giáo trình</h2>
            <p>Vui lòng nhập lý do lưu trữ giáo trình này:</p>
            <textarea
              value={archiveReason}
              onChange={(e) => setArchiveReason(e.target.value)}
              placeholder="Ví dụ: Cập nhật chương trình, Khoá học ngừng triển khai, Thay thế bởi phiên bản mới..."
              rows={5}
              autoFocus
            />
            <div className="modal-actions">
              <button onClick={() => {
                setShowArchiveModal(false);
                setArchiveReason('');
                setSelectedSyllabus(null);
              }}>
                Hủy
              </button>
              <button className="confirm-archive-btn" onClick={handleArchive}>
                Xác nhận lưu trữ
              </button>
            </div>
          </div>
        </div>
      )}
        </div>
      </main>
    </div>
  );
};

export default AdminSyllabusManagement;
