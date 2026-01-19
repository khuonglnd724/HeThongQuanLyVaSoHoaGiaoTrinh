-- ============================================================
-- ACADEMIC SERVICE DATABASE SCHEMA
-- ============================================================

-- Create academic_db database (already created in init.sql)
-- Tables for PLO, CLO, Mapping, Program, Subject, Syllabus

-- ============================================================
-- TABLE: program (Chương trình đào tạo)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.program (
    id BIGSERIAL PRIMARY KEY,
    program_code VARCHAR(50) NOT NULL UNIQUE,
    program_name VARCHAR(255) NOT NULL,
    description TEXT,
    department_id BIGINT NOT NULL,
    credits_required INT NOT NULL,
    duration_years INT NOT NULL,
    degree_type VARCHAR(50),
    accreditation_status VARCHAR(50),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    CONSTRAINT check_credits_positive CHECK (credits_required > 0),
    CONSTRAINT check_duration_positive CHECK (duration_years > 0)
);

CREATE INDEX idx_program_code ON public.program(program_code);
CREATE INDEX idx_program_department_id ON public.program(department_id);
CREATE INDEX idx_program_is_active ON public.program(is_active);

-- ============================================================
-- TABLE: subject (Môn học)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.subject (
    id BIGSERIAL PRIMARY KEY,
    subject_code VARCHAR(50) NOT NULL,
    subject_name VARCHAR(255) NOT NULL,
    description TEXT,
    program_id BIGINT NOT NULL,
    credits INT NOT NULL,
    semester INT NOT NULL,
    prerequisites TEXT,
    corequisites TEXT,
    subject_type VARCHAR(50),
    is_foundational BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    FOREIGN KEY (program_id) REFERENCES public.program(id),
    CONSTRAINT check_credits_positive CHECK (credits > 0),
    CONSTRAINT check_semester_positive CHECK (semester > 0),
    CONSTRAINT unique_subject_code_program UNIQUE(subject_code, program_id)
);

CREATE INDEX idx_subject_code ON public.subject(subject_code);
CREATE INDEX idx_subject_program_id ON public.subject(program_id);
CREATE INDEX idx_subject_is_active ON public.subject(is_active);
CREATE INDEX idx_subject_semester ON public.subject(semester);

-- ============================================================
-- TABLE: syllabus (Giáo trình)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.syllabus (
    id BIGSERIAL PRIMARY KEY,
    syllabus_code VARCHAR(50) NOT NULL,
    version INT NOT NULL,
    academic_year VARCHAR(50) NOT NULL,
    semester INT NOT NULL,
    subject_id BIGINT NOT NULL,
    content TEXT,
    learning_objectives TEXT,
    teaching_methods TEXT,
    assessment_methods TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'Draft',
    approval_status VARCHAR(50) NOT NULL DEFAULT 'Pending',
    approved_by BIGINT,
    approval_comments TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    FOREIGN KEY (subject_id) REFERENCES public.subject(id),
    CONSTRAINT check_version_positive CHECK (version > 0),
    CONSTRAINT check_semester_positive CHECK (semester > 0)
);

CREATE INDEX idx_syllabus_code ON public.syllabus(syllabus_code);
CREATE INDEX idx_syllabus_subject_id ON public.syllabus(subject_id);
CREATE INDEX idx_syllabus_is_active ON public.syllabus(is_active);
CREATE INDEX idx_syllabus_status ON public.syllabus(status);
CREATE INDEX idx_syllabus_approval_status ON public.syllabus(approval_status);

-- ============================================================
-- TABLE: plo (Program Learning Outcome - Chuẩn đầu ra chương trình)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.plo (
    id BIGSERIAL PRIMARY KEY,
    plo_code VARCHAR(50) NOT NULL,
    plo_name VARCHAR(255) NOT NULL,
    description TEXT,
    program_id BIGINT NOT NULL,
    display_order INT NOT NULL,
    plo_level VARCHAR(50),
    assessment_method VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    FOREIGN KEY (program_id) REFERENCES public.program(id),
    CONSTRAINT unique_plo_code_program UNIQUE(plo_code, program_id),
    CONSTRAINT check_display_order_positive CHECK (display_order >= 0)
);

CREATE INDEX idx_plo_program_id ON public.plo(program_id);
CREATE INDEX idx_plo_code ON public.plo(plo_code);
CREATE INDEX idx_plo_is_active ON public.plo(is_active);

-- ============================================================
-- TABLE: clo (Course Learning Outcome - Chuẩn đầu ra môn học)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.clo (
    id BIGSERIAL PRIMARY KEY,
    clo_code VARCHAR(50) NOT NULL,
    clo_name VARCHAR(255) NOT NULL,
    description TEXT,
    subject_id BIGINT NOT NULL,
    syllabus_id BIGINT,
    bloom_level VARCHAR(50),
    display_order INT NOT NULL,
    teaching_method VARCHAR(255),
    evaluation_method VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    FOREIGN KEY (subject_id) REFERENCES public.subject(id),
    FOREIGN KEY (syllabus_id) REFERENCES public.syllabus(id),
    CONSTRAINT check_display_order_positive CHECK (display_order >= 0)
);

