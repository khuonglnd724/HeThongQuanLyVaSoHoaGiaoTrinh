-- ============================================================
-- ACADEMIC DATABASE - SAMPLE DATA
-- Dữ liệu mẫu cho bảng program, subject, plo
-- Chạy AFTER: init.sql (tạo DB), academic_schema.sql (tạo tables)
-- ============================================================

-- Connect to academic_db (được tạo bởi init.sql)
\c academic_db;

-- ============================================================
-- SAMPLE DATA: program (Chương trình đào tạo)
-- ============================================================

-- Công nghệ thông tin
INSERT INTO public.program (program_code, program_name, description, department_id, credits_required, duration_years, degree_type, accreditation_status, is_active, created_by, updated_by)
VALUES 
('IT2024', 'Công nghệ Thông tin', 'Chương trình đào tạo Cử nhân Công nghệ Thông tin theo chuẩn CDIO', 1, 140, 4, 'Bachelor', 'Accredited', true, 'system', 'system'),
('SE2024', 'Kỹ thuật Phần mềm', 'Chương trình đào tạo Cử nhân Kỹ thuật Phần mềm theo chuẩn ABET', 1, 145, 4, 'Bachelor', 'Accredited', true, 'system', 'system'),
('DS2024', 'Khoa học Dữ liệu', 'Chương trình đào tạo Cử nhân Khoa học Dữ liệu và Trí tuệ Nhân tạo', 1, 142, 4, 'Bachelor', 'In Progress', true, 'system', 'system'),
('CS2024', 'Khoa học Máy tính', 'Chương trình đào tạo Cử nhân Khoa học Máy tính nghiên cứu', 1, 140, 4, 'Bachelor', 'Accredited', true, 'system', 'system'),
('IS2024', 'Hệ thống Thông tin', 'Chương trình đào tạo Cử nhân Hệ thống Thông tin quản lý', 1, 138, 4, 'Bachelor', 'Accredited', true, 'system', 'system')
ON CONFLICT (program_code) DO NOTHING;

-- ============================================================
-- SAMPLE DATA: plo (Program Learning Outcomes)
-- ============================================================

-- PLOs cho IT2024 (Công nghệ Thông tin)
INSERT INTO public.plo (plo_code, plo_name, description, program_id, display_order, plo_level, assessment_method, is_active, created_by, updated_by)
VALUES 
-- Knowledge (Kiến thức)
('PLO1.1', 'Kiến thức nền tảng CNTT', 'Vận dụng được kiến thức toán học, khoa học tự nhiên, khoa học xã hội và nhân văn vào giải quyết các vấn đề CNTT', (SELECT id FROM program WHERE program_code='IT2024'), 1, 'Foundation', 'Written Exam, Project', true, 'system', 'system'),
('PLO1.2', 'Kiến thức chuyên môn', 'Vận dụng kiến thức về cấu trúc dữ liệu, thuật toán, cơ sở dữ liệu, mạng máy tính và hệ điều hành', (SELECT id FROM program WHERE program_code='IT2024'), 2, 'Core', 'Written Exam, Lab Work', true, 'system', 'system'),
('PLO1.3', 'Kiến thức chuyên ngành', 'Vận dụng kiến thức chuyên sâu về phát triển phần mềm, công nghệ web, mobile và cloud computing', (SELECT id FROM program WHERE program_code='IT2024'), 3, 'Advanced', 'Project, Presentation', true, 'system', 'system'),

-- Skills (Kỹ năng)
('PLO2.1', 'Phân tích vấn đề', 'Phân tích, đánh giá và đề xuất giải pháp cho các bài toán thực tế trong lĩnh vực CNTT', (SELECT id FROM program WHERE program_code='IT2024'), 4, 'Core', 'Case Study, Project', true, 'system', 'system'),
('PLO2.2', 'Thiết kế hệ thống', 'Thiết kế và triển khai các hệ thống phần mềm đáp ứng yêu cầu kỹ thuật và nghiệp vụ', (SELECT id FROM program WHERE program_code='IT2024'), 5, 'Advanced', 'Design Document, Implementation', true, 'system', 'system'),
('PLO2.3', 'Lập trình và phát triển', 'Thực hiện lập trình, debug và tối ưu hóa code theo các chuẩn công nghiệp', (SELECT id FROM program WHERE program_code='IT2024'), 6, 'Core', 'Coding Assignment, Code Review', true, 'system', 'system'),
('PLO2.4', 'Kiểm thử phần mềm', 'Thiết kế và thực hiện test case, đảm bảo chất lượng phần mềm', (SELECT id FROM program WHERE program_code='IT2024'), 7, 'Core', 'Test Plan, Test Report', true, 'system', 'system'),
('PLO2.5', 'Làm việc nhóm', 'Làm việc hiệu quả trong môi trường nhóm, quản lý dự án phần mềm', (SELECT id FROM program WHERE program_code='IT2024'), 8, 'Core', 'Group Project, Peer Evaluation', true, 'system', 'system'),

-- Ethics & Professional (Đạo đức nghề nghiệp)
('PLO3.1', 'Đạo đức nghề nghiệp', 'Tuân thủ các chuẩn mực đạo đức, pháp luật và trách nhiệm xã hội trong CNTT', (SELECT id FROM program WHERE program_code='IT2024'), 9, 'Foundation', 'Essay, Case Study', true, 'system', 'system'),
('PLO3.2', 'An toàn thông tin', 'Nhận thức và thực hành các nguyên tắc bảo mật, quyền riêng tư dữ liệu', (SELECT id FROM program WHERE program_code='IT2024'), 10, 'Core', 'Security Assignment, Audit Report', true, 'system', 'system'),

-- Communication (Giao tiếp)
('PLO4.1', 'Giao tiếp chuyên môn', 'Trình bày rõ ràng các vấn đề kỹ thuật cho đối tượng chuyên môn và phi chuyên môn', (SELECT id FROM program WHERE program_code='IT2024'), 11, 'Core', 'Presentation, Technical Writing', true, 'system', 'system'),
('PLO4.2', 'Ngoại ngữ chuyên ngành', 'Sử dụng thành thạo tiếng Anh trong giao tiếp và tài liệu kỹ thuật', (SELECT id FROM program WHERE program_code='IT2024'), 12, 'Foundation', 'TOEIC, Technical Presentation', true, 'system', 'system'),

-- Learning & Development (Tự học và phát triển)
('PLO5.1', 'Tự học và nghiên cứu', 'Tự học và cập nhật kiến thức công nghệ mới, nghiên cứu khoa học', (SELECT id FROM program WHERE program_code='IT2024'), 13, 'Advanced', 'Research Paper, Self-study Report', true, 'system', 'system'),
('PLO5.2', 'Tư duy sáng tạo', 'Áp dụng tư duy phản biện và sáng tạo trong giải quyết vấn đề', (SELECT id FROM program WHERE program_code='IT2024'), 14, 'Advanced', 'Innovation Project, Patent', true, 'system', 'system')

ON CONFLICT (plo_code, program_id) DO NOTHING;

-- PLOs cho SE2024 (Kỹ thuật Phần mềm)
INSERT INTO public.plo (plo_code, plo_name, description, program_id, display_order, plo_level, assessment_method, is_active, created_by, updated_by)
VALUES 
('PLO1.1', 'Nền tảng kỹ thuật', 'Vận dụng kiến thức toán học, khoa học máy tính vào phát triển phần mềm', (SELECT id FROM program WHERE program_code='SE2024'), 1, 'Foundation', 'Written Exam', true, 'system', 'system'),
('PLO1.2', 'Quy trình phần mềm', 'Hiểu và áp dụng các quy trình phát triển phần mềm (Agile, DevOps, CI/CD)', (SELECT id FROM program WHERE program_code='SE2024'), 2, 'Core', 'Project Management', true, 'system', 'system'),
('PLO1.3', 'Kiến trúc phần mềm', 'Thiết kế kiến trúc phần mềm theo các mẫu thiết kế và best practices', (SELECT id FROM program WHERE program_code='SE2024'), 3, 'Advanced', 'Architecture Design', true, 'system', 'system'),
('PLO2.1', 'Requirements Engineering', 'Thu thập, phân tích và quản lý yêu cầu phần mềm', (SELECT id FROM program WHERE program_code='SE2024'), 4, 'Core', 'Requirements Document', true, 'system', 'system'),
('PLO2.2', 'Software Quality', 'Đảm bảo chất lượng phần mềm thông qua testing, inspection và metrics', (SELECT id FROM program WHERE program_code='SE2024'), 5, 'Core', 'QA Report, Metrics', true, 'system', 'system'),
('PLO2.3', 'Project Management', 'Quản lý dự án phần mềm, ước lượng chi phí và lịch trình', (SELECT id FROM program WHERE program_code='SE2024'), 6, 'Advanced', 'PM Plan, Gantt Chart', true, 'system', 'system')
ON CONFLICT (plo_code, program_id) DO NOTHING;

-- PLOs cho DS2024 (Khoa học Dữ liệu)
INSERT INTO public.plo (plo_code, plo_name, description, program_id, display_order, plo_level, assessment_method, is_active, created_by, updated_by)
VALUES 
('PLO1.1', 'Toán học và Thống kê', 'Vận dụng kiến thức toán học, xác suất thống kê trong phân tích dữ liệu', (SELECT id FROM program WHERE program_code='DS2024'), 1, 'Foundation', 'Written Exam', true, 'system', 'system'),
('PLO1.2', 'Machine Learning', 'Hiểu và áp dụng các thuật toán machine learning, deep learning', (SELECT id FROM program WHERE program_code='DS2024'), 2, 'Advanced', 'ML Project', true, 'system', 'system'),
('PLO1.3', 'Big Data Technologies', 'Làm việc với các công nghệ big data (Hadoop, Spark, NoSQL)', (SELECT id FROM program WHERE program_code='DS2024'), 3, 'Advanced', 'Big Data Project', true, 'system', 'system'),
('PLO2.1', 'Data Processing', 'Xử lý, làm sạch và chuẩn bị dữ liệu cho phân tích', (SELECT id FROM program WHERE program_code='DS2024'), 4, 'Core', 'Data Pipeline', true, 'system', 'system'),
('PLO2.2', 'Data Visualization', 'Trực quan hóa dữ liệu và truyền đạt insights hiệu quả', (SELECT id FROM program WHERE program_code='DS2024'), 5, 'Core', 'Dashboard, Report', true, 'system', 'system'),
('PLO2.3', 'AI Ethics', 'Nhận thức về đạo đức AI, bias và công bằng trong dữ liệu', (SELECT id FROM program WHERE program_code='DS2024'), 6, 'Core', 'Ethics Case Study', true, 'system', 'system')
ON CONFLICT (plo_code, program_id) DO NOTHING;

-- ============================================================
-- SAMPLE DATA: subject (Môn học)
-- ============================================================

-- Môn học cho IT2024
INSERT INTO public.subject (subject_code, subject_name, description, program_id, credits, semester, prerequisites, corequisites, subject_type, is_foundational, is_active, created_by, updated_by)
VALUES 
-- Học kỳ 1
('IT101', 'Nhập môn Lập trình', 'Các khái niệm cơ bản về lập trình, thuật toán và cấu trúc dữ liệu đơn giản', (SELECT id FROM program WHERE program_code='IT2024'), 4, 1, NULL, NULL, 'Core', true, true, 'system', 'system'),
('IT102', 'Toán rời rạc', 'Logic mệnh đề, tập hợp, quan hệ, đồ thị và cây', (SELECT id FROM program WHERE program_code='IT2024'), 3, 1, NULL, NULL, 'Foundation', true, true, 'system', 'system'),
('IT103', 'Kiến trúc Máy tính', 'Tổ chức và kiến trúc máy tính, hợp ngữ, bộ nhớ và I/O', (SELECT id FROM program WHERE program_code='IT2024'), 3, 1, NULL, NULL, 'Foundation', true, true, 'system', 'system'),

