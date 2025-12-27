-- Initial data for Auth Service
-- This script will run automatically when the application starts

-- Insert Roles
INSERT IGNORE INTO roles (role_id, name, description) VALUES
(1, 'ROLE_ADMIN', 'Quản trị viên hệ thống'),
(2, 'ROLE_RECTOR', 'Hiệu trưởng'),
(3, 'ROLE_ACADEMIC_AFFAIRS', 'Phòng đào tạo'),
(4, 'ROLE_HOD', 'Trưởng khoa'),
(5, 'ROLE_LECTURER', 'Giảng viên'),
(6, 'ROLE_STUDENT', 'Sinh viên'),
(7, 'ROLE_COUNCIL_MEMBER', 'Thành viên hội đồng');

-- Insert Permissions
INSERT IGNORE INTO permissions (permission_id, name, description) VALUES
(1, 'USER_READ', 'Đọc thông tin người dùng'),
(2, 'USER_CREATE', 'Tạo người dùng mới'),
(3, 'USER_UPDATE', 'Cập nhật thông tin người dùng'),
(4, 'USER_DELETE', 'Xóa người dùng'),
(5, 'SYLLABUS_READ', 'Đọc đề cương'),
(6, 'SYLLABUS_CREATE', 'Tạo đề cương'),
(7, 'SYLLABUS_UPDATE', 'Cập nhật đề cương'),
(8, 'SYLLABUS_DELETE', 'Xóa đề cương'),
(9, 'SYLLABUS_APPROVE', 'Phê duyệt đề cương'),
(10, 'REPORT_VIEW', 'Xem báo cáo');

-- Map Roles to Permissions
INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES
-- ADMIN has all permissions
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8), (1, 9), (1, 10),
-- RECTOR
(2, 1), (2, 5), (2, 9), (2, 10),
-- ACADEMIC_AFFAIRS
(3, 1), (3, 5), (3, 6), (3, 7), (3, 9), (3, 10),
-- HOD
(4, 1), (4, 5), (4, 6), (4, 7), (4, 9),
-- LECTURER
(5, 1), (5, 5), (5, 6), (5, 7),
-- STUDENT
(6, 1), (6, 5),
-- COUNCIL_MEMBER
(7, 1), (7, 5), (7, 9);

-- Create default admin user
-- Password: Admin@123 (BCrypt encoded)
INSERT IGNORE INTO users (user_id, username, email, password, full_name, phone_number, is_active, is_locked, created_at, updated_at, failed_attempts)
VALUES (1, 'admin', 'admin@smd.edu.vn', '$2a$10$XptfskLsT6KrGfFfX8yVpOaK2FLCwaMGrFRww5/HaZZCCpGwh3Wf2', 'System Administrator', '0123456789', true, false, NOW(), NOW(), 0);

-- Assign ADMIN role to admin user
INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (1, 1);
