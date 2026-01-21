import React, { useState, useEffect } from 'react';
import academicService from '../services/academicService';
import { Syllabus, SyllabusVersion } from '../types';
import './VersionHistory.css';

interface VersionHistoryProps {
  syllabusId: number;
}

const VersionHistory: React.FC<VersionHistoryProps> = ({ syllabusId }) => {
  const [versions, setVersions] = useState<SyllabusVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);

  useEffect(() => {
    fetchVersionHistory();
  }, [syllabusId]);

  const fetchVersionHistory = async () => {
    try {
      setLoading(true);
      const data = await academicService.getVersionHistory(syllabusId);
      setVersions(data);
    } catch (error) {
      console.error('Error fetching version history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getChangeTypeBadge = (changeType: string) => {
    const typeClass = {
      CREATE: 'badge-create',
      UPDATE: 'badge-update',
      APPROVE: 'badge-approve',
      REJECT: 'badge-reject',
      PUBLISH: 'badge-publish',
    }[changeType] || '';

    const typeLabel = {
      CREATE: 'Tạo mới',
      UPDATE: 'Cập nhật',
      APPROVE: 'Phê duyệt',
      REJECT: 'Từ chối',
      PUBLISH: 'Công bố',
    }[changeType] || changeType;

    return <span className={`badge ${typeClass}`}>{typeLabel}</span>;
  };

  return (
    <div className="version-history-container">
      <h3>Lịch sử phiên bản</h3>

      {loading ? (
        <div className="loading">Đang tải...</div>
      ) : versions.length === 0 ? (
        <div className="empty">Không có lịch sử</div>
      ) : (
        <>
          <div className="version-timeline">
            {versions.map((version, index) => (
              <div key={version.versionNumber} className="version-item">
                <div className="version-marker">
                  <div className="dot"></div>
                  {index < versions.length - 1 && <div className="line"></div>}
                </div>

                <div className="version-content">
                  <div className="version-header">
                    <span className="version-number">v{version.versionNumber}</span>
                    {getChangeTypeBadge(version.changeType)}
                  </div>

                  <div className="version-meta">
                    <p>
                      <strong>Người thực hiện:</strong> {version.changedBy}
                    </p>
                    <p>
                      <strong>Thời gian:</strong>{' '}
                      {new Date(version.changedAt).toLocaleString('vi-VN')}
                    </p>
                  </div>

                  <button
                    className="btn-expand"
                    onClick={() =>
                      setSelectedVersion(
                        selectedVersion === version.versionNumber
                          ? null
                          : version.versionNumber
                      )
                    }
                  >
                    {selectedVersion === version.versionNumber ? 'Ẩn' : 'Hiện'} chi tiết
                  </button>

                  {selectedVersion === version.versionNumber && (
                    <div className="version-details">
                      {Object.entries(version.newState).map(([key, value]) => (
                        <div key={key} className="detail-row">
                          <span className="key">{key}:</span>
                          <span className="value">{String(value).substring(0, 100)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default VersionHistory;