-- Học kỳ 2
('IT201', 'Lập trình Hướng đối tượng', 'OOP concepts với Java: class, object, inheritance, polymorphism', (SELECT id FROM program WHERE program_code='IT2024'), 4, 2, 'IT101', NULL, 'Core', false, true, 'system', 'system'),
('IT202', 'Cấu trúc Dữ liệu và Giải thuật', 'Stack, queue, linked list, tree, graph, sorting, searching algorithms', (SELECT id FROM program WHERE program_code='IT2024'), 4, 2, 'IT101,IT102', NULL, 'Core', true, true, 'system', 'system'),
('IT203', 'Cơ sở Dữ liệu', 'RDBMS, SQL, normalization, transaction, indexing', (SELECT id FROM program WHERE program_code='IT2024'), 4, 2, 'IT101', NULL, 'Core', true, true, 'system', 'system'),

-- Học kỳ 3
('IT301', 'Công nghệ Web', 'HTML, CSS, JavaScript, React, Node.js, RESTful API', (SELECT id FROM program WHERE program_code='IT2024'), 4, 3, 'IT201,IT203', NULL, 'Core', false, true, 'system', 'system'),
('IT302', 'Mạng Máy tính', 'OSI model, TCP/IP, routing, switching, network security', (SELECT id FROM program WHERE program_code='IT2024'), 3, 3, 'IT103', NULL, 'Core', true, true, 'system', 'system'),
('IT303', 'Hệ điều hành', 'Process management, memory management, file systems, concurrency', (SELECT id FROM program WHERE program_code='IT2024'), 3, 3, 'IT103,IT202', NULL, 'Core', true, true, 'system', 'system'),

-- Học kỳ 4
('IT401', 'Công nghệ Phần mềm', 'SDLC, Agile, requirements, design patterns, testing', (SELECT id FROM program WHERE program_code='IT2024'), 3, 4, 'IT201', NULL, 'Core', false, true, 'system', 'system'),
('IT402', 'An toàn và Bảo mật', 'Cryptography, network security, web security, ethical hacking', (SELECT id FROM program WHERE program_code='IT2024'), 3, 4, 'IT302', NULL, 'Core', false, true, 'system', 'system'),
('IT403', 'Trí tuệ Nhân tạo', 'Search algorithms, knowledge representation, machine learning basics', (SELECT id FROM program WHERE program_code='IT2024'), 3, 4, 'IT202', NULL, 'Elective', false, true, 'system', 'system'),

-- Học kỳ 5
('IT501', 'Phát triển Ứng dụng Di động', 'Android/iOS development, React Native, mobile UX/UI', (SELECT id FROM program WHERE program_code='IT2024'), 3, 5, 'IT301', NULL, 'Elective', false, true, 'system', 'system'),
('IT502', 'Cloud Computing', 'AWS/Azure/GCP, microservices, containerization, serverless', (SELECT id FROM program WHERE program_code='IT2024'), 3, 5, 'IT301,IT303', NULL, 'Elective', false, true, 'system', 'system'),
('IT503', 'Khoa học Dữ liệu', 'Data mining, data visualization, big data technologies', (SELECT id FROM program WHERE program_code='IT2024'), 3, 5, 'IT203,IT202', NULL, 'Elective', false, true, 'system', 'system'),

-- Học kỳ 6-8
('IT601', 'DevOps và CI/CD', 'Git, Docker, Jenkins, Kubernetes, infrastructure as code', (SELECT id FROM program WHERE program_code='IT2024'), 3, 6, 'IT401', NULL, 'Elective', false, true, 'system', 'system'),
('IT602', 'Blockchain và Ứng dụng', 'Blockchain fundamentals, smart contracts, DApps', (SELECT id FROM program WHERE program_code='IT2024'), 2, 6, 'IT203,IT402', NULL, 'Elective', false, true, 'system', 'system'),
('IT701', 'Thực tập Dự án', 'Capstone project với doanh nghiệp/startup', (SELECT id FROM program WHERE program_code='IT2024'), 6, 7, 'IT401', NULL, 'Project', false, true, 'system', 'system'),
('IT801', 'Khóa luận Tốt nghiệp', 'Final thesis/project', (SELECT id FROM program WHERE program_code='IT2024'), 10, 8, 'IT701', NULL, 'Thesis', false, true, 'system', 'system')

ON CONFLICT (subject_code, program_id) DO NOTHING;

-- Môn học cho SE2024
INSERT INTO public.subject (subject_code, subject_name, description, program_id, credits, semester, prerequisites, corequisites, subject_type, is_foundational, is_active, created_by, updated_by)
VALUES 
('SE101', 'Nhập môn Kỹ thuật Phần mềm', 'Software engineering principles, SDLC, software crisis', (SELECT id FROM program WHERE program_code='SE2024'), 3, 1, NULL, NULL, 'Core', true, true, 'system', 'system'),
('SE201', 'Requirements Engineering', 'Requirements elicitation, analysis, specification, validation', (SELECT id FROM program WHERE program_code='SE2024'), 3, 2, 'SE101', NULL, 'Core', false, true, 'system', 'system'),
('SE301', 'Software Design', 'Design patterns, SOLID principles, UML, software architecture', (SELECT id FROM program WHERE program_code='SE2024'), 4, 3, 'SE201', NULL, 'Core', false, true, 'system', 'system'),
('SE302', 'Software Testing', 'Unit testing, integration testing, test automation, TDD', (SELECT id FROM program WHERE program_code='SE2024'), 3, 3, 'SE201', NULL, 'Core', false, true, 'system', 'system'),
('SE401', 'Software Quality Assurance', 'Quality metrics, code review, static analysis, SQA process', (SELECT id FROM program WHERE program_code='SE2024'), 3, 4, 'SE302', NULL, 'Core', false, true, 'system', 'system'),
('SE402', 'Software Project Management', 'Project planning, estimation, risk management, team management', (SELECT id FROM program WHERE program_code='SE2024'), 3, 4, 'SE301', NULL, 'Core', false, true, 'system', 'system'),
('SE501', 'Agile Development', 'Scrum, Kanban, XP, user stories, sprint planning', (SELECT id FROM program WHERE program_code='SE2024'), 3, 5, 'SE402', NULL, 'Core', false, true, 'system', 'system')
ON CONFLICT (subject_code, program_id) DO NOTHING;

-- Môn học cho DS2024
INSERT INTO public.subject (subject_code, subject_name, description, program_id, credits, semester, prerequisites, corequisites, subject_type, is_foundational, is_active, created_by, updated_by)
VALUES 
('DS101', 'Nhập môn Khoa học Dữ liệu', 'Data science overview, tools, Python for data science', (SELECT id FROM program WHERE program_code='DS2024'), 3, 1, NULL, NULL, 'Core', true, true, 'system', 'system'),
('DS102', 'Xác suất Thống kê', 'Probability theory, statistical inference, hypothesis testing', (SELECT id FROM program WHERE program_code='DS2024'), 4, 1, NULL, NULL, 'Foundation', true, true, 'system', 'system'),
('DS201', 'Machine Learning', 'Supervised/unsupervised learning, neural networks, model evaluation', (SELECT id FROM program WHERE program_code='DS2024'), 4, 2, 'DS101,DS102', NULL, 'Core', false, true, 'system', 'system'),
('DS301', 'Deep Learning', 'CNN, RNN, LSTM, GAN, transformer architectures', (SELECT id FROM program WHERE program_code='DS2024'), 4, 3, 'DS201', NULL, 'Core', false, true, 'system', 'system'),
('DS302', 'Big Data Analytics', 'Hadoop, Spark, distributed computing, stream processing', (SELECT id FROM program WHERE program_code='DS2024'), 3, 3, 'DS201', NULL, 'Core', false, true, 'system', 'system'),
('DS401', 'Natural Language Processing', 'Text processing, sentiment analysis, language models, LLM', (SELECT id FROM program WHERE program_code='DS2024'), 3, 4, 'DS301', NULL, 'Elective', false, true, 'system', 'system'),
('DS402', 'Computer Vision', 'Image processing, object detection, image segmentation', (SELECT id FROM program WHERE program_code='DS2024'), 3, 4, 'DS301', NULL, 'Elective', false, true, 'system', 'system')
ON CONFLICT (subject_code, program_id) DO NOTHING;

-- ============================================================
-- VERIFICATION QUERIES (Comment these out in production)
-- ============================================================

-- Check inserted programs
-- SELECT program_code, program_name, credits_required, duration_years FROM program ORDER BY program_code;

-- Check PLOs count per program
-- SELECT p.program_code, p.program_name, COUNT(plo.id) as plo_count 
-- FROM program p 
-- LEFT JOIN plo ON plo.program_id = p.id 
-- GROUP BY p.id, p.program_code, p.program_name 
-- ORDER BY p.program_code;

-- Check subjects count per program
-- SELECT p.program_code, p.program_name, COUNT(s.id) as subject_count, SUM(s.credits) as total_credits
-- FROM program p 
-- LEFT JOIN subject s ON s.program_id = p.id 
-- GROUP BY p.id, p.program_code, p.program_name 
-- ORDER BY p.program_code;

-- Check subjects by semester
-- SELECT p.program_code, s.semester, COUNT(s.id) as subjects, SUM(s.credits) as credits
-- FROM subject s
-- JOIN program p ON s.program_id = p.id
-- GROUP BY p.program_code, s.semester
-- ORDER BY p.program_code, s.semester;

-- ============================================================
-- SAMPLE DATA: clo (Course Learning Outcomes) cho toàn bộ môn học
-- Mỗi môn 3 CLO: kiến thức, kỹ năng, vận dụng/đánh giá
-- ============================================================

-- IT101 - Nhập môn Lập trình
INSERT INTO public.clo (clo_code, clo_name, description, subject_id, bloom_level, display_order, teaching_method, evaluation_method, created_by, updated_by) VALUES
('IT101-CLO1', 'Hiểu cấu trúc chương trình', 'Giải thích được biến, kiểu dữ liệu, cấu trúc điều khiển cơ bản', (SELECT id FROM subject WHERE subject_code='IT101'), 'Remember/Understand', 1, 'Lecture, Demo', 'Quiz, Written exam', 'system', 'system'),
('IT101-CLO2', 'Viết chương trình đơn giản', 'Cài đặt thuật toán đơn giản bằng ngôn ngữ lập trình bậc cao', (SELECT id FROM subject WHERE subject_code='IT101'), 'Apply', 2, 'Lab, Pair programming', 'Lab assignment', 'system', 'system'),
('IT101-CLO3', 'Phân tích và sửa lỗi', 'Sử dụng công cụ debug để tìm và sửa lỗi logic', (SELECT id FROM subject WHERE subject_code='IT101'), 'Analyze', 3, 'Lab, Practice', 'Practical test', 'system', 'system');

-- IT102 - Toán rời rạc
INSERT INTO public.clo (clo_code, clo_name, description, subject_id, bloom_level, display_order, teaching_method, evaluation_method, created_by, updated_by) VALUES
('IT102-CLO1', 'Vận dụng logic mệnh đề', 'Chứng minh và biến đổi mệnh đề, bảng chân trị', (SELECT id FROM subject WHERE subject_code='IT102'), 'Apply', 1, 'Lecture, Tutorial', 'Quiz, Written exam', 'system', 'system'),
('IT102-CLO2', 'Mô hình hóa quan hệ & hàm', 'Áp dụng quan hệ, hàm, đếm và xác suất rời rạc', (SELECT id FROM subject WHERE subject_code='IT102'), 'Apply', 2, 'Lecture, Exercise', 'Homework, Midterm', 'system', 'system'),
('IT102-CLO3', 'Phân tích cấu trúc đồ thị', 'Nhận diện và phân tích cây, đồ thị, ứng dụng đường đi ngắn nhất', (SELECT id FROM subject WHERE subject_code='IT102'), 'Analyze', 3, 'Lecture, Problem-based', 'Written exam', 'system', 'system');

-- IT103 - Kiến trúc Máy tính
INSERT INTO public.clo (clo_code, clo_name, description, subject_id, bloom_level, display_order, teaching_method, evaluation_method, created_by, updated_by) VALUES
('IT103-CLO1', 'Hiểu cấu trúc phần cứng', 'Mô tả kiến trúc CPU, bộ nhớ, I/O và pipeline', (SELECT id FROM subject WHERE subject_code='IT103'), 'Understand', 1, 'Lecture', 'Quiz, Written exam', 'system', 'system'),
('IT103-CLO2', 'Phân tích lệnh máy', 'Đọc và giải thích lệnh hợp ngữ cơ bản', (SELECT id FROM subject WHERE subject_code='IT103'), 'Analyze', 2, 'Lecture, Lab', 'Lab assignment', 'system', 'system'),
('IT103-CLO3', 'Đánh giá hiệu năng', 'So sánh các yếu tố ảnh hưởng đến hiệu năng hệ thống', (SELECT id FROM subject WHERE subject_code='IT103'), 'Evaluate', 3, 'Case study', 'Report, Presentation', 'system', 'system');