CREATE INDEX idx_clo_subject_id ON public.clo(subject_id);
CREATE INDEX idx_clo_syllabus_id ON public.clo(syllabus_id);
CREATE INDEX idx_clo_code ON public.clo(clo_code);
CREATE INDEX idx_clo_is_active ON public.clo(is_active);

-- ============================================================
-- TABLE: clo_mapping (CLO-PLO Mapping - Bản đồ liên kết)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.clo_mapping (
    id BIGSERIAL PRIMARY KEY,
    clo_id BIGINT NOT NULL,
    plo_id BIGINT NOT NULL,
    mapping_level VARCHAR(50),
    proficiency_level VARCHAR(50),
    evidence_method TEXT,
    notes TEXT,
    strength_level INT NOT NULL DEFAULT 3,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    FOREIGN KEY (clo_id) REFERENCES public.clo(id),
    FOREIGN KEY (plo_id) REFERENCES public.plo(id),
    CONSTRAINT unique_clo_plo_mapping UNIQUE(clo_id, plo_id),
    CONSTRAINT check_strength_level CHECK (strength_level >= 1 AND strength_level <= 5)
);

CREATE INDEX idx_clo_mapping_clo_id ON public.clo_mapping(clo_id);
CREATE INDEX idx_clo_mapping_plo_id ON public.clo_mapping(plo_id);
CREATE INDEX idx_clo_mapping_is_active ON public.clo_mapping(is_active);

-- ============================================================
-- VIEWS FOR ANALYTICS
-- ============================================================

-- View: CLO Coverage by Program
CREATE OR REPLACE VIEW public.v_clo_coverage_by_program AS
SELECT 
    p.id,
    p.program_code,
    p.program_name,
    COUNT(DISTINCT c.id) as total_clos,
    COUNT(DISTINCT CASE WHEN cm.id IS NOT NULL THEN c.id END) as mapped_clos,
    COUNT(DISTINCT CASE WHEN cm.id IS NULL THEN c.id END) as unmapped_clos,
    ROUND(
        CASE 
            WHEN COUNT(DISTINCT c.id) > 0 
            THEN (COUNT(DISTINCT CASE WHEN cm.id IS NOT NULL THEN c.id END)::NUMERIC / COUNT(DISTINCT c.id)::NUMERIC * 100)
            ELSE 0 
        END, 2
    ) as coverage_percentage
FROM public.program p
LEFT JOIN public.subject s ON p.id = s.program_id AND s.is_active = true
LEFT JOIN public.clo c ON s.id = c.subject_id AND c.is_active = true
LEFT JOIN public.clo_mapping cm ON c.id = cm.clo_id AND cm.is_active = true
WHERE p.is_active = true
GROUP BY p.id, p.program_code, p.program_name;

-- View: PLO Coverage by Program
CREATE OR REPLACE VIEW public.v_plo_coverage_by_program AS
SELECT 
    p.id,
    p.program_code,
    p.program_name,
    COUNT(DISTINCT plo.id) as total_plos,
    COUNT(DISTINCT CASE WHEN cm.id IS NOT NULL THEN plo.id END) as covered_plos,
    COUNT(DISTINCT CASE WHEN cm.id IS NULL THEN plo.id END) as uncovered_plos
FROM public.program p
LEFT JOIN public.plo plo ON p.id = plo.program_id AND plo.is_active = true
LEFT JOIN public.clo_mapping cm ON plo.id = cm.plo_id AND cm.is_active = true
WHERE p.is_active = true
GROUP BY p.id, p.program_code, p.program_name;

-- View: Syllabus Approval Status
CREATE OR REPLACE VIEW public.v_syllabus_approval_summary AS
SELECT 
    p.id as program_id,
    p.program_code,
    p.program_name,
    COUNT(DISTINCT s.id) as total_syllabuses,
    COUNT(DISTINCT CASE WHEN s.approval_status = 'Approved' THEN s.id END) as approved,
    COUNT(DISTINCT CASE WHEN s.approval_status = 'Pending' THEN s.id END) as pending,
    COUNT(DISTINCT CASE WHEN s.approval_status = 'Rejected' THEN s.id END) as rejected
FROM public.program p
LEFT JOIN public.subject subj ON p.id = subj.program_id AND subj.is_active = true
LEFT JOIN public.syllabus s ON subj.id = s.subject_id AND s.is_active = true
WHERE p.is_active = true
GROUP BY p.id, p.program_code, p.program_name;

-- ============================================================
-- COMMENTS
-- ============================================================

COMMENT ON TABLE public.program IS 'Chương trình đào tạo';
COMMENT ON TABLE public.subject IS 'Môn học';
COMMENT ON TABLE public.syllabus IS 'Giáo trình';
COMMENT ON TABLE public.plo IS 'Program Learning Outcome - Chuẩn đầu ra chương trình';
COMMENT ON TABLE public.clo IS 'Course Learning Outcome - Chuẩn đầu ra môn học';
COMMENT ON TABLE public.clo_mapping IS 'Bản đồ liên kết giữa CLO và PLO';

COMMENT ON COLUMN public.clo.bloom_level IS 'Remember, Understand, Apply, Analyze, Evaluate, Create';
COMMENT ON COLUMN public.syllabus.status IS 'Draft, Submitted, Under Review, Approved, Rejected, Published';
COMMENT ON COLUMN public.syllabus.approval_status IS 'Pending, Approved, Rejected';
