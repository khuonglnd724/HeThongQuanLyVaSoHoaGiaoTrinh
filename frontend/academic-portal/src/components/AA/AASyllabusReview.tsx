import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './AASyllabusReview.css';

interface ValidationResult {
  isValid: boolean;
  issues: string[];
}

interface SyllabusDetail {
  id: number;
  subjectCode: string;
  subjectName: string;
  credits: number;
  theoryHours: number;
  practiceHours: number;
  selfStudyHours: number;
  lecturerName: string;
  department: string;
  description: string;
  objectives: string[];
  clos: CLO[];
  cloPloMappings: CLOPLOMapping[];
  assessmentMethods: AssessmentMethod[];
  version: number;
  status: string;
  submittedDate: string;
}

interface CLO {
  id: number;
  code: string;
  description: string;
  bloomLevel: string;
}

interface CLOPLOMapping {
  cloId: number;
  cloCode: string;
  ploId: number;
  ploCode: string;
  weight: number;
}

interface AssessmentMethod {
  id: number;
  name: string;
  weight: number;
  description: string;
}

const AASyllabusReview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [syllabus, setSyllabus] = useState<SyllabusDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [validationResults, setValidationResults] = useState<{
    cloMapping: ValidationResult;
    creditStructure: ValidationResult;
    assessment: ValidationResult;
  }>({
    cloMapping: { isValid: true, issues: [] },
    creditStructure: { isValid: true, issues: [] },
    assessment: { isValid: true, issues: [] }
  });
  const [comment, setComment] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'validation'>('content');

  useEffect(() => {
    fetchSyllabusDetail();
  }, [id]);

  const fetchSyllabusDetail = async () => {
    try {
      setLoading(true);
      // Mock data - Replace with actual API call
      const mockData: SyllabusDetail = {
        id: Number(id),
        subjectCode: 'CS101',
        subjectName: 'Introduction to Programming',
        credits: 3,
        theoryHours: 30,
        practiceHours: 30,
        selfStudyHours: 90,
        lecturerName: 'Dr. Nguyen Van A',
        department: 'Computer Science',
        description: 'This course introduces fundamental programming concepts...',
        objectives: [
          'Understand basic programming concepts',
          'Write simple programs in Python',
          'Debug and test code effectively'
        ],
        clos: [
          { id: 1, code: 'CLO1', description: 'Explain basic programming concepts', bloomLevel: 'Understand' },
          { id: 2, code: 'CLO2', description: 'Write simple programs', bloomLevel: 'Apply' },
          { id: 3, code: 'CLO3', description: 'Debug code effectively', bloomLevel: 'Analyze' }
        ],
        cloPloMappings: [
          { cloId: 1, cloCode: 'CLO1', ploId: 1, ploCode: 'PLO1', weight: 3 },
          { cloId: 2, cloCode: 'CLO2', ploId: 2, ploCode: 'PLO2', weight: 5 },
          { cloId: 3, cloCode: 'CLO3', ploId: 3, ploCode: 'PLO3', weight: 4 }
        ],
        assessmentMethods: [
          { id: 1, name: 'Midterm Exam', weight: 30, description: 'Written exam' },
          { id: 2, name: 'Final Exam', weight: 40, description: 'Written exam' },
          { id: 3, name: 'Lab Work', weight: 30, description: 'Practical assignments' }
        ],
        version: 2,
        status: 'PENDING_AA',
        submittedDate: '2026-01-15'
      };

      setSyllabus(mockData);
      // Auto-validate on load
      runAllValidations(mockData);
    } catch (error) {
      console.error('Error fetching syllabus:', error);
      alert('Tải giáo trình thất bại');
    } finally {
      setLoading(false);
    }
  };

  const runAllValidations = async (data: SyllabusDetail) => {
    setValidating(true);
    
    // Validate CLO-PLO Mapping
    const cloMappingResult = validateCLOPLOMapping(data);
    
    // Validate Credit Structure
    const creditResult = validateCreditStructure(data);
    
    // Validate Assessment
    const assessmentResult = validateAssessment(data);

    setValidationResults({
      cloMapping: cloMappingResult,
      creditStructure: creditResult,
      assessment: assessmentResult
    });
    
    setValidating(false);
  };

  const validateCLOPLOMapping = (data: SyllabusDetail): ValidationResult => {
    const issues: string[] = [];
    
    // Check if all CLOs are mapped
    const mappedCLOIds = new Set(data.cloPloMappings.map(m => m.cloId));
    const unmappedCLOs = data.clos.filter(clo => !mappedCLOIds.has(clo.id));
    
    if (unmappedCLOs.length > 0) {
      issues.push(`${unmappedCLOs.length} CLO chưa được liên kết với PLO: ${unmappedCLOs.map(c => c.code).join(', ')}`);
    }
    
    // Check mapping weights (should be 1-5)
    const invalidWeights = data.cloPloMappings.filter(m => m.weight < 1 || m.weight > 5);
    if (invalidWeights.length > 0) {
      issues.push(`${invalidWeights.length} liên kết có trọng số không hợp lệ (phải từ 1-5)`);
    }
    
    // Check if each CLO maps to at least one PLO with weight >= 3
    data.clos.forEach(clo => {
      const strongMappings = data.cloPloMappings.filter(m => m.cloId === clo.id && m.weight >= 3);
      if (strongMappings.length === 0) {
        issues.push(`${clo.code} chưa có liên kết mạnh (trọng số ≥ 3) tới PLO nào`);
      }
    });
    
    return {
      isValid: issues.length === 0,
      issues
    };
  };

  const validateCreditStructure = (data: SyllabusDetail): ValidationResult => {
    const issues: string[] = [];
    
    // Check total hours = 15 * credits (standard rule)
    const expectedTotalHours = data.credits * 15;
    const actualTotalHours = data.theoryHours + data.practiceHours;
    
    if (actualTotalHours !== expectedTotalHours) {
      issues.push(`Tổng số giờ lên lớp (${actualTotalHours}) phải bằng ${expectedTotalHours} (15 × ${data.credits} tín chỉ)`);
    }
    
    // Check self-study hours = 30 * credits (standard rule)
    const expectedSelfStudyHours = data.credits * 30;
    if (data.selfStudyHours !== expectedSelfStudyHours) {
      issues.push(`Giờ tự học (${data.selfStudyHours}) phải bằng ${expectedSelfStudyHours} (30 × ${data.credits} tín chỉ)`);
    }
    
    // Check minimum practice hours for practical courses
    if (data.subjectCode.includes('LAB') || data.subjectName.toLowerCase().includes('practice')) {
      if (data.practiceHours < data.theoryHours) {
        issues.push('Học phần thực hành nên có giờ thực hành nhiều hơn giờ lý thuyết');
      }
    }
    
    return {
      isValid: issues.length === 0,
      issues
    };
  };

  const validateAssessment = (data: SyllabusDetail): ValidationResult => {
    const issues: string[] = [];
    
    // Check total weight = 100%
    const totalWeight = data.assessmentMethods.reduce((sum, method) => sum + method.weight, 0);
    if (totalWeight !== 100) {
      issues.push(`Tổng trọng số đánh giá là ${totalWeight}%, phải bằng 100%`);
    }
    
    // Check minimum number of assessment methods
    if (data.assessmentMethods.length < 2) {
      issues.push('Cần có ít nhất 2 phương thức đánh giá');
    }
    
    // Check final exam weight (should be 30-50%)
    const finalExam = data.assessmentMethods.find(m => 
      m.name.toLowerCase().includes('final') && m.name.toLowerCase().includes('exam')
    );
    
    if (finalExam && (finalExam.weight < 30 || finalExam.weight > 50)) {
      issues.push(`Trọng số thi cuối kỳ (${finalExam.weight}%) nên nằm trong khoảng 30-50%`);
    }
    
    // Check if no single assessment > 50%
    const overweightMethods = data.assessmentMethods.filter(m => m.weight > 50);
    if (overweightMethods.length > 0) {
      issues.push(`Một số phương thức đánh giá vượt quá 50%: ${overweightMethods.map(m => m.name).join(', ')}`);
    }
    
    return {
      isValid: issues.length === 0,
      issues
    };
  };

  const handleApprove = async () => {
    if (!allValidationsPassed()) {
      if (!window.confirm('Một số kiểm tra không đạt. Bạn có chắc muốn duyệt?')) {
        return;
      }
    }

    try {
      // API call to approve
      console.log('Approving syllabus:', id, 'with comment:', comment);
      // await approveByAA(Number(id), comment);
      
      alert('Duyệt giáo trình thành công! Đã chuyển lên Hiệu trưởng.');
      navigate('/aa/pending');
    } catch (error) {
      console.error('Error approving syllabus:', error);
      alert('Duyệt thất bại');
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Vui lòng nhập lý do từ chối');
      return;
    }

    try {
      // API call to reject
      console.log('Rejecting syllabus:', id, 'with reason:', rejectionReason);
      // await rejectByAA(Number(id), rejectionReason);
      
      alert('Đã từ chối giáo trình. Phản hồi đã gửi cho giảng viên.');
      navigate('/aa/pending');
    } catch (error) {
      console.error('Error rejecting syllabus:', error);
      alert('Từ chối thất bại');
    }
  };

  const allValidationsPassed = () => {
    return validationResults.cloMapping.isValid &&
           validationResults.creditStructure.isValid &&
           validationResults.assessment.isValid;
  };

  if (loading || !syllabus) {
    return <div className="loading">Đang tải giáo trình...</div>;
  }

  return (
    <div className="aa-syllabus-review">
      <div className="header">
        <div>
          <h1>Học Vụ - Duyệt giáo trình</h1>
          <p className="subtitle">
            {syllabus.subjectCode} - {syllabus.subjectName}
          </p>
        </div>
        <div className="header-actions">
          <button className="back-btn" onClick={() => navigate('/aa/pending')}>
            ← Quay lại danh sách
          </button>
        </div>
      </div>

      <div className="tabs">
        <button
          className={activeTab === 'content' ? 'active' : ''}
          onClick={() => setActiveTab('content')}
        >
          Nội dung giáo trình
        </button>
        <button
          className={activeTab === 'validation' ? 'active' : ''}
          onClick={() => setActiveTab('validation')}
        >
          Kết quả kiểm tra
          {!allValidationsPassed() && <span className="alert-badge">!</span>}
        </button>
      </div>

      {activeTab === 'content' && (
        <div className="content-tab">
          <div className="info-card">
            <h2>Thông tin cơ bản</h2>
            <div className="info-grid">
              <div className="info-item">
                <label>Mã học phần:</label>
                <span>{syllabus.subjectCode}</span>
              </div>
              <div className="info-item">
                <label>Tên học phần:</label>
                <span>{syllabus.subjectName}</span>
              </div>
              <div className="info-item">
                <label>Tín chỉ:</label>
                <span>{syllabus.credits}</span>
              </div>
              <div className="info-item">
                <label>Giảng viên:</label>
                <span>{syllabus.lecturerName}</span>
              </div>
              <div className="info-item">
                <label>Khoa:</label>
                <span>{syllabus.department}</span>
              </div>
              <div className="info-item">
                <label>Phiên bản:</label>
                <span>v{syllabus.version}</span>
              </div>
            </div>
          </div>

          <div className="info-card">
            <h2>Cấu trúc tín chỉ</h2>
            <div className="credit-breakdown">
              <div className="credit-item">
                <span className="credit-label">Giờ lý thuyết:</span>
                <span className="credit-value">{syllabus.theoryHours}h</span>
              </div>
              <div className="credit-item">
                <span className="credit-label">Giờ thực hành:</span>
                <span className="credit-value">{syllabus.practiceHours}h</span>
              </div>
              <div className="credit-item">
                <span className="credit-label">Giờ tự học:</span>
                <span className="credit-value">{syllabus.selfStudyHours}h</span>
              </div>
              <div className="credit-item total">
                <span className="credit-label">Tổng:</span>
                <span className="credit-value">
                  {syllabus.theoryHours + syllabus.practiceHours + syllabus.selfStudyHours}h
                </span>
              </div>
            </div>
          </div>

          <div className="info-card">
            <h2>Kết quả học tập (CLO)</h2>
            <table className="clo-table">
              <thead>
                <tr>
                  <th>Mã</th>
                  <th>Mô tả</th>
                  <th>Mức Bloom</th>
                </tr>
              </thead>
              <tbody>
                {syllabus.clos.map(clo => (
                  <tr key={clo.id}>
                    <td><strong>{clo.code}</strong></td>
                    <td>{clo.description}</td>
                    <td><span className="bloom-badge">{clo.bloomLevel}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="info-card">
            <h2>Liên kết CLO-PLO</h2>
            <table className="mapping-table">
              <thead>
                <tr>
                  <th>CLO</th>
                  <th>PLO</th>
                  <th>Trọng số</th>
                </tr>
              </thead>
              <tbody>
                {syllabus.cloPloMappings.map((mapping, idx) => (
                  <tr key={idx}>
                    <td><strong>{mapping.cloCode}</strong></td>
                    <td><strong>{mapping.ploCode}</strong></td>
                    <td>
                      <span className={`weight-badge weight-${mapping.weight}`}>
                        {mapping.weight}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="info-card">
            <h2>Phương thức đánh giá</h2>
            <table className="assessment-table">
              <thead>
                <tr>
                  <th>Hình thức</th>
                  <th>Trọng số</th>
                  <th>Mô tả</th>
                </tr>
              </thead>
              <tbody>
                {syllabus.assessmentMethods.map(method => (
                  <tr key={method.id}>
                    <td><strong>{method.name}</strong></td>
                    <td><span className="weight-percentage">{method.weight}%</span></td>
                    <td>{method.description}</td>
                  </tr>
                ))}
                <tr className="total-row">
                  <td><strong>TỔNG</strong></td>
                  <td>
                    <strong className="weight-percentage">
                      {syllabus.assessmentMethods.reduce((sum, m) => sum + m.weight, 0)}%
                    </strong>
                  </td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'validation' && (
        <div className="validation-tab">
          <div className="validation-summary">
            <h2>Trạng thái kiểm tra tổng thể</h2>
            <div className={`status-card ${allValidationsPassed() ? 'pass' : 'fail'}`}>
              {allValidationsPassed() ? (
                <>
                  <span className="status-icon">✓</span>
                  <span>Tất cả kiểm tra đạt</span>
                </>
              ) : (
                <>
                  <span className="status-icon">✗</span>
                  <span>Một số kiểm tra không đạt</span>
                </>
              )}
            </div>
          </div>

          <div className="validation-results">
            <div className={`validation-card ${validationResults.cloMapping.isValid ? 'pass' : 'fail'}`}>
              <h3>
                {validationResults.cloMapping.isValid ? '✓' : '✗'} Kiểm tra CLO-PLO
              </h3>
              {validationResults.cloMapping.isValid ? (
                <p className="success-msg">Tất cả CLO đã liên kết đúng với PLO</p>
              ) : (
                <ul className="issues-list">
                  {validationResults.cloMapping.issues.map((issue, idx) => (
                    <li key={idx}>{issue}</li>
                  ))}
                </ul>
              )}
            </div>

            <div className={`validation-card ${validationResults.creditStructure.isValid ? 'pass' : 'fail'}`}>
              <h3>
                {validationResults.creditStructure.isValid ? '✓' : '✗'} Cấu trúc tín chỉ
              </h3>
              {validationResults.creditStructure.isValid ? (
                <p className="success-msg">Cấu trúc tín chỉ tuân thủ quy định</p>
              ) : (
                <ul className="issues-list">
                  {validationResults.creditStructure.issues.map((issue, idx) => (
                    <li key={idx}>{issue}</li>
                  ))}
                </ul>
              )}
            </div>

            <div className={`validation-card ${validationResults.assessment.isValid ? 'pass' : 'fail'}`}>
              <h3>
                {validationResults.assessment.isValid ? '✓' : '✗'} Quy định đánh giá
              </h3>
              {validationResults.assessment.isValid ? (
                <p className="success-msg">Phương thức đánh giá tuân thủ quy định</p>
              ) : (
                <ul className="issues-list">
                  {validationResults.assessment.issues.map((issue, idx) => (
                    <li key={idx}>{issue}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {validating && <p className="validating-msg">Đang chạy kiểm tra...</p>}
        </div>
      )}

      <div className="review-actions">
        <div className="comment-section">
          <label>Nhận xét (tuỳ chọn)</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Thêm nhận xét hoặc gợi ý..."
            rows={4}
          />
        </div>

        <div className="action-buttons">
          <button className="reject-btn" onClick={() => setShowRejectModal(true)}>
            ✗ Từ chối giáo trình
          </button>
          <button 
            className="approve-btn" 
            onClick={handleApprove}
            disabled={validating}
          >
            ✓ Duyệt & chuyển lên Hiệu trưởng
          </button>
        </div>
      </div>

      {showRejectModal && (
        <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Từ chối giáo trình</h2>
            <p>Vui lòng nêu lý do từ chối chi tiết:</p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Giải thích lý do từ chối giáo trình..."
              rows={6}
              autoFocus
            />
            <div className="modal-actions">
              <button onClick={() => setShowRejectModal(false)}>Hủy</button>
              <button className="confirm-reject-btn" onClick={handleReject}>
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AASyllabusReview;
