import React, { useState, useEffect } from 'react';
import academicService, { StatisticsData, ProgramStatistic, SubjectStatistic } from '../types';
import './Statistics.css';

interface StatisticsProps {
  show: boolean;
}

const Statistics: React.FC<StatisticsProps> = ({ show }) => {
  const [stats, setStats] = useState<StatisticsData | null>(null);
  const [programStats, setProgramStats] = useState<ProgramStatistic[]>([]);
  const [subjectStats, setSubjectStats] = useState<SubjectStatistic[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'department' | 'program' | 'subject'>('department');

  useEffect(() => {
    if (show) {
      fetchStatistics();
    }
  }, [show, tab]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      if (tab === 'department') {
        const data = await academicService.getDepartmentStatistics();
        setStats(data);
      } else if (tab === 'program') {
        const data = await academicService.getAllProgramsStatistics();
        setProgramStats(data);
      } else {
        const data = await academicService.getAllSubjectsStatistics();
        setSubjectStats(data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCoverageStatus = (percentage: number): string => {
    if (percentage >= 80) return 'Xuất sắc';
    if (percentage >= 60) return 'Tốt';
    if (percentage >= 40) return 'Bình thường';
    return 'Yếu';
  };

  const getCoverageClass = (percentage: number): string => {
    if (percentage >= 80) return 'excellent';
    if (percentage >= 60) return 'good';
    if (percentage >= 40) return 'fair';
    return 'poor';
  };

  if (!show) return null;

  return (
    <div className="statistics-container">
      <h2>Thống kê Giáo trình</h2>

      <div className="stats-tabs">
        <button
          className={`tab ${tab === 'department' ? 'active' : ''}`}
          onClick={() => setTab('department')}
        >
          Toàn bộ
        </button>
        <button
          className={`tab ${tab === 'program' ? 'active' : ''}`}
          onClick={() => setTab('program')}
        >
          Theo Chương trình
        </button>
        <button
          className={`tab ${tab === 'subject' ? 'active' : ''}`}
          onClick={() => setTab('subject')}
        >
          Theo Môn học
        </button>
      </div>

      {loading ? (
        <div className="loading">Đang tải...</div>
      ) : tab === 'department' && stats ? (
        <div className="department-stats">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{stats.totalSyllabuses}</div>
              <div className="stat-label">Tổng số giáo trình</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.approvedSyllabuses}</div>
              <div className="stat-label">Đã phê duyệt</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.pendingApprovalSyllabuses}</div>
              <div className="stat-label">Chờ phê duyệt</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.rejectedSyllabuses}</div>
              <div className="stat-label">Bị từ chối</div>
            </div>
          </div>

          <div className="coverage-stats">
            <div className="coverage-card">
              <div className="coverage-title">Tỷ lệ ánh xạ CLO</div>
              <div className="coverage-bar">
                <div
                  className="coverage-fill"
                  style={{ width: `${stats.cloMappingRate}%` }}
                ></div>
              </div>
              <div className="coverage-value">
                {stats.cloMappingRate.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      ) : tab === 'program' && programStats.length > 0 ? (
        <div className="table-container">
          <table className="stats-table">
            <thead>
              <tr>
                <th>Chương trình</th>
                <th>CLO</th>
                <th>PLO</th>
                <th>Tỷ lệ ánh xạ</th>
                <th>Số giáo trình</th>
              </tr>
            </thead>
            <tbody>
              {programStats.map((prog) => (
                <tr key={prog.programId}>
                  <td>{prog.programName}</td>
                  <td>
                    {prog.mappedClos}/{prog.totalClos}
                  </td>
                  <td>
                    {prog.mappedPlos}/{prog.totalPlos}
                  </td>
                  <td>
                    <div className="coverage-badge">
                      <div
                        className={`coverage-status ${getCoverageClass(
                          prog.coveragePercentage
                        )}`}
                      >
                        {prog.coveragePercentage.toFixed(1)}%
                      </div>
                      <small>{getCoverageStatus(prog.coveragePercentage)}</small>
                    </div>
                  </td>
                  <td>{prog.syllabusCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : tab === 'subject' && subjectStats.length > 0 ? (
        <div className="table-container">
          <table className="stats-table">
            <thead>
              <tr>
                <th>Môn học</th>
                <th>CLO Ánh xạ</th>
                <th>Tỷ lệ ánh xạ</th>
                <th>Số giáo trình</th>
              </tr>
            </thead>
            <tbody>
              {subjectStats.map((subj) => (
                <tr key={subj.subjectId}>
                  <td>{subj.subjectName}</td>
                  <td>
                    {subj.mappedClos}/{subj.totalClos}
                  </td>
                  <td>
                    <div className="coverage-badge">
                      <div
                        className={`coverage-status ${getCoverageClass(
                          subj.coveragePercentage
                        )}`}
                      >
                        {subj.coveragePercentage.toFixed(1)}%
                      </div>
                      <small>{getCoverageStatus(subj.coveragePercentage)}</small>
                    </div>
                  </td>
                  <td>{subj.syllabusCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty">Không có dữ liệu</div>
      )}
    </div>
  );
};

export default Statistics;