-- IT201 - Lập trình Hướng đối tượng
INSERT INTO public.clo (clo_code, clo_name, description, subject_id, bloom_level, display_order, teaching_method, evaluation_method, created_by, updated_by) VALUES
('IT201-CLO1', 'Thiết kế lớp & đối tượng', 'Áp dụng đóng gói, kế thừa, đa hình trong thiết kế', (SELECT id FROM subject WHERE subject_code='IT201'), 'Apply', 1, 'Lecture, Lab', 'Lab assignment', 'system', 'system'),
('IT201-CLO2', 'Cài đặt mẫu thiết kế cơ bản', 'Sử dụng các pattern như Singleton, Factory, Strategy', (SELECT id FROM subject WHERE subject_code='IT201'), 'Apply', 2, 'Lab, Workshop', 'Project', 'system', 'system'),
('IT201-CLO3', 'Kiểm thử đơn vị', 'Viết test và refactor mã OOP', (SELECT id FROM subject WHERE subject_code='IT201'), 'Evaluate', 3, 'Lab', 'Unit test coverage', 'system', 'system');

-- IT202 - Cấu trúc Dữ liệu và Giải thuật
INSERT INTO public.clo (clo_code, clo_name, description, subject_id, bloom_level, display_order, teaching_method, evaluation_method, created_by, updated_by) VALUES
('IT202-CLO1', 'Chọn cấu trúc dữ liệu phù hợp', 'Liên hệ yêu cầu bài toán với mảng, danh sách, cây, đồ thị', (SELECT id FROM subject WHERE subject_code='IT202'), 'Analyze', 1, 'Lecture, Lab', 'Quiz, Lab', 'system', 'system'),
('IT202-CLO2', 'Phân tích độ phức tạp', 'Tính toán thời gian/không gian Big-O cho thuật toán', (SELECT id FROM subject WHERE subject_code='IT202'), 'Analyze', 2, 'Lecture, Exercise', 'Written exam', 'system', 'system'),
('IT202-CLO3', 'Cài đặt và tối ưu thuật toán', 'Cài đặt sort/search, graph traversal và tối ưu cơ bản', (SELECT id FROM subject WHERE subject_code='IT202'), 'Apply', 3, 'Lab, Coding practice', 'Programming assignment', 'system', 'system');

-- IT203 - Cơ sở Dữ liệu
INSERT INTO public.clo (clo_code, clo_name, description, subject_id, bloom_level, display_order, teaching_method, evaluation_method, created_by, updated_by) VALUES
('IT203-CLO1', 'Thiết kế lược đồ quan hệ', 'Chuẩn hóa và tạo mô hình ER thành lược đồ quan hệ', (SELECT id FROM subject WHERE subject_code='IT203'), 'Apply', 1, 'Lecture, Lab', 'Project (schema design)', 'system', 'system'),
('IT203-CLO2', 'Viết truy vấn SQL', 'Thực hiện SELECT/INSERT/UPDATE/DELETE, JOIN, GROUP BY', (SELECT id FROM subject WHERE subject_code='IT203'), 'Apply', 2, 'Lab', 'SQL lab tests', 'system', 'system'),
('IT203-CLO3', 'Quản lý giao dịch & chỉ mục', 'Giải thích ACID, locking, indexing và tối ưu truy vấn', (SELECT id FROM subject WHERE subject_code='IT203'), 'Understand/Analyze', 3, 'Lecture, Case study', 'Written exam', 'system', 'system');

-- IT301 - Công nghệ Web
INSERT INTO public.clo (clo_code, clo_name, description, subject_id, bloom_level, display_order, teaching_method, evaluation_method, created_by, updated_by) VALUES
('IT301-CLO1', 'Xây dựng frontend cơ bản', 'Tạo UI responsive với HTML/CSS/JS', (SELECT id FROM subject WHERE subject_code='IT301'), 'Apply', 1, 'Lab, Demo', 'Frontend assignment', 'system', 'system'),
('IT301-CLO2', 'Phát triển RESTful API', 'Thiết kế và cài đặt API với xác thực cơ bản', (SELECT id FROM subject WHERE subject_code='IT301'), 'Apply', 2, 'Lab, Project', 'Backend assignment', 'system', 'system'),
('IT301-CLO3', 'Triển khai ứng dụng web', 'Đóng gói và deploy ứng dụng web trên môi trường cloud/container', (SELECT id FROM subject WHERE subject_code='IT301'), 'Evaluate', 3, 'Workshop', 'Project demo', 'system', 'system');

-- IT302 - Mạng Máy tính
INSERT INTO public.clo (clo_code, clo_name, description, subject_id, bloom_level, display_order, teaching_method, evaluation_method, created_by, updated_by) VALUES
('IT302-CLO1', 'Phân tích mô hình OSI/TCP-IP', 'Mô tả chức năng từng tầng và giao thức tiêu biểu', (SELECT id FROM subject WHERE subject_code='IT302'), 'Understand', 1, 'Lecture', 'Quiz', 'system', 'system'),
('IT302-CLO2', 'Cấu hình mạng cơ bản', 'Thiết lập địa chỉ IP, routing tĩnh, VLAN đơn giản', (SELECT id FROM subject WHERE subject_code='IT302'), 'Apply', 2, 'Lab', 'Lab practical', 'system', 'system'),
('IT302-CLO3', 'Đánh giá an ninh mạng', 'Nhận diện rủi ro và đề xuất biện pháp bảo vệ', (SELECT id FROM subject WHERE subject_code='IT302'), 'Evaluate', 3, 'Case study', 'Report', 'system', 'system');

-- IT303 - Hệ điều hành
INSERT INTO public.clo (clo_code, clo_name, description, subject_id, bloom_level, display_order, teaching_method, evaluation_method, created_by, updated_by) VALUES
('IT303-CLO1', 'Mô tả quản lý tiến trình', 'Giải thích scheduling, đồng bộ và deadlock', (SELECT id FROM subject WHERE subject_code='IT303'), 'Understand', 1, 'Lecture', 'Quiz', 'system', 'system'),
('IT303-CLO2', 'Quản lý bộ nhớ', 'So sánh paging, segmentation, virtual memory', (SELECT id FROM subject WHERE subject_code='IT303'), 'Analyze', 2, 'Lecture, Tutorial', 'Written exam', 'system', 'system'),
('IT303-CLO3', 'Lập trình hệ thống', 'Viết chương trình thao tác process/thread và I/O', (SELECT id FROM subject WHERE subject_code='IT303'), 'Apply', 3, 'Lab', 'Programming assignment', 'system', 'system');

-- IT401 - Công nghệ Phần mềm
INSERT INTO public.clo (clo_code, clo_name, description, subject_id, bloom_level, display_order, teaching_method, evaluation_method, created_by, updated_by) VALUES
('IT401-CLO1', 'Ứng dụng quy trình phát triển', 'Lập kế hoạch và theo dõi tiến độ Agile/Scrum', (SELECT id FROM subject WHERE subject_code='IT401'), 'Apply', 1, 'Workshop, Project', 'Project plan', 'system', 'system'),
('IT401-CLO2', 'Thiết kế kiến trúc', 'Phân tích và thiết kế kiến trúc nhiều lớp, microservices', (SELECT id FROM subject WHERE subject_code='IT401'), 'Analyze', 2, 'Lecture, Studio', 'Design document', 'system', 'system'),
('IT401-CLO3', 'Đảm bảo chất lượng', 'Áp dụng review, testing và CI/CD cơ bản', (SELECT id FROM subject WHERE subject_code='IT401'), 'Evaluate', 3, 'Lab, Project', 'QA report', 'system', 'system');

-- IT402 - An toàn và Bảo mật
INSERT INTO public.clo (clo_code, clo_name, description, subject_id, bloom_level, display_order, teaching_method, evaluation_method, created_by, updated_by) VALUES
('IT402-CLO1', 'Áp dụng nguyên lý mật mã', 'Thực hành mã hóa đối xứng/bất đối xứng và hash', (SELECT id FROM subject WHERE subject_code='IT402'), 'Apply', 1, 'Lab', 'Lab assignment', 'system', 'system'),
('IT402-CLO2', 'Đánh giá lỗ hổng', 'Nhận diện lỗ hổng web phổ biến (OWASP Top 10)', (SELECT id FROM subject WHERE subject_code='IT402'), 'Analyze', 2, 'Lab, Case study', 'Report', 'system', 'system'),
('IT402-CLO3', 'Thiết kế biện pháp bảo vệ', 'Đề xuất kiểm soát an ninh mạng và ứng dụng', (SELECT id FROM subject WHERE subject_code='IT402'), 'Evaluate', 3, 'Workshop', 'Presentation', 'system', 'system');

-- IT403 - Trí tuệ Nhân tạo
INSERT INTO public.clo (clo_code, clo_name, description, subject_id, bloom_level, display_order, teaching_method, evaluation_method, created_by, updated_by) VALUES
('IT403-CLO1', 'Áp dụng thuật toán tìm kiếm', 'Thực hiện tìm kiếm vô thông tin và có thông tin', (SELECT id FROM subject WHERE subject_code='IT403'), 'Apply', 1, 'Lecture, Lab', 'Quiz, Lab', 'system', 'system'),
('IT403-CLO2', 'Mô hình hóa tri thức', 'Biểu diễn tri thức và suy luận logic đơn giản', (SELECT id FROM subject WHERE subject_code='IT403'), 'Understand/Apply', 2, 'Lecture', 'Written exam', 'system', 'system'),
('IT403-CLO3', 'Thử nghiệm ML cơ bản', 'Huấn luyện và đánh giá mô hình ML đơn giản', (SELECT id FROM subject WHERE subject_code='IT403'), 'Apply', 3, 'Lab', 'Mini project', 'system', 'system');

-- IT501 - Phát triển Ứng dụng Di động
INSERT INTO public.clo (clo_code, clo_name, description, subject_id, bloom_level, display_order, teaching_method, evaluation_method, created_by, updated_by) VALUES
('IT501-CLO1', 'Thiết kế UI/UX mobile', 'Xây dựng giao diện đáp ứng guideline nền tảng', (SELECT id FROM subject WHERE subject_code='IT501'), 'Apply', 1, 'Lab, Studio', 'UI assignment', 'system', 'system'),
('IT501-CLO2', 'Tích hợp API & dữ liệu', 'Kết nối REST API, local storage và sync', (SELECT id FROM subject WHERE subject_code='IT501'), 'Apply', 2, 'Lab', 'Functional demo', 'system', 'system'),
('IT501-CLO3', 'Tối ưu & đóng gói app', 'Tối ưu hiệu năng và đóng gói phát hành thử', (SELECT id FROM subject WHERE subject_code='IT501'), 'Evaluate', 3, 'Workshop', 'Project demo', 'system', 'system');

-- IT502 - Cloud Computing
INSERT INTO public.clo (clo_code, clo_name, description, subject_id, bloom_level, display_order, teaching_method, evaluation_method, created_by, updated_by) VALUES
('IT502-CLO1', 'Triển khai dịch vụ trên cloud', 'Tạo và cấu hình dịch vụ compute/storage cơ bản', (SELECT id FROM subject WHERE subject_code='IT502'), 'Apply', 1, 'Lab', 'Lab checklist', 'system', 'system'),
('IT502-CLO2', 'Đóng gói bằng container', 'Xây dựng và chạy ứng dụng bằng Docker', (SELECT id FROM subject WHERE subject_code='IT502'), 'Apply', 2, 'Lab', 'Practical test', 'system', 'system'),
('IT502-CLO3', 'Thiết kế kiến trúc cloud', 'Đề xuất kiến trúc có tính sẵn sàng và bảo mật', (SELECT id FROM subject WHERE subject_code='IT502'), 'Evaluate', 3, 'Case study', 'Architecture report', 'system', 'system');

