import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DocumentUpload.css';

const SYLLABUS_API_URL = 'http://localhost:8085/api/syllabus';
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const DocumentUpload = ({ syllabusId, syllabusVersion }) => {
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [description, setDescription] = useState('');
  const [stats, setStats] = useState({ totalDocuments: 0, totalSizeMB: 0 });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (syllabusId) {
      fetchDocuments();
      fetchStatistics();
    }
  }, [syllabusId]);

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${SYLLABUS_API_URL}/documents/syllabus/${syllabusId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setDocuments(response.data);
    } catch (err) {
      console.error('Error fetching documents:', err);
    }
  };

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${SYLLABUS_API_URL}/documents/syllabus/${syllabusId}/statistics`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching statistics:', err);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    setError('');
    setSuccess('');

    if (!file) return;

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError(`Dung lượng tệp vượt quá giới hạn 50MB (${(file.size / (1024 * 1024)).toFixed(2)}MB)`);
      setSelectedFile(null);
      return;
    }

    // Validate file type
    const allowedTypes = ['pdf', 'docx', 'doc', 'pptx', 'ppt', 'xlsx', 'xls'];
    const extension = file.name.split('.').pop().toLowerCase();
    if (!allowedTypes.includes(extension)) {
      setError(`Định dạng .${extension} không được hỗ trợ. Cho phép: ${allowedTypes.join(', ')}`);
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Vui lòng chọn tệp trước');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('syllabusId', syllabusId);
      if (description) {
        formData.append('description', description);
      }

      await axios.post(`${SYLLABUS_API_URL}/documents/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess('Tải lên thành công!');
      setSelectedFile(null);
      setDescription('');
      document.getElementById('file-input').value = '';
      
      // Refresh lists
      fetchDocuments();
      fetchStatistics();
    } catch (err) {
      setError(err.response?.data?.error || 'Tải lên thất bại');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (documentId, fileName) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${SYLLABUS_API_URL}/documents/${documentId}/download`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Tải xuống thất bại');
    }
  };

  const handleDelete = async (documentId) => {
    if (!window.confirm('Bạn có chắc muốn xoá tài liệu này?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${SYLLABUS_API_URL}/documents/${documentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess('Xoá tài liệu thành công');
      fetchDocuments();
      fetchStatistics();
    } catch (err) {
      setError('Xoá thất bại');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const getFileIcon = (fileType) => {
    const icons = {
      PDF: '📄',
      DOCX: '📝',
      DOC: '📝',
      PPTX: '📊',
      PPT: '📊',
      XLSX: '📈',
      XLS: '📈'
    };
    return icons[fileType] || '📎';
  };

  const getStatusLabel = (status) => {
    const map = { DRAFT: 'Nháp', APPROVED: 'Đã duyệt' };
    return map[status] || status;
  };

  return (
    <div className="document-upload-container">
      <div className="document-header">
        <h3>📚 Tài liệu giảng dạy</h3>
        <div className="document-stats">
          <span className="stat-item">
            <strong>{stats.totalDocuments}</strong> tài liệu
          </span>
          <span className="stat-item">
            <strong>{stats.totalSizeMB?.toFixed(2)} MB</strong> tổng dung lượng
          </span>
        </div>
      </div>

      {/* Upload Section */}
      <div className="upload-section">
        <h4>Tải lên tài liệu mới</h4>
        <p className="upload-hint">
          Hỗ trợ: PDF (chính), Word, PowerPoint, Excel • Tối đa: 50MB
        </p>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="upload-form">
          <div className="form-group">
            <label htmlFor="file-input">Chọn tệp:</label>
            <input
              id="file-input"
              type="file"
              accept=".pdf,.docx,.doc,.pptx,.ppt,.xlsx,.xls"
              onChange={handleFileSelect}
              disabled={uploading}
            />
            {selectedFile && (
              <div className="file-info">
                ✓ {selectedFile.name} ({formatFileSize(selectedFile.size)})
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="description">Mô tả (tuỳ chọn):</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả ngắn về tài liệu..."
              rows="2"
              disabled={uploading}
            />
          </div>

          <button
            className="btn-upload"
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
          >
            {uploading ? '⏳ Đang tải lên...' : '📤 Tải lên tài liệu'}
          </button>
        </div>
      </div>

      {/* Documents List */}
      <div className="documents-list">
        <h4>Danh sách tài liệu đã tải lên ({documents.length})</h4>
        {documents.length === 0 ? (
          <p className="no-documents">Chưa có tài liệu nào được tải lên.</p>
        ) : (
          <div className="documents-table">
            <table>
              <thead>
                <tr>
                  <th>Tệp</th>
                  <th>Loại</th>
                  <th>Dung lượng</th>
                  <th>Phiên bản</th>
                  <th>Trạng thái</th>
                  <th>Thời gian tải lên</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id}>
                    <td>
                      <div className="file-name">
                        <span className="file-icon">{getFileIcon(doc.fileType)}</span>
                        <span title={doc.originalName}>{doc.originalName}</span>
                      </div>
                      {doc.description && (
                        <div className="file-description">{doc.description}</div>
                      )}
                    </td>
                    <td>
                      <span className="file-type-badge">{doc.fileType}</span>
                    </td>
                    <td>{formatFileSize(doc.fileSize)}</td>
                    <td className="text-center">v{doc.syllabusVersion}</td>
                    <td>
                      <span className={`status-badge status-${doc.status.toLowerCase()}`}>
                        {getStatusLabel(doc.status)}
                      </span>
                    </td>
                    <td className="text-small">{formatDate(doc.uploadedAt)}</td>
                    <td className="actions">
                      <button
                        className="btn-icon btn-download"
                        onClick={() => handleDownload(doc.id, doc.originalName)}
                        title="Tải xuống"
                      >
                        ⬇️
                      </button>
                      {doc.status === 'DRAFT' && (
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => handleDelete(doc.id)}
                          title="Xoá"
                        >
                          🗑️
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentUpload;
