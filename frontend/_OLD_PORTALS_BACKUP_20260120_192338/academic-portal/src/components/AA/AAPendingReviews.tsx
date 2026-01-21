import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AAPendingReviews.css';

interface Syllabus {
  id: number;
  subjectCode: string;
  subjectName: string;
  lecturerName: string;
  department: string;
  submittedDate: string;
  status: string;
  version: number;
}

const AAPendingReviews: React.FC = () => {
  const navigate = useNavigate();
  const [syllabuses, setSyllabuses] = useState<Syllabus[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'urgent' | 'normal'>('all');

  useEffect(() => {
    fetchPendingSyllabuses();
  }, []);

  const fetchPendingSyllabuses = async () => {
    try {
      setLoading(true);
      // Mock data - Replace with actual API call
      const mockData: Syllabus[] = [
        {
          id: 1,
          subjectCode: 'CS101',
          subjectName: 'Nhập môn Lập trình',
          lecturerName: 'Dr. Nguyen Van A',
          department: 'Khoa Công nghệ Thông tin',
          submittedDate: '2026-01-15',
          status: 'PENDING_AA',
          version: 2
        },
        {
          id: 2,
          subjectCode: 'CS201',
          subjectName: 'Cấu trúc Dữ liệu',
          lecturerName: 'Dr. Tran Thi B',
          department: 'Khoa Công nghệ Thông tin',
          submittedDate: '2026-01-14',
          status: 'PENDING_AA',
          version: 1
        },
        {
          id: 3,
          subjectCode: 'MATH101',
          subjectName: 'Giải tích I',
          lecturerName: 'Prof. Le Van C',
          department: 'Khoa Toán',
          submittedDate: '2026-01-13',
          status: 'PENDING_AA',
          version: 3
        }
      ];

      setSyllabuses(mockData);
    } catch (error) {
      console.error('Error fetching pending syllabuses:', error);
      alert('Tải danh sách chờ duyệt thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = (syllabusId: number) => {
    navigate(`/aa/review/${syllabusId}`);
  };

  const getDaysWaiting = (submittedDate: string) => {
    const submitted = new Date(submittedDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - submitted.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const isUrgent = (submittedDate: string) => {
    return getDaysWaiting(submittedDate) > 3;
  };

  const filteredSyllabuses = syllabuses.filter(s => {
    if (filter === 'urgent') return isUrgent(s.submittedDate);
    if (filter === 'normal') return !isUrgent(s.submittedDate);
    return true;
  });

  if (loading) {
    return <div className="loading">Đang tải danh sách chờ duyệt...</div>;
  }

  return (
    <div className="aa-pending-reviews">
      <div className="header">
        <h1>Học Vụ - Danh sách chờ duyệt (Cấp 2)</h1>
        <div className="stats">
          <div className="stat-card">
            <span className="stat-value">{syllabuses.length}</span>
            <span className="stat-label">Tổng số chờ duyệt</span>
          </div>
          <div className="stat-card urgent">
            <span className="stat-value">
              {syllabuses.filter(s => isUrgent(s.submittedDate)).length}
            </span>
            <span className="stat-label">Khẩn (3+ ngày)</span>
          </div>
        </div>
      </div>

      <div className="filters">
        <button
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          Tất cả ({syllabuses.length})
        </button>
        <button
          className={filter === 'urgent' ? 'active' : ''}
          onClick={() => setFilter('urgent')}
        >
          Khẩn ({syllabuses.filter(s => isUrgent(s.submittedDate)).length})
        </button>
        <button
          className={filter === 'normal' ? 'active' : ''}
          onClick={() => setFilter('normal')}
        >
          Bình thường ({syllabuses.filter(s => !isUrgent(s.submittedDate)).length})
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
              <th>Ngày nộp</th>
              <th>Số ngày chờ</th>
              <th>Phiên bản</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredSyllabuses.length === 0 ? (
              <tr>
                <td colSpan={8} className="no-data">
                  Không có giáo trình nào cần duyệt
                </td>
              </tr>
            ) : (
              filteredSyllabuses.map(syllabus => (
                <tr
                  key={syllabus.id}
                  className={isUrgent(syllabus.submittedDate) ? 'urgent-row' : ''}
                >
                  <td>{syllabus.subjectCode}</td>
                  <td>{syllabus.subjectName}</td>
                  <td>{syllabus.lecturerName}</td>
                  <td>{syllabus.department}</td>
                  <td>{new Date(syllabus.submittedDate).toLocaleDateString()}</td>
                  <td>
                    <span className={isUrgent(syllabus.submittedDate) ? 'urgent-badge' : ''}>
                      {getDaysWaiting(syllabus.submittedDate)} ngày
                    </span>
                  </td>
                  <td>v{syllabus.version}</td>
                  <td>
                    <button
                      className="review-btn"
                      onClick={() => handleReview(syllabus.id)}
                    >
                      Xem duyệt
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AAPendingReviews;