-- IT503 - Khoa học Dữ liệu
INSERT INTO public.clo (clo_code, clo_name, description, subject_id, bloom_level, display_order, teaching_method, evaluation_method, created_by, updated_by) VALUES
('IT503-CLO1', 'Tiền xử lý dữ liệu', 'Làm sạch, biến đổi và trực quan hóa dữ liệu', (SELECT id FROM subject WHERE subject_code='IT503'), 'Apply', 1, 'Lab', 'Notebook submission', 'system', 'system'),
('IT503-CLO2', 'Xây dựng mô hình dự đoán', 'Huấn luyện và đánh giá mô hình ML giám sát', (SELECT id FROM subject WHERE subject_code='IT503'), 'Analyze', 2, 'Lab', 'Project', 'system', 'system'),
('IT503-CLO3', 'Diễn giải kết quả', 'Trình bày insight và hạn chế của mô hình', (SELECT id FROM subject WHERE subject_code='IT503'), 'Evaluate', 3, 'Presentation', 'Report', 'system', 'system');

-- IT601 - DevOps và CI/CD
INSERT INTO public.clo (clo_code, clo_name, description, subject_id, bloom_level, display_order, teaching_method, evaluation_method, created_by, updated_by) VALUES
('IT601-CLO1', 'Thiết lập pipeline CI', 'Tự động build/test với công cụ CI phổ biến', (SELECT id FROM subject WHERE subject_code='IT601'), 'Apply', 1, 'Lab', 'Pipeline demo', 'system', 'system'),
('IT601-CLO2', 'Triển khai CD', 'Triển khai liên tục lên môi trường thử nghiệm', (SELECT id FROM subject WHERE subject_code='IT601'), 'Apply', 2, 'Lab, Workshop', 'Deployment demo', 'system', 'system'),
('IT601-CLO3', 'Giám sát và logging', 'Thiết lập monitoring/logging cơ bản', (SELECT id FROM subject WHERE subject_code='IT601'), 'Analyze', 3, 'Lab', 'Ops report', 'system', 'system');

-- IT602 - Blockchain và Ứng dụng
INSERT INTO public.clo (clo_code, clo_name, description, subject_id, bloom_level, display_order, teaching_method, evaluation_method, created_by, updated_by) VALUES
('IT602-CLO1', 'Hiểu kiến trúc blockchain', 'Mô tả block, consensus, smart contract', (SELECT id FROM subject WHERE subject_code='IT602'), 'Understand', 1, 'Lecture', 'Quiz', 'system', 'system'),
('IT602-CLO2', 'Viết smart contract đơn giản', 'Cài đặt và kiểm thử hợp đồng thông minh', (SELECT id FROM subject WHERE subject_code='IT602'), 'Apply', 2, 'Lab', 'Contract demo', 'system', 'system'),
('IT602-CLO3', 'Phân tích use-case', 'Đánh giá phù hợp của blockchain cho bài toán cụ thể', (SELECT id FROM subject WHERE subject_code='IT602'), 'Evaluate', 3, 'Case study', 'Presentation', 'system', 'system');

-- IT701 - Thực tập Dự án
INSERT INTO public.clo (clo_code, clo_name, description, subject_id, bloom_level, display_order, teaching_method, evaluation_method, created_by, updated_by) VALUES
('IT701-CLO1', 'Xác định yêu cầu dự án', 'Làm việc với stakeholder để thu thập yêu cầu', (SELECT id FROM subject WHERE subject_code='IT701'), 'Apply', 1, 'Project', 'Project proposal', 'system', 'system'),
('IT701-CLO2', 'Triển khai giải pháp', 'Phát triển và tích hợp các thành phần chính', (SELECT id FROM subject WHERE subject_code='IT701'), 'Apply', 2, 'Project', 'Sprint review', 'system', 'system'),
('IT701-CLO3', 'Đánh giá kết quả', 'Kiểm thử, tài liệu hóa và bàn giao', (SELECT id FROM subject WHERE subject_code='IT701'), 'Evaluate', 3, 'Project', 'Final demo', 'system', 'system');

-- IT801 - Khóa luận Tốt nghiệp
INSERT INTO public.clo (clo_code, clo_name, description, subject_id, bloom_level, display_order, teaching_method, evaluation_method, created_by, updated_by) VALUES
('IT801-CLO1', 'Nghiên cứu và tổng quan', 'Thực hiện khảo sát tài liệu, xác định vấn đề nghiên cứu', (SELECT id FROM subject WHERE subject_code='IT801'), 'Analyze', 1, 'Self-study, Supervision', 'Proposal defense', 'system', 'system'),
('IT801-CLO2', 'Thực nghiệm/triển khai', 'Thiết kế thí nghiệm hoặc hệ thống minh chứng', (SELECT id FROM subject WHERE subject_code='IT801'), 'Apply', 2, 'Project', 'Progress review', 'system', 'system'),
('IT801-CLO3', 'Bảo vệ kết quả', 'Viết báo cáo và trình bày bảo vệ', (SELECT id FROM subject WHERE subject_code='IT801'), 'Evaluate/Create', 3, 'Seminar', 'Thesis defense', 'system', 'system');

-- SE101 - Nhập môn Kỹ thuật Phần mềm
INSERT INTO public.clo (clo_code, clo_name, description, subject_id, bloom_level, display_order, teaching_method, evaluation_method, created_by, updated_by) VALUES
('SE101-CLO1', 'Mô tả vòng đời phần mềm', 'Trình bày các mô hình quy trình và vai trò', (SELECT id FROM subject WHERE subject_code='SE101'), 'Understand', 1, 'Lecture', 'Quiz', 'system', 'system'),
('SE101-CLO2', 'Phân tích yêu cầu sơ bộ', 'Thu thập và đặc tả yêu cầu mức cao', (SELECT id FROM subject WHERE subject_code='SE101'), 'Apply', 2, 'Workshop', 'Requirement doc', 'system', 'system'),
('SE101-CLO3', 'Làm việc nhóm kỹ thuật', 'Thực hành cộng tác, quản lý công việc', (SELECT id FROM subject WHERE subject_code='SE101'), 'Apply', 3, 'Team exercise', 'Peer evaluation', 'system', 'system');

-- SE201 - Requirements Engineering
INSERT INTO public.clo (clo_code, clo_name, description, subject_id, bloom_level, display_order, teaching_method, evaluation_method, created_by, updated_by) VALUES
('SE201-CLO1', 'Kỹ thuật elicitation', 'Áp dụng phỏng vấn, quan sát, workshop', (SELECT id FROM subject WHERE subject_code='SE201'), 'Apply', 1, 'Role-play, Workshop', 'Requirement spec', 'system', 'system'),
('SE201-CLO2', 'Phân tích & ưu tiên yêu cầu', 'Dùng use case, user story, MoSCoW', (SELECT id FROM subject WHERE subject_code='SE201'), 'Analyze', 2, 'Lecture, Exercise', 'Specification review', 'system', 'system'),
('SE201-CLO3', 'Quản lý thay đổi', 'Theo dõi traceability và kiểm soát thay đổi', (SELECT id FROM subject WHERE subject_code='SE201'), 'Evaluate', 3, 'Case study', 'Change log', 'system', 'system');

-- SE301 - Software Design
INSERT INTO public.clo (clo_code, clo_name, description, subject_id, bloom_level, display_order, teaching_method, evaluation_method, created_by, updated_by) VALUES
('SE301-CLO1', 'Mô hình hóa kiến trúc', 'Xây dựng sơ đồ UML, kiến trúc phân lớp', (SELECT id FROM subject WHERE subject_code='SE301'), 'Apply', 1, 'Studio, Lab', 'Design assignment', 'system', 'system'),
('SE301-CLO2', 'Áp dụng design patterns', 'Chọn và cài đặt pattern phù hợp', (SELECT id FROM subject WHERE subject_code='SE301'), 'Apply', 2, 'Lab', 'Programming assignment', 'system', 'system'),
('SE301-CLO3', 'Đánh giá chất lượng thiết kế', 'Phân tích coupling, cohesion, maintainability', (SELECT id FROM subject WHERE subject_code='SE301'), 'Evaluate', 3, 'Review session', 'Design review', 'system', 'system');

-- SE302 - Software Testing
INSERT INTO public.clo (clo_code, clo_name, description, subject_id, bloom_level, display_order, teaching_method, evaluation_method, created_by, updated_by) VALUES
('SE302-CLO1', 'Thiết kế test case', 'Áp dụng kỹ thuật hộp đen/hộp trắng', (SELECT id FROM subject WHERE subject_code='SE302'), 'Apply', 1, 'Lab', 'Test case portfolio', 'system', 'system'),
('SE302-CLO2', 'Tự động hóa kiểm thử', 'Dùng framework test automation cho UI/API', (SELECT id FROM subject WHERE subject_code='SE302'), 'Apply', 2, 'Lab', 'Automation demo', 'system', 'system'),
('SE302-CLO3', 'Đánh giá chất lượng', 'Phân tích kết quả test và báo cáo lỗi', (SELECT id FROM subject WHERE subject_code='SE302'), 'Evaluate', 3, 'Workshop', 'Test report', 'system', 'system');

-- SE401 - Software Quality Assurance
INSERT INTO public.clo (clo_code, clo_name, description, subject_id, bloom_level, display_order, teaching_method, evaluation_method, created_by, updated_by) VALUES
('SE401-CLO1', 'Thiết lập quy trình QA', 'Xây dựng kế hoạch chất lượng và chuẩn tuân thủ', (SELECT id FROM subject WHERE subject_code='SE401'), 'Apply', 1, 'Lecture, Workshop', 'QA plan', 'system', 'system'),
('SE401-CLO2', 'Đo lường chất lượng', 'Sử dụng metrics để đánh giá sản phẩm/quy trình', (SELECT id FROM subject WHERE subject_code='SE401'), 'Analyze', 2, 'Lab', 'Metrics report', 'system', 'system'),
('SE401-CLO3', 'Thực hiện audit/review', 'Tiến hành review, audit quy trình', (SELECT id FROM subject WHERE subject_code='SE401'), 'Apply/Evaluate', 3, 'Case study', 'Audit report', 'system', 'system');

-- SE402 - Software Project Management
INSERT INTO public.clo (clo_code, clo_name, description, subject_id, bloom_level, display_order, teaching_method, evaluation_method, created_by, updated_by) VALUES
('SE402-CLO1', 'Lập kế hoạch dự án', 'Ước lượng, lập lịch và phân bổ nguồn lực', (SELECT id FROM subject WHERE subject_code='SE402'), 'Apply', 1, 'Workshop', 'Project plan', 'system', 'system'),
('SE402-CLO2', 'Quản lý rủi ro', 'Nhận diện, phân tích và ứng phó rủi ro', (SELECT id FROM subject WHERE subject_code='SE402'), 'Analyze', 2, 'Case study', 'Risk register', 'system', 'system'),
('SE402-CLO3', 'Theo dõi & báo cáo', 'Sử dụng công cụ theo dõi tiến độ và báo cáo', (SELECT id FROM subject WHERE subject_code='SE402'), 'Apply', 3, 'Lab', 'Status report', 'system', 'system');

-- SE501 - Agile Development
INSERT INTO public.clo (clo_code, clo_name, description, subject_id, bloom_level, display_order, teaching_method, evaluation_method, created_by, updated_by) VALUES
('SE501-CLO1', 'Vận dụng Scrum/Kanban', 'Thiết lập board, sprint và vai trò', (SELECT id FROM subject WHERE subject_code='SE501'), 'Apply', 1, 'Workshop', 'Sprint plan', 'system', 'system'),
('SE501-CLO2', 'Viết user story & backlog', 'Ước lượng và ưu tiên backlog', (SELECT id FROM subject WHERE subject_code='SE501'), 'Apply', 2, 'Lab', 'Backlog quality', 'system', 'system'),
('SE501-CLO3', 'Cải tiến liên tục', 'Đánh giá retro và đề xuất cải tiến', (SELECT id FROM subject WHERE subject_code='SE501'), 'Evaluate', 3, 'Team exercise', 'Retro report', 'system', 'system');

