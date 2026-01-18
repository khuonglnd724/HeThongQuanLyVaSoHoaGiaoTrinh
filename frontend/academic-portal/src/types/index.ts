export interface Lecturer {
  id: number;
  name: string;
  email: string;
  phone?: string;
  department: string;
  qualification: string;
  specialization?: string;
}

export interface CLO {
  id?: number;
  code: string;
  description: string;
  bloomLevel: 'REMEMBER' | 'UNDERSTAND' | 'APPLY' | 'ANALYZE' | 'EVALUATE' | 'CREATE';
}

export interface PLO {
  id?: number;
  code: string;
  description: string;
  type: 'KNOWLEDGE' | 'SKILL' | 'ATTITUDE';
}

export interface CLOPLOMapping {
  id?: number;
  cloId: number;
  cloCode: string;
  plos: PLO[];
  mappedAt: string;
}

export interface ApprovalFeedback {
  id?: string;
  syllabusId: number;
  approverName: string;
  approverRole: 'APPROVER_L1' | 'APPROVER_L2';
  comments: string;
  issues: ApprovalIssue[];
  createdAt: string;
}

export interface ApprovalIssue {
  id?: string;
  type: 'ERROR' | 'WARNING' | 'SUGGESTION';
  field: string;
  message: string;
  status: 'OPEN' | 'RESOLVED';
}

export interface Syllabus {
  id: number;
  code: string;
  name: string;
  subjectId: number;
  subjectName: string;
  academicYear: string;
  semester: number;
  credits: number;
  objectives: string;
  content: string;
  teachingMethods: string;
  assessmentMethods: string;
  prerequisites: string;
  learningOutcomes?: string;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'PUBLISHED';
  approvalStatus: 'PENDING' | 'APPROVED_L1' | 'APPROVED_L2' | 'REJECTED';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lecturerId?: number;
  lecturerName?: string;
  lecturerEmail?: string;
  lecturerDepartment?: string;
  clos?: CLO[];
  cloMappings?: CLOPLOMapping[];
  approvalFeedback?: ApprovalFeedback[];
  programId?: number;
  programName?: string;
}

export interface ValidationResult {
  valid: boolean;
  score: number;
  maxScore: number;
  approved: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'ERROR' | 'WARNING';
}

export interface ValidationWarning {
  field: string;
  message: string;
  suggestion: string;
}

export interface SyllabusVersion {
  versionNumber: number;
  changeType: string;
  changedAt: string;
  changedBy: string;
  previousState: Partial<Syllabus>;
  newState: Partial<Syllabus>;
}

export interface SyllabusComparison {
  version1: SyllabusVersion;
  version2: SyllabusVersion;
  differences: FieldDifference[];
}

export interface FieldDifference {
  field: string;
  oldValue: any;
  newValue: any;
  changed: boolean;
}

export interface ApprovalResponse {
  syllabusId: number;
  approvalStatus: string;
  approvedAt: string;
  approvedBy: string;
  comment?: string;
}

export interface StatisticsData {
  totalSyllabuses: number;
  approvedSyllabuses: number;
  pendingApprovalSyllabuses: number;
  rejectedSyllabuses: number;
  cloMappingRate: number;
  averageCloPerSyllabus: number;
  programStatistics?: ProgramStatistic[];
  subjectStatistics?: SubjectStatistic[];
}

export interface ProgramStatistic {
  programId: number;
  programName: string;
  totalClos: number;
  mappedClos: number;
  totalPlos: number;
  mappedPlos: number;
  coveragePercentage: number;
  syllabusCount: number;
}

export interface SubjectStatistic {
  subjectId: number;
  subjectName: string;
  totalClos: number;
  mappedClos: number;
  coveragePercentage: number;
  syllabusCount: number;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  data?: any;
}

export interface SearchCriteria {
  keyword?: string;
  academicYear?: string;
  semester?: number;
  status?: string;
  approvalStatus?: string;
  programId?: number;
  subjectId?: number;
  page?: number;
  size?: number;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
}
