import React, { useState, useEffect } from 'react';
import syllabusService from '../services/syllabusService';
import { Syllabus, ValidationResult } from '../types';
import './SyllabusList.css';

interface SyllabusListProps {
  onSelectSyllabus: (syllabus: Syllabus) => void;
  userRole?: string;
}

const SyllabusList: React.FC<SyllabusListProps> = ({ onSelectSyllabus, userRole = 'LECTURER' }) => {
  const [syllabuses, setSyllabuses] = useState<Syllabus[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [validationResults, setValidationResults] = useState<Map<number, ValidationResult>>(new Map());

  useEffect(() => {
    fetchSyllabuses();
  }, [page, filterStatus]);

  const fetchSyllabuses = async () => {
    try {
      setLoading(true);
      let response;

      // For lecturers, show their own syllabuses by default
      if (userRole === 'LECTURER' && !filterStatus) {
        response = await syllabusService.getMySyllabuses(page, 10);
      } else if (filterStatus === 'PENDING') {
        response = await syllabusService.getPendingApprovalSyllabuses(page, 10);
      } else if (filterStatus === 'REJECTED') {
        response = await syllabusService.getRejectedSyllabuses(page, 10);
      } else if (filterStatus === 'APPROVED') {
        response = await syllabusService.getApprovedSyllabuses(page, 10);
      } else if (filterStatus === 'DRAFT') {
        response = await syllabusService.getDraftSyllabuses(page, 10);
      } else if (filterStatus === 'PUBLISHED') {
        response = await syllabusService.getPublishedSyllabuses(page, 10);
      } else {
        response = await syllabusService.getSyllabuses(page, 10);
      }

      setSyllabuses(response.content || response);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error('Error fetching syllabuses:', error);
      alert('Lỗi khi tải danh sách giáo trình');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      fetchSyllabuses();
      return;
    }

    try {
      setLoading(true);
      const response = await syllabusService.searchByCodeOrName(searchKeyword, 0, 10);
      setSyllabuses(response.content || response);
      setPage(0);
    } catch (error) {
      console.error('Error searching syllabuses:', error);
      alert('Lỗi khi tìm kiếm giáo trình');
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async (syllabusId: number) => {
    try {
      const result = await syllabusService.validateApproval(syllabusId);
      setValidationResults(new Map(validationResults).set(syllabusId, result));
    } catch (error) {
      console.error('Error validating syllabus:', error);
      alert('Lỗi khi kiểm tra giáo trình');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusClass = {
      DRAFT: 'badge-draft',
      SUBMITTED: 'badge-submitted',
      APPROVED: 'badge-approved',
      REJECTED: 'badge-rejected',
      PUBLISHED: 'badge-published',
    }[status] || '';

    return <span className={`badge ${statusClass}`}>{status}</span>;
  };

  const getApprovalBadge = (approvalStatus: string) => {
    const statusClass = {
      PENDING: 'badge-pending',
      APPROVED_L1: 'badge-approved-l1',
      APPROVED_L2: 'badge-approved-l2',
      REJECTED: 'badge-rejected',
    }[approvalStatus] || '';

    return <span className={`badge approval-badge ${statusClass}`}>{approvalStatus}</span>;
  };

  return (
    <div className="syllabus-list-container">
      <h2>Danh sách Giáo trình</h2>

      <div className="search-filter-bar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Tìm kiếm theo mã hoặc tên giáo trình..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch} className="btn-primary">
            Tìm kiếm
          </button>
        </div>

        <div className="filter-box">
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setPage(0);
            }}
            className="filter-select"
          >
            <option value="">Tất cả trạng thái</option>
            {userRole === 'LECTURER' && (
              <>
                <option value="DRAFT">Nháp</option>
                <option value="PENDING">Chờ phê duyệt</option>
              </>
            )}
            <option value="APPROVED">Đã phê duyệt</option>
            <option value="REJECTED">Bị từ chối</option>
            <option value="PUBLISHED">Xuất bản</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading">Đang tải...</div>
      ) : syllabuses.length === 0 ? (
        <div className="empty-state">
          <p>Không có giáo trình nào</p>
        </div>
      ) : (
        <>
          <div className="syllabus-grid">
            {syllabuses.map((syllabus) => {
              const validation = validationResults.get(syllabus.id);
              return (
                <div key={syllabus.id} className="syllabus-card">
                  <div className="card-header">
                    <h3>{syllabus.name}</h3>
                    <p className="code">Mã: {syllabus.code}</p>
                  </div>

                  <div className="card-body">
                    <div className="info-row">
                      <span className="label">Năm học:</span>
                      <span>{syllabus.academicYear}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Học kỳ:</span>
                      <span>{syllabus.semester}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Tín chỉ:</span>
                      <span>{syllabus.credits}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Trạng thái:</span>
                      {getStatusBadge(syllabus.status)}
                    </div>
                    <div className="info-row">
                      <span className="label">Phê duyệt:</span>
                      {getApprovalBadge(syllabus.approvalStatus)}
                    </div>
                  </div>

                  {validation && (
                    <div className={`validation-result ${validation.approved ? 'approved' : 'rejected'}`}>
                      <p>Điểm: {validation.score}/{validation.maxScore}</p>
                      {validation.errors.length > 0 && (
                        <ul>
                          {validation.errors.map((err, idx) => (
                            <li key={idx} className="error">
                              {err.field}: {err.message}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  <div className="card-actions">
                    <button
                      onClick={() => onSelectSyllabus(syllabus)}
                      className="btn-secondary btn-sm"
                    >
                      Xem chi tiết
                    </button>
                    <button
                      onClick={() => handleValidate(syllabus.id)}
                      className="btn-info btn-sm"
                    >
                      Kiểm tra
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pagination">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="btn-pagination"
            >
              Trước
            </button>
            <span>
              Trang {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="btn-pagination"
            >
              Tiếp
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default SyllabusList;