-- DS101 - Nhập môn Khoa học Dữ liệu
INSERT INTO public.clo (clo_code, clo_name, description, subject_id, bloom_level, display_order, teaching_method, evaluation_method, created_by, updated_by) VALUES
('DS101-CLO1', 'Chuẩn bị dữ liệu', 'Thu thập, làm sạch và khám phá dữ liệu', (SELECT id FROM subject WHERE subject_code='DS101'), 'Apply', 1, 'Lab', 'Notebook assignment', 'system', 'system'),
('DS101-CLO2', 'Trực quan hóa cơ bản', 'Tạo biểu đồ và diễn giải insight', (SELECT id FROM subject WHERE subject_code='DS101'), 'Analyze', 2, 'Lab', 'Visualization task', 'system', 'system'),
('DS101-CLO3', 'Thử nghiệm mô hình đơn giản', 'Huấn luyện mô hình hồi quy/phân loại cơ bản', (SELECT id FROM subject WHERE subject_code='DS101'), 'Apply', 3, 'Lab', 'Mini project', 'system', 'system');

-- DS102 - Xác suất Thống kê
INSERT INTO public.clo (clo_code, clo_name, description, subject_id, bloom_level, display_order, teaching_method, evaluation_method, created_by, updated_by) VALUES
('DS102-CLO1', 'Tính toán xác suất', 'Áp dụng quy tắc xác suất, biến ngẫu nhiên', (SELECT id FROM subject WHERE subject_code='DS102'), 'Apply', 1, 'Lecture, Exercise', 'Quiz', 'system', 'system'),
('DS102-CLO2', 'Suy luận thống kê', 'Ước lượng, kiểm định giả thuyết', (SELECT id FROM subject WHERE subject_code='DS102'), 'Analyze', 2, 'Lecture, Lab', 'Written exam', 'system', 'system'),
('DS102-CLO3', 'Ứng dụng vào dữ liệu', 'Diễn giải kết quả thống kê trong bối cảnh thực tế', (SELECT id FROM subject WHERE subject_code='DS102'), 'Evaluate', 3, 'Lab', 'Case analysis', 'system', 'system');

-- DS201 - Machine Learning
INSERT INTO public.clo (clo_code, clo_name, description, subject_id, bloom_level, display_order, teaching_method, evaluation_method, created_by, updated_by) VALUES
('DS201-CLO1', 'Chuẩn bị tập dữ liệu ML', 'Tách train/test, chuẩn hóa, xử lý mất dữ liệu', (SELECT id FROM subject WHERE subject_code='DS201'), 'Apply', 1, 'Lab', 'Data prep assignment', 'system', 'system'),
('DS201-CLO2', 'Huấn luyện mô hình', 'Huấn luyện và tinh chỉnh các thuật toán ML phổ biến', (SELECT id FROM subject WHERE subject_code='DS201'), 'Apply', 2, 'Lab', 'Model training task', 'system', 'system'),
('DS201-CLO3', 'Đánh giá & chọn mô hình', 'Sử dụng metric và cross-validation', (SELECT id FROM subject WHERE subject_code='DS201'), 'Evaluate', 3, 'Lab', 'Evaluation report', 'system', 'system');

-- DS301 - Deep Learning
INSERT INTO public.clo (clo_code, clo_name, description, subject_id, bloom_level, display_order, teaching_method, evaluation_method, created_by, updated_by) VALUES
('DS301-CLO1', 'Thiết kế mạng neuron', 'Xây dựng mô hình CNN/RNN đơn giản', (SELECT id FROM subject WHERE subject_code='DS301'), 'Apply', 1, 'Lab', 'Model notebook', 'system', 'system'),
('DS301-CLO2', 'Huấn luyện và regularization', 'Áp dụng dropout, batch norm, early stopping', (SELECT id FROM subject WHERE subject_code='DS301'), 'Analyze', 2, 'Lab', 'Training log review', 'system', 'system'),
('DS301-CLO3', 'Đánh giá và cải tiến', 'Đánh giá kết quả và tối ưu hyper-parameters', (SELECT id FROM subject WHERE subject_code='DS301'), 'Evaluate', 3, 'Lab', 'Model report', 'system', 'system');

-- DS302 - Big Data Analytics
INSERT INTO public.clo (clo_code, clo_name, description, subject_id, bloom_level, display_order, teaching_method, evaluation_method, created_by, updated_by) VALUES
('DS302-CLO1', 'Xử lý dữ liệu phân tán', 'Thực thi job Spark/Hadoop cơ bản', (SELECT id FROM subject WHERE subject_code='DS302'), 'Apply', 1, 'Lab', 'Cluster job submission', 'system', 'system'),
('DS302-CLO2', 'Thiết kế pipeline dữ liệu', 'Xây dựng ETL/ELT trên nền tảng big data', (SELECT id FROM subject WHERE subject_code='DS302'), 'Apply', 2, 'Lab', 'Pipeline assignment', 'system', 'system'),
('DS302-CLO3', 'Đánh giá hiệu năng', 'Phân tích và tối ưu job big data', (SELECT id FROM subject WHERE subject_code='DS302'), 'Evaluate', 3, 'Case study', 'Performance report', 'system', 'system');

-- DS401 - Natural Language Processing
INSERT INTO public.clo (clo_code, clo_name, description, subject_id, bloom_level, display_order, teaching_method, evaluation_method, created_by, updated_by) VALUES
('DS401-CLO1', 'Xử lý văn bản', 'Tiền xử lý, tokenization, vector hóa', (SELECT id FROM subject WHERE subject_code='DS401'), 'Apply', 1, 'Lab', 'NLP notebook', 'system', 'system'),
('DS401-CLO2', 'Xây dựng mô hình NLP', 'Huấn luyện mô hình phân loại chuỗi văn bản', (SELECT id FROM subject WHERE subject_code='DS401'), 'Apply', 2, 'Lab', 'Model assignment', 'system', 'system'),
('DS401-CLO3', 'Đánh giá và đạo đức AI', 'Đánh giá bias và đề xuất giảm thiểu', (SELECT id FROM subject WHERE subject_code='DS401'), 'Evaluate', 3, 'Seminar', 'Reflection report', 'system', 'system');

-- DS402 - Computer Vision
INSERT INTO public.clo (clo_code, clo_name, description, subject_id, bloom_level, display_order, teaching_method, evaluation_method, created_by, updated_by) VALUES
('DS402-CLO1', 'Tiền xử lý ảnh', 'Thực hiện các phép biến đổi ảnh cơ bản', (SELECT id FROM subject WHERE subject_code='DS402'), 'Apply', 1, 'Lab', 'CV notebook', 'system', 'system'),
('DS402-CLO2', 'Mô hình hóa nhận diện', 'Huấn luyện mô hình phát hiện/nhận dạng đối tượng', (SELECT id FROM subject WHERE subject_code='DS402'), 'Apply', 2, 'Lab', 'Model assignment', 'system', 'system'),
('DS402-CLO3', 'Đánh giá hệ thống thị giác', 'Phân tích độ chính xác, tốc độ và trade-offs', (SELECT id FROM subject WHERE subject_code='DS402'), 'Evaluate', 3, 'Case study', 'Evaluation report', 'system', 'system');

-- ============================================================
-- SAMPLE DATA: clo_mapping (Mapping giữa CLO và PLO)
-- Liên kết giữa Chuẩn đầu ra môn học (CLO) và Chuẩn đầu ra chương trình (PLO)
-- ============================================================

-- IT101 - Nhập môn Lập trình → PLO về kiến thức nền tảng và kỹ năng lập trình
INSERT INTO public.clo_mapping (clo_id, plo_id, mapping_level, proficiency_level, evidence_method, strength_level, created_by, updated_by) VALUES
((SELECT id FROM clo WHERE clo_code='IT101-CLO1'), (SELECT id FROM plo WHERE plo_code='PLO1.1' AND program_id=(SELECT id FROM program WHERE program_code='IT2024')), 'Direct', 'Advanced', 'Quiz, Written exam scores', 5, 'system', 'system'),
((SELECT id FROM clo WHERE clo_code='IT101-CLO2'), (SELECT id FROM plo WHERE plo_code='PLO2.3' AND program_id=(SELECT id FROM program WHERE program_code='IT2024')), 'Direct', 'Advanced', 'Lab assignment quality', 5, 'system', 'system'),
((SELECT id FROM clo WHERE clo_code='IT101-CLO3'), (SELECT id FROM plo WHERE plo_code='PLO2.1' AND program_id=(SELECT id FROM program WHERE program_code='IT2024')), 'Indirect', 'Intermediate', 'Debug test results', 3, 'system', 'system');

-- IT102 - Toán rời rạc → PLO về kiến thức nền tảng và tư duy
INSERT INTO public.clo_mapping (clo_id, plo_id, mapping_level, proficiency_level, evidence_method, strength_level, created_by, updated_by) VALUES
((SELECT id FROM clo WHERE clo_code='IT102-CLO1'), (SELECT id FROM plo WHERE plo_code='PLO1.1' AND program_id=(SELECT id FROM program WHERE program_code='IT2024')), 'Direct', 'Advanced', 'Math proof quality', 5, 'system', 'system'),
((SELECT id FROM clo WHERE clo_code='IT102-CLO2'), (SELECT id FROM plo WHERE plo_code='PLO1.1' AND program_id=(SELECT id FROM program WHERE program_code='IT2024')), 'Direct', 'Advanced', 'Problem solving scores', 5, 'system', 'system'),
((SELECT id FROM clo WHERE clo_code='IT102-CLO3'), (SELECT id FROM plo WHERE plo_code='PLO2.1' AND program_id=(SELECT id FROM program WHERE program_code='IT2024')), 'Indirect', 'Intermediate', 'Graph analysis tasks', 3, 'system', 'system'),
((SELECT id FROM clo WHERE clo_code='IT102-CLO3'), (SELECT id FROM plo WHERE plo_code='PLO5.2' AND program_id=(SELECT id FROM program WHERE program_code='IT2024')), 'Indirect', 'Intermediate', 'Creative solutions', 3, 'system', 'system');

-- IT103 - Kiến trúc Máy tính → PLO về kiến thức nền tảng
INSERT INTO public.clo_mapping (clo_id, plo_id, mapping_level, proficiency_level, evidence_method, strength_level, created_by, updated_by) VALUES
((SELECT id FROM clo WHERE clo_code='IT103-CLO1'), (SELECT id FROM plo WHERE plo_code='PLO1.1' AND program_id=(SELECT id FROM program WHERE program_code='IT2024')), 'Direct', 'Advanced', 'Exam scores', 5, 'system', 'system'),
((SELECT id FROM clo WHERE clo_code='IT103-CLO2'), (SELECT id FROM plo WHERE plo_code='PLO1.2' AND program_id=(SELECT id FROM program WHERE program_code='IT2024')), 'Indirect', 'Intermediate', 'Assembly lab', 3, 'system', 'system'),
((SELECT id FROM clo WHERE clo_code='IT103-CLO3'), (SELECT id FROM plo WHERE plo_code='PLO2.1' AND program_id=(SELECT id FROM program WHERE program_code='IT2024')), 'Indirect', 'Intermediate', 'Performance analysis', 3, 'system', 'system');

-- IT201 - Lập trình Hướng đối tượng → PLO về kỹ năng lập trình và thiết kế
INSERT INTO public.clo_mapping (clo_id, plo_id, mapping_level, proficiency_level, evidence_method, strength_level, created_by, updated_by) VALUES
((SELECT id FROM clo WHERE clo_code='IT201-CLO1'), (SELECT id FROM plo WHERE plo_code='PLO2.2' AND program_id=(SELECT id FROM program WHERE program_code='IT2024')), 'Direct', 'Advanced', 'Class design quality', 5, 'system', 'system'),
((SELECT id FROM clo WHERE clo_code='IT201-CLO1'), (SELECT id FROM plo WHERE plo_code='PLO2.3' AND program_id=(SELECT id FROM program WHERE program_code='IT2024')), 'Direct', 'Advanced', 'OOP code quality', 5, 'system', 'system'),
((SELECT id FROM clo WHERE clo_code='IT201-CLO2'), (SELECT id FROM plo WHERE plo_code='PLO1.3' AND program_id=(SELECT id FROM program WHERE program_code='IT2024')), 'Direct', 'Advanced', 'Pattern implementation', 5, 'system', 'system'),
((SELECT id FROM clo WHERE clo_code='IT201-CLO3'), (SELECT id FROM plo WHERE plo_code='PLO2.4' AND program_id=(SELECT id FROM program WHERE program_code='IT2024')), 'Indirect', 'Intermediate', 'Test coverage', 3, 'system', 'system');

