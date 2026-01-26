export type Clo = {
  id: number;
  code: string;
  description?: string;
};

export type Plo = {
  id: number;
  code: string;
  description?: string;
};

export type CloPloMapRow = {
  cloId: number;
  cloCode: string;
  ploIds: number[];
};

export type AssessmentItem = {
  id: string;
  name: string;
  weight: number;
  description?: string;
};

export type SyllabusDraft = {
  id?: number;
  syllabusCode: string;
  subjectId: number;
  academicYear?: string;
  semester?: string;

  overview?: string;
  learningObjectives?: string;
  teachingMethods?: string;
  assessments?: string;
  content?: string;
  references?: string;

  cloRows: CloPloMapRow[];
  assessmentItems: AssessmentItem[];
};

export type SyllabusListItem = {
  id: number;
  syllabusCode: string;
  academicYear?: string;
  semester?: string;
  version?: number;
  updatedAt?: string;
};