-- IT202 - Cấu trúc Dữ liệu và Giải thuật → PLO về kiến thức chuyên môn và kỹ năng
INSERT INTO public.clo_mapping (clo_id, plo_id, mapping_level, proficiency_level, evidence_method, strength_level, created_by, updated_by) VALUES
((SELECT id FROM clo WHERE clo_code='IT202-CLO1'), (SELECT id FROM plo WHERE plo_code='PLO1.2' AND program_id=(SELECT id FROM program WHERE program_code='IT2024')), 'Direct', 'Advanced', 'DSA knowledge test', 5, 'system', 'system'),
((SELECT id FROM clo WHERE clo_code='IT202-CLO1'), (SELECT id FROM plo WHERE plo_code='PLO2.1' AND program_id=(SELECT id FROM program WHERE program_code='IT2024')), 'Direct', 'Advanced', 'Problem solving', 5, 'system', 'system'),
((SELECT id FROM clo WHERE clo_code='IT202-CLO2'), (SELECT id FROM plo WHERE plo_code='PLO2.1' AND program_id=(SELECT id FROM program WHERE program_code='IT2024')), 'Direct', 'Advanced', 'Complexity analysis', 5, 'system', 'system'),
((SELECT id FROM clo WHERE clo_code='IT202-CLO3'), (SELECT id FROM plo WHERE plo_code='PLO2.3' AND program_id=(SELECT id FROM program WHERE program_code='IT2024')), 'Direct', 'Advanced', 'Algorithm implementation', 5, 'system', 'system');

-- IT203 - Cơ sở Dữ liệu → PLO về kiến thức chuyên môn
INSERT INTO public.clo_mapping (clo_id, plo_id, mapping_level, proficiency_level, evidence_method, strength_level, created_by, updated_by) VALUES
((SELECT id FROM clo WHERE clo_code='IT203-CLO1'), (SELECT id FROM plo WHERE plo_code='PLO1.2' AND program_id=(SELECT id FROM program WHERE program_code='IT2024')), 'Direct', 'Advanced', 'Schema design', 5, 'system', 'system'),
((SELECT id FROM clo WHERE clo_code='IT203-CLO1'), (SELECT id FROM plo WHERE plo_code='PLO2.2' AND program_id=(SELECT id FROM program WHERE program_code='IT2024')), 'Indirect', 'Intermediate', 'Database design quality', 3, 'system', 'system'),
((SELECT id FROM clo WHERE clo_code='IT203-CLO2'), (SELECT id FROM plo WHERE plo_code='PLO2.3' AND program_id=(SELECT id FROM program WHERE program_code='IT2024')), 'Direct', 'Advanced', 'SQL proficiency', 5, 'system', 'system'),
((SELECT id FROM clo WHERE clo_code='IT203-CLO3'), (SELECT id FROM plo WHERE plo_code='PLO1.2' AND program_id=(SELECT id FROM program WHERE program_code='IT2024')), 'Indirect', 'Intermediate', 'Transaction understanding', 3, 'system', 'system');

-- IT301 - Công nghệ Web → PLO về phát triển phần mềm
INSERT INTO public.clo_mapping (clo_id, plo_id, mapping_level, proficiency_level, evidence_method, strength_level, created_by, updated_by) VALUES
((SELECT id FROM clo WHERE clo_code='IT301-CLO1'), (SELECT id FROM plo WHERE plo_code='PLO1.3' AND program_id=(SELECT id FROM program WHERE program_code='IT2024')), 'Direct', 'Advanced', 'Frontend quality', 5, 'system', 'system'),
((SELECT id FROM clo WHERE clo_code='IT301-CLO1'), (SELECT id FROM plo WHERE plo_code='PLO2.3' AND program_id=(SELECT id FROM program WHERE program_code='IT2024')), 'Direct', 'Advanced', 'Code quality', 5, 'system', 'system'),
((SELECT id FROM clo WHERE clo_code='IT301-CLO2'), (SELECT id FROM plo WHERE plo_code='PLO1.3' AND program_id=(SELECT id FROM program WHERE program_code='IT2024')), 'Direct', 'Advanced', 'API implementation', 5, 'system', 'system'),
((SELECT id FROM clo WHERE clo_code='IT301-CLO2'), (SELECT id FROM plo WHERE plo_code='PLO2.2' AND program_id=(SELECT id FROM program WHERE program_code='IT2024')), 'Indirect', 'Intermediate', 'API design', 3, 'system', 'system'),
((SELECT id FROM clo WHERE clo_code='IT301-CLO3'), (SELECT id FROM plo WHERE plo_code='PLO2.5' AND program_id=(SELECT id FROM program WHERE program_code='IT2024')), 'Indirect', 'Intermediate', 'Deployment success', 3, 'system', 'system');

-- IT302 - Mạng Máy tính → PLO về kiến thức nền tảng
INSERT INTO public.clo_mapping (clo_id, plo_id, mapping_level, proficiency_level, evidence_method, strength_level, created_by, updated_by) VALUES
((SELECT id FROM clo WHERE clo_code='IT302-CLO1'), (SELECT id FROM plo WHERE plo_code='PLO1.2' AND program_id=(SELECT id FROM program WHERE program_code='IT2024')), 'Direct', 'Advanced', 'Network knowledge', 5, 'system', 'system'),
((SELECT id FROM clo WHERE clo_code='IT302-CLO2'), (SELECT id FROM plo WHERE plo_code='PLO1.2' AND program_id=(SELECT id FROM program WHERE program_code='IT2024')), 'Indirect', 'Intermediate', 'Lab configuration', 3, 'system', 'system'),
((SELECT id FROM clo WHERE clo_code='IT302-CLO3'), (SELECT id FROM plo WHERE plo_code='PLO3.2' AND program_id=(SELECT id FROM program WHERE program_code='IT2024')), 'Direct', 'Advanced', 'Security analysis', 5, 'system', 'system');

-- IT303 - Hệ điều hành → PLO về kiến thức hệ thống
INSERT INTO public.clo_mapping (clo_id, plo_id, mapping_level, proficiency_level, evidence_method, strength_level, created_by, updated_by) VALUES
((SELECT id FROM clo WHERE clo_code='IT303-CLO1'), (SELECT id FROM plo WHERE plo_code='PLO1.2' AND program_id=(SELECT id FROM program WHERE program_code='IT2024')), 'Direct', 'Advanced', 'OS concepts test', 5, 'system', 'system'),
((SELECT id FROM clo WHERE clo_code='IT303-CLO2'), (SELECT id FROM plo WHERE plo_code='PLO2.1' AND program_id=(SELECT id FROM program WHERE program_code='IT2024')), 'Indirect', 'Intermediate', 'Memory analysis', 3, 'system', 'system'),
((SELECT id FROM clo WHERE clo_code='IT303-CLO3'), (SELECT id FROM plo WHERE plo_code='PLO2.3' AND program_id=(SELECT id FROM program WHERE program_code='IT2024')), 'Indirect', 'Intermediate', 'System programming', 3, 'system', 'system');

-- IT401 - Công nghệ Phần mềm → PLO về quy trình và quản lý
INSERT INTO public.clo_mapping (clo_id, plo_id, mapping_level, proficiency_level, evidence_method, strength_level, created_by, updated_by) VALUES
((SELECT id FROM clo WHERE clo_code='IT401-CLO1'), (SELECT id FROM plo WHERE plo_code='PLO2.5' AND program_id=(SELECT id FROM program WHERE program_code='IT2024')), 'Direct', 'Advanced', 'Agile practice', 5, 'system', 'system'),
((SELECT id FROM clo WHERE clo_code='IT401-CLO2'), (SELECT id FROM plo WHERE plo_code='PLO2.2' AND program_id=(SELECT id FROM program WHERE program_code='IT2024')), 'Direct', 'Advanced', 'Architecture quality', 5, 'system', 'system'),
((SELECT id FROM clo WHERE clo_code='IT401-CLO3'), (SELECT id FROM plo WHERE plo_code='PLO2.4' AND program_id=(SELECT id FROM program WHERE program_code='IT2024')), 'Direct', 'Advanced', 'QA activities', 5, 'system', 'system'),
((SELECT id FROM clo WHERE clo_code='IT401-CLO3'), (SELECT id FROM plo WHERE plo_code='PLO3.1' AND program_id=(SELECT id FROM program WHERE program_code='IT2024')), 'Indirect', 'Intermediate', 'Professional practice', 3, 'system', 'system');

-- IT402 - An toàn và Bảo mật → PLO về bảo mật
INSERT INTO public.clo_mapping (clo_id, plo_id, mapping_level, proficiency_level, evidence_method, strength_level, created_by, updated_by) VALUES
((SELECT id FROM clo WHERE clo_code='IT402-CLO1'), (SELECT id FROM plo WHERE plo_code='PLO3.2' AND program_id=(SELECT id FROM program WHERE program_code='IT2024')), 'Direct', 'Advanced', 'Cryptography lab', 5, 'system', 'system'),
((SELECT id FROM clo WHERE clo_code='IT402-CLO2'), (SELECT id FROM plo WHERE plo_code='PLO3.2' AND program_id=(SELECT id FROM program WHERE program_code='IT2024')), 'Direct', 'Advanced', 'Vulnerability report', 5, 'system', 'system'),
((SELECT id FROM clo WHERE clo_code='IT402-CLO3'), (SELECT id FROM plo WHERE plo_code='PLO3.2' AND program_id=(SELECT id FROM program WHERE program_code='IT2024')), 'Direct', 'Advanced', 'Security design', 5, 'system', 'system'),
((SELECT id FROM clo WHERE clo_code='IT402-CLO3'), (SELECT id FROM plo WHERE plo_code='PLO3.1' AND program_id=(SELECT id FROM program WHERE program_code='IT2024')), 'Indirect', 'Intermediate', 'Ethical considerations', 3, 'system', 'system');

-- IT403 - Trí tuệ Nhân tạo → PLO về công nghệ tiên tiến
INSERT INTO public.clo_mapping (clo_id, plo_id, mapping_level, proficiency_level, evidence_method, strength_level, created_by, updated_by) VALUES
((SELECT id FROM clo WHERE clo_code='IT403-CLO1'), (SELECT id FROM plo WHERE plo_code='PLO1.3' AND program_id=(SELECT id FROM program WHERE program_code='IT2024')), 'Indirect', 'Intermediate', 'AI algorithms', 3, 'system', 'system'),
((SELECT id FROM clo WHERE clo_code='IT403-CLO2'), (SELECT id FROM plo WHERE plo_code='PLO2.1' AND program_id=(SELECT id FROM program WHERE program_code='IT2024')), 'Indirect', 'Intermediate', 'Knowledge modeling', 3, 'system', 'system'),
((SELECT id FROM clo WHERE clo_code='IT403-CLO3'), (SELECT id FROM plo WHERE plo_code='PLO5.1' AND program_id=(SELECT id FROM program WHERE program_code='IT2024')), 'Direct', 'Advanced', 'ML experimentation', 5, 'system', 'system');

-- IT501 - Phát triển Ứng dụng Di động → PLO về chuyên ngành
INSERT INTO public.clo_mapping (clo_id, plo_id, mapping_level, proficiency_level, evidence_method, strength_level, created_by, updated_by) VALUES
((SELECT id FROM clo WHERE clo_code='IT501-CLO1'), (SELECT id FROM plo WHERE plo_code='PLO1.3' AND program_id=(SELECT id FROM program WHERE program_code='IT2024')), 'Direct', 'Advanced', 'Mobile UI/UX', 5, 'system', 'system'),
((SELECT id FROM clo WHERE clo_code='IT501-CLO2'), (SELECT id FROM plo WHERE plo_code='PLO2.3' AND program_id=(SELECT id FROM program WHERE program_code='IT2024')), 'Direct', 'Advanced', 'API integration', 5, 'system', 'system'),
((SELECT id FROM clo WHERE clo_code='IT501-CLO3'), (SELECT id FROM plo WHERE plo_code='PLO2.5' AND program_id=(SELECT id FROM program WHERE program_code='IT2024')), 'Indirect', 'Intermediate', 'App deployment', 3, 'system', 'system');

-- IT502 - Cloud Computing → PLO về cloud
INSERT INTO public.clo_mapping (clo_id, plo_id, mapping_level, proficiency_level, evidence_method, strength_level, created_by, updated_by) VALUES
((SELECT id FROM clo WHERE clo_code='IT502-CLO1'), (SELECT id FROM plo WHERE plo_code='PLO1.3' AND program_id=(SELECT id FROM program WHERE program_code='IT2024')), 'Direct', 'Advanced', 'Cloud deployment', 5, 'system', 'system'),
((SELECT id FROM clo WHERE clo_code='IT502-CLO2'), (SELECT id FROM plo WHERE plo_code='PLO1.3' AND program_id=(SELECT id FROM program WHERE program_code='IT2024')), 'Direct', 'Advanced', 'Container skills', 5, 'system', 'system'),
((SELECT id FROM clo WHERE clo_code='IT502-CLO3'), (SELECT id FROM plo WHERE plo_code='PLO2.2' AND program_id=(SELECT id FROM program WHERE program_code='IT2024')), 'Direct', 'Advanced', 'Architecture design', 5, 'system', 'system'),
((SELECT id FROM clo WHERE clo_code='IT502-CLO3'), (SELECT id FROM plo WHERE plo_code='PLO5.2' AND program_id=(SELECT id FROM program WHERE program_code='IT2024')), 'Indirect', 'Intermediate', 'Innovation', 3, 'system', 'system');

-- IT503 - Khoa học Dữ liệu → PLO về data
INSERT INTO public.clo_mapping (clo_id, plo_id, mapping_level, proficiency_level, evidence_method, strength_level, created_by, updated_by) VALUES
((SELECT id FROM clo WHERE clo_code='IT503-CLO1'), (SELECT id FROM plo WHERE plo_code='PLO2.3' AND program_id=(SELECT id FROM program WHERE program_code='IT2024')), 'Indirect', 'Intermediate', 'Data processing', 3, 'system', 'system'),
((SELECT id FROM clo WHERE clo_code='IT503-CLO2'), (SELECT id FROM plo WHERE plo_code='PLO5.1' AND program_id=(SELECT id FROM program WHERE program_code='IT2024')), 'Direct', 'Advanced', 'ML modeling', 5, 'system', 'system'),
((SELECT id FROM clo WHERE clo_code='IT503-CLO3'), (SELECT id FROM plo WHERE plo_code='PLO4.1' AND program_id=(SELECT id FROM program WHERE program_code='IT2024')), 'Direct', 'Advanced', 'Presentation quality', 5, 'system', 'system');

-- IT601 - DevOps và CI/CD → PLO về automation
INSERT INTO public.clo_mapping (clo_id, plo_id, mapping_level, proficiency_level, evidence_method, strength_level, created_by, updated_by) VALUES
((SELECT id FROM clo WHERE clo_code='IT601-CLO1'), (SELECT id FROM plo WHERE plo_code='PLO1.3' AND program_id=(SELECT id FROM program WHERE program_code='IT2024')), 'Direct', 'Advanced', 'CI pipeline', 5, 'system', 'system'),
((SELECT id FROM clo WHERE clo_code='IT601-CLO2'), (SELECT id FROM plo WHERE plo_code='PLO1.3' AND program_id=(SELECT id FROM program WHERE program_code='IT2024')), 'Direct', 'Advanced', 'CD implementation', 5, 'system', 'system'),
((SELECT id FROM clo WHERE clo_code='IT601-CLO3'), (SELECT id FROM plo WHERE plo_code='PLO2.1' AND program_id=(SELECT id FROM program WHERE program_code='IT2024')), 'Indirect', 'Intermediate', 'Ops analysis', 3, 'system', 'system');

-- IT602 - Blockchain → PLO về công nghệ mới
INSERT INTO public.clo_mapping (clo_id, plo_id, mapping_level, proficiency_level, evidence_method, strength_level, created_by, updated_by) VALUES
((SELECT id FROM clo WHERE clo_code='IT602-CLO1'), (SELECT id FROM plo WHERE plo_code='PLO5.1' AND program_id=(SELECT id FROM program WHERE program_code='IT2024')), 'Direct', 'Advanced', 'Blockchain knowledge', 5, 'system', 'system'),
((SELECT id FROM clo WHERE clo_code='IT602-CLO2'), (SELECT id FROM plo WHERE plo_code='PLO2.3' AND program_id=(SELECT id FROM program WHERE program_code='IT2024')), 'Indirect', 'Intermediate', 'Smart contract code', 3, 'system', 'system'),
((SELECT id FROM clo WHERE clo_code='IT602-CLO3'), (SELECT id FROM plo WHERE plo_code='PLO2.1' AND program_id=(SELECT id FROM program WHERE program_code='IT2024')), 'Direct', 'Advanced', 'Use-case analysis', 5, 'system', 'system');

-- IT701 - Thực tập Dự án → PLO tổng hợp
INSERT INTO public.clo_mapping (clo_id, plo_id, mapping_level, proficiency_level, evidence_method, strength_level, created_by, updated_by) VALUES
((SELECT id FROM clo WHERE clo_code='IT701-CLO1'), (SELECT id FROM plo WHERE plo_code='PLO2.1' AND program_id=(SELECT id FROM program WHERE program_code='IT2024')), 'Direct', 'Advanced', 'Requirements quality', 5, 'system', 'system'),
((SELECT id FROM clo WHERE clo_code='IT701-CLO1'), (SELECT id FROM plo WHERE plo_code='PLO4.1' AND program_id=(SELECT id FROM program WHERE program_code='IT2024')), 'Direct', 'Advanced', 'Communication', 5, 'system', 'system'),
((SELECT id FROM clo WHERE clo_code='IT701-CLO2'), (SELECT id FROM plo WHERE plo_code='PLO2.2' AND program_id=(SELECT id FROM program WHERE program_code='IT2024')), 'Direct', 'Advanced', 'System implementation', 5, 'system', 'system'),
((SELECT id FROM clo WHERE clo_code='IT701-CLO2'), (SELECT id FROM plo WHERE plo_code='PLO2.3' AND program_id=(SELECT id FROM program WHERE program_code='IT2024')), 'Direct', 'Advanced', 'Code quality', 5, 'system', 'system'),
((SELECT id FROM clo WHERE clo_code='IT701-CLO2'), (SELECT id FROM plo WHERE plo_code='PLO2.5' AND program_id=(SELECT id FROM program WHERE program_code='IT2024')), 'Direct', 'Advanced', 'Teamwork', 5, 'system', 'system'),
((SELECT id FROM clo WHERE clo_code='IT701-CLO3'), (SELECT id FROM plo WHERE plo_code='PLO2.4' AND program_id=(SELECT id FROM program WHERE program_code='IT2024')), 'Direct', 'Advanced', 'Testing quality', 5, 'system', 'system'),
((SELECT id FROM clo WHERE clo_code='IT701-CLO3'), (SELECT id FROM plo WHERE plo_code='PLO3.1' AND program_id=(SELECT id FROM program WHERE program_code='IT2024')), 'Indirect', 'Intermediate', 'Professional conduct', 3, 'system', 'system');

-- IT801 - Khóa luận Tốt nghiệp → PLO tổng hợp cao cấp
INSERT INTO public.clo_mapping (clo_id, plo_id, mapping_level, proficiency_level, evidence_method, strength_level, created_by, updated_by) VALUES
((SELECT id FROM clo WHERE clo_code='IT801-CLO1'), (SELECT id FROM plo WHERE plo_code='PLO5.1' AND program_id=(SELECT id FROM program WHERE program_code='IT2024')), 'Direct', 'Advanced', 'Research quality', 5, 'system', 'system'),
((SELECT id FROM clo WHERE clo_code='IT801-CLO1'), (SELECT id FROM plo WHERE plo_code='PLO4.2' AND program_id=(SELECT id FROM program WHERE program_code='IT2024')), 'Direct', 'Advanced', 'English literature', 5, 'system', 'system'),
((SELECT id FROM clo WHERE clo_code='IT801-CLO2'), (SELECT id FROM plo WHERE plo_code='PLO5.2' AND program_id=(SELECT id FROM program WHERE program_code='IT2024')), 'Direct', 'Advanced', 'Innovation', 5, 'system', 'system'),
((SELECT id FROM clo WHERE clo_code='IT801-CLO2'), (SELECT id FROM plo WHERE plo_code='PLO2.1' AND program_id=(SELECT id FROM program WHERE program_code='IT2024')), 'Direct', 'Advanced', 'Problem solving', 5, 'system', 'system'),
((SELECT id FROM clo WHERE clo_code='IT801-CLO3'), (SELECT id FROM plo WHERE plo_code='PLO4.1' AND program_id=(SELECT id FROM program WHERE program_code='IT2024')), 'Direct', 'Advanced', 'Presentation', 5, 'system', 'system'),
((SELECT id FROM clo WHERE clo_code='IT801-CLO3'), (SELECT id FROM plo WHERE plo_code='PLO3.1' AND program_id=(SELECT id FROM program WHERE program_code='IT2024')), 'Indirect', 'Intermediate', 'Ethics', 3, 'system', 'system');

-- SE101 - Nhập môn Kỹ thuật Phần mềm
INSERT INTO public.clo_mapping (clo_id, plo_id, mapping_level, proficiency_level, evidence_method, strength_level, created_by, updated_by) VALUES
((SELECT id FROM clo WHERE clo_code='SE101-CLO1'), (SELECT id FROM plo WHERE plo_code='PLO1.1' AND program_id=(SELECT id FROM program WHERE program_code='SE2024')), 'Direct', 'Advanced', 'SDLC knowledge', 5, 'system', 'system'),
((SELECT id FROM clo WHERE clo_code='SE101-CLO2'), (SELECT id FROM plo WHERE plo_code='PLO2.1' AND program_id=(SELECT id FROM program WHERE program_code='SE2024')), 'Indirect', 'Intermediate', 'Requirements doc', 3, 'system', 'system'),
((SELECT id FROM clo WHERE clo_code='SE101-CLO3'), (SELECT id FROM plo WHERE plo_code='PLO2.3' AND program_id=(SELECT id FROM program WHERE program_code='SE2024')), 'Indirect', 'Intermediate', 'Teamwork', 3, 'system', 'system');

-- SE201 - Requirements Engineering
INSERT INTO public.clo_mapping (clo_id, plo_id, mapping_level, proficiency_level, evidence_method, strength_level, created_by, updated_by) VALUES
((SELECT id FROM clo WHERE clo_code='SE201-CLO1'), (SELECT id FROM plo WHERE plo_code='PLO2.1' AND program_id=(SELECT id FROM program WHERE program_code='SE2024')), 'Direct', 'Advanced', 'Elicitation quality', 5, 'system', 'system'),
((SELECT id FROM clo WHERE clo_code='SE201-CLO2'), (SELECT id FROM plo WHERE plo_code='PLO2.1' AND program_id=(SELECT id FROM program WHERE program_code='SE2024')), 'Direct', 'Advanced', 'Analysis quality', 5, 'system', 'system'),
((SELECT id FROM clo WHERE clo_code='SE201-CLO3'), (SELECT id FROM plo WHERE plo_code='PLO2.1' AND program_id=(SELECT id FROM program WHERE program_code='SE2024')), 'Indirect', 'Intermediate', 'Change management', 3, 'system', 'system');

-- SE301 - Software Design
INSERT INTO public.clo_mapping (clo_id, plo_id, mapping_level, proficiency_level, evidence_method, strength_level, created_by, updated_by) VALUES
((SELECT id FROM clo WHERE clo_code='SE301-CLO1'), (SELECT id FROM plo WHERE plo_code='PLO1.3' AND program_id=(SELECT id FROM program WHERE program_code='SE2024')), 'Direct', 'Advanced', 'Architecture modeling', 5, 'system', 'system'),
((SELECT id FROM clo WHERE clo_code='SE301-CLO2'), (SELECT id FROM plo WHERE plo_code='PLO1.3' AND program_id=(SELECT id FROM program WHERE program_code='SE2024')), 'Direct', 'Advanced', 'Pattern usage', 5, 'system', 'system'),
((SELECT id FROM clo WHERE clo_code='SE301-CLO3'), (SELECT id FROM plo WHERE plo_code='PLO2.2' AND program_id=(SELECT id FROM program WHERE program_code='SE2024')), 'Direct', 'Advanced', 'Design evaluation', 5, 'system', 'system');

-- SE302 - Software Testing
INSERT INTO public.clo_mapping (clo_id, plo_id, mapping_level, proficiency_level, evidence_method, strength_level, created_by, updated_by) VALUES
((SELECT id FROM clo WHERE clo_code='SE302-CLO1'), (SELECT id FROM plo WHERE plo_code='PLO2.2' AND program_id=(SELECT id FROM program WHERE program_code='SE2024')), 'Direct', 'Advanced', 'Test design', 5, 'system', 'system'),
((SELECT id FROM clo WHERE clo_code='SE302-CLO2'), (SELECT id FROM plo WHERE plo_code='PLO2.2' AND program_id=(SELECT id FROM program WHERE program_code='SE2024')), 'Direct', 'Advanced', 'Automation', 5, 'system', 'system'),
((SELECT id FROM clo WHERE clo_code='SE302-CLO3'), (SELECT id FROM plo WHERE plo_code='PLO2.2' AND program_id=(SELECT id FROM program WHERE program_code='SE2024')), 'Direct', 'Advanced', 'Quality report', 5, 'system', 'system');

-- SE401 - Software Quality Assurance
INSERT INTO public.clo_mapping (clo_id, plo_id, mapping_level, proficiency_level, evidence_method, strength_level, created_by, updated_by) VALUES
((SELECT id FROM clo WHERE clo_code='SE401-CLO1'), (SELECT id FROM plo WHERE plo_code='PLO1.2' AND program_id=(SELECT id FROM program WHERE program_code='SE2024')), 'Direct', 'Advanced', 'QA process', 5, 'system', 'system'),
((SELECT id FROM clo WHERE clo_code='SE401-CLO2'), (SELECT id FROM plo WHERE plo_code='PLO2.2' AND program_id=(SELECT id FROM program WHERE program_code='SE2024')), 'Direct', 'Advanced', 'Metrics usage', 5, 'system', 'system'),
((SELECT id FROM clo WHERE clo_code='SE401-CLO3'), (SELECT id FROM plo WHERE plo_code='PLO2.2' AND program_id=(SELECT id FROM program WHERE program_code='SE2024')), 'Direct', 'Advanced', 'Audit results', 5, 'system', 'system');

-- SE402 - Software Project Management
INSERT INTO public.clo_mapping (clo_id, plo_id, mapping_level, proficiency_level, evidence_method, strength_level, created_by, updated_by) VALUES
((SELECT id FROM clo WHERE clo_code='SE402-CLO1'), (SELECT id FROM plo WHERE plo_code='PLO2.3' AND program_id=(SELECT id FROM program WHERE program_code='SE2024')), 'Direct', 'Advanced', 'Project plan', 5, 'system', 'system'),
((SELECT id FROM clo WHERE clo_code='SE402-CLO2'), (SELECT id FROM plo WHERE plo_code='PLO2.3' AND program_id=(SELECT id FROM program WHERE program_code='SE2024')), 'Direct', 'Advanced', 'Risk management', 5, 'system', 'system'),
((SELECT id FROM clo WHERE clo_code='SE402-CLO3'), (SELECT id FROM plo WHERE plo_code='PLO2.3' AND program_id=(SELECT id FROM program WHERE program_code='SE2024')), 'Indirect', 'Intermediate', 'Status reporting', 3, 'system', 'system');

-- SE501 - Agile Development
INSERT INTO public.clo_mapping (clo_id, plo_id, mapping_level, proficiency_level, evidence_method, strength_level, created_by, updated_by) VALUES
((SELECT id FROM clo WHERE clo_code='SE501-CLO1'), (SELECT id FROM plo WHERE plo_code='PLO1.2' AND program_id=(SELECT id FROM program WHERE program_code='SE2024')), 'Direct', 'Advanced', 'Agile practice', 5, 'system', 'system'),
((SELECT id FROM clo WHERE clo_code='SE501-CLO2'), (SELECT id FROM plo WHERE plo_code='PLO2.1' AND program_id=(SELECT id FROM program WHERE program_code='SE2024')), 'Direct', 'Advanced', 'Backlog quality', 5, 'system', 'system'),
((SELECT id FROM clo WHERE clo_code='SE501-CLO3'), (SELECT id FROM plo WHERE plo_code='PLO2.3' AND program_id=(SELECT id FROM program WHERE program_code='SE2024')), 'Indirect', 'Intermediate', 'Retro insights', 3, 'system', 'system');

-- DS101 - Nhập môn Khoa học Dữ liệu
INSERT INTO public.clo_mapping (clo_id, plo_id, mapping_level, proficiency_level, evidence_method, strength_level, created_by, updated_by) VALUES
((SELECT id FROM clo WHERE clo_code='DS101-CLO1'), (SELECT id FROM plo WHERE plo_code='PLO2.1' AND program_id=(SELECT id FROM program WHERE program_code='DS2024')), 'Direct', 'Advanced', 'Data prep quality', 5, 'system', 'system'),
((SELECT id FROM clo WHERE clo_code='DS101-CLO2'), (SELECT id FROM plo WHERE plo_code='PLO2.2' AND program_id=(SELECT id FROM program WHERE program_code='DS2024')), 'Direct', 'Advanced', 'Visualization', 5, 'system', 'system'),
((SELECT id FROM clo WHERE clo_code='DS101-CLO3'), (SELECT id FROM plo WHERE plo_code='PLO1.2' AND program_id=(SELECT id FROM program WHERE program_code='DS2024')), 'Indirect', 'Intermediate', 'ML basics', 3, 'system', 'system');

-- DS102 - Xác suất Thống kê
INSERT INTO public.clo_mapping (clo_id, plo_id, mapping_level, proficiency_level, evidence_method, strength_level, created_by, updated_by) VALUES
((SELECT id FROM clo WHERE clo_code='DS102-CLO1'), (SELECT id FROM plo WHERE plo_code='PLO1.1' AND program_id=(SELECT id FROM program WHERE program_code='DS2024')), 'Direct', 'Advanced', 'Probability calc', 5, 'system', 'system'),
((SELECT id FROM clo WHERE clo_code='DS102-CLO2'), (SELECT id FROM plo WHERE plo_code='PLO1.1' AND program_id=(SELECT id FROM program WHERE program_code='DS2024')), 'Direct', 'Advanced', 'Statistical inference', 5, 'system', 'system'),
((SELECT id FROM clo WHERE clo_code='DS102-CLO3'), (SELECT id FROM plo WHERE plo_code='PLO2.1' AND program_id=(SELECT id FROM program WHERE program_code='DS2024')), 'Indirect', 'Intermediate', 'Data interpretation', 3, 'system', 'system');

-- DS201 - Machine Learning
INSERT INTO public.clo_mapping (clo_id, plo_id, mapping_level, proficiency_level, evidence_method, strength_level, created_by, updated_by) VALUES
((SELECT id FROM clo WHERE clo_code='DS201-CLO1'), (SELECT id FROM plo WHERE plo_code='PLO2.1' AND program_id=(SELECT id FROM program WHERE program_code='DS2024')), 'Direct', 'Advanced', 'Data pipeline', 5, 'system', 'system'),
((SELECT id FROM clo WHERE clo_code='DS201-CLO2'), (SELECT id FROM plo WHERE plo_code='PLO1.2' AND program_id=(SELECT id FROM program WHERE program_code='DS2024')), 'Direct', 'Advanced', 'ML training', 5, 'system', 'system'),
((SELECT id FROM clo WHERE clo_code='DS201-CLO3'), (SELECT id FROM plo WHERE plo_code='PLO1.2' AND program_id=(SELECT id FROM program WHERE program_code='DS2024')), 'Direct', 'Advanced', 'Model evaluation', 5, 'system', 'system');

-- DS301 - Deep Learning
INSERT INTO public.clo_mapping (clo_id, plo_id, mapping_level, proficiency_level, evidence_method, strength_level, created_by, updated_by) VALUES
((SELECT id FROM clo WHERE clo_code='DS301-CLO1'), (SELECT id FROM plo WHERE plo_code='PLO1.2' AND program_id=(SELECT id FROM program WHERE program_code='DS2024')), 'Direct', 'Advanced', 'Neural network design', 5, 'system', 'system'),
((SELECT id FROM clo WHERE clo_code='DS301-CLO2'), (SELECT id FROM plo WHERE plo_code='PLO1.2' AND program_id=(SELECT id FROM program WHERE program_code='DS2024')), 'Direct', 'Advanced', 'Training techniques', 5, 'system', 'system'),
((SELECT id FROM clo WHERE clo_code='DS301-CLO3'), (SELECT id FROM plo WHERE plo_code='PLO1.2' AND program_id=(SELECT id FROM program WHERE program_code='DS2024')), 'Direct', 'Advanced', 'Model optimization', 5, 'system', 'system');

-- DS302 - Big Data Analytics
INSERT INTO public.clo_mapping (clo_id, plo_id, mapping_level, proficiency_level, evidence_method, strength_level, created_by, updated_by) VALUES
((SELECT id FROM clo WHERE clo_code='DS302-CLO1'), (SELECT id FROM plo WHERE plo_code='PLO1.3' AND program_id=(SELECT id FROM program WHERE program_code='DS2024')), 'Direct', 'Advanced', 'Distributed processing', 5, 'system', 'system'),
((SELECT id FROM clo WHERE clo_code='DS302-CLO2'), (SELECT id FROM plo WHERE plo_code='PLO2.1' AND program_id=(SELECT id FROM program WHERE program_code='DS2024')), 'Direct', 'Advanced', 'Pipeline design', 5, 'system', 'system'),
((SELECT id FROM clo WHERE clo_code='DS302-CLO3'), (SELECT id FROM plo WHERE plo_code='PLO1.3' AND program_id=(SELECT id FROM program WHERE program_code='DS2024')), 'Indirect', 'Intermediate', 'Performance tuning', 3, 'system', 'system');

-- DS401 - Natural Language Processing
INSERT INTO public.clo_mapping (clo_id, plo_id, mapping_level, proficiency_level, evidence_method, strength_level, created_by, updated_by) VALUES
((SELECT id FROM clo WHERE clo_code='DS401-CLO1'), (SELECT id FROM plo WHERE plo_code='PLO2.1' AND program_id=(SELECT id FROM program WHERE program_code='DS2024')), 'Direct', 'Advanced', 'Text processing', 5, 'system', 'system'),
((SELECT id FROM clo WHERE clo_code='DS401-CLO2'), (SELECT id FROM plo WHERE plo_code='PLO1.2' AND program_id=(SELECT id FROM program WHERE program_code='DS2024')), 'Direct', 'Advanced', 'NLP models', 5, 'system', 'system'),
((SELECT id FROM clo WHERE clo_code='DS401-CLO3'), (SELECT id FROM plo WHERE plo_code='PLO2.3' AND program_id=(SELECT id FROM program WHERE program_code='DS2024')), 'Direct', 'Advanced', 'AI ethics', 5, 'system', 'system');

-- DS402 - Computer Vision
INSERT INTO public.clo_mapping (clo_id, plo_id, mapping_level, proficiency_level, evidence_method, strength_level, created_by, updated_by) VALUES
((SELECT id FROM clo WHERE clo_code='DS402-CLO1'), (SELECT id FROM plo WHERE plo_code='PLO2.1' AND program_id=(SELECT id FROM program WHERE program_code='DS2024')), 'Direct', 'Advanced', 'Image preprocessing', 5, 'system', 'system'),
((SELECT id FROM clo WHERE clo_code='DS402-CLO2'), (SELECT id FROM plo WHERE plo_code='PLO1.2' AND program_id=(SELECT id FROM program WHERE program_code='DS2024')), 'Direct', 'Advanced', 'CV models', 5, 'system', 'system'),
((SELECT id FROM clo WHERE clo_code='DS402-CLO3'), (SELECT id FROM plo WHERE plo_code='PLO1.2' AND program_id=(SELECT id FROM program WHERE program_code='DS2024')), 'Direct', 'Advanced', 'System evaluation', 5, 'system', 'system');

COMMIT;
