-- Initial data for Auth Service
-- This script will run automatically when the application starts

-- Insert Roles (Postgres compatible)
INSERT INTO roles (role_id, name, description) VALUES
(1, 'ROLE_ADMIN', 'Quản trị viên hệ thống'),
(2, 'ROLE_RECTOR', 'Hiệu trưởng'),
(3, 'ROLE_ACADEMIC_AFFAIRS', 'Phòng đào tạo'),
(4, 'ROLE_HOD', 'Trưởng khoa'),
(5, 'ROLE_LECTURER', 'Giảng viên'),
(6, 'ROLE_STUDENT', 'Sinh viên'),
(7, 'ROLE_COUNCIL_MEMBER', 'Thành viên hội đồng')
ON CONFLICT DO NOTHING;

-- Insert Permissions (Postgres compatible)
INSERT INTO permissions (permission_id, name, description) VALUES
(1, 'USER_READ', 'Đọc thông tin người dùng'),
(2, 'USER_CREATE', 'Tạo người dùng mới'),
(3, 'USER_UPDATE', 'Cập nhật thông tin người dùng'),
(4, 'USER_DELETE', 'Xóa người dùng'),
(5, 'SYLLABUS_READ', 'Đọc đề cương'),
(6, 'SYLLABUS_CREATE', 'Tạo đề cương'),
(7, 'SYLLABUS_UPDATE', 'Cập nhật đề cương'),
(8, 'SYLLABUS_DELETE', 'Xóa đề cương'),
(9, 'SYLLABUS_APPROVE', 'Phê duyệt đề cương'),
(10, 'REPORT_VIEW', 'Xem báo cáo')
ON CONFLICT DO NOTHING;

-- Map Roles to Permissions
INSERT INTO role_permissions (role_id, permission_id) VALUES
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

INSERT INTO users (user_id, username, email, password, full_name, phone_number, is_active, is_locked, created_at, updated_at, failed_attempts)
VALUES (1, 'admin', 'admin@smd.edu.vn', '$2a$10$XptfskLsT6KrGfFfX8yVpOaK2FLCwaMGrFRww5/HaZZCCpGwh3Wf2', 'System Administrator', '0123456789', true, false, NOW(), NOW(), 0)
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role_id) VALUES (1, 1) ON CONFLICT DO NOTHING;

-- Create sample lecturer users
-- Password: Lecturer@123 (BCrypt encoded)
INSERT INTO users (user_id, username, email, password, full_name, phone_number, is_active, is_locked, created_at, updated_at, failed_attempts)
VALUES 
(2, 'lecturer1', 'lecturer1@smd.edu.vn', '$2a$10$XptfskLsT6KrGfFfX8yVpOaK2FLCwaMGrFRww5/HaZZCCpGwh3Wf2', 'Nguyễn Văn A', '0912345678', true, false, NOW(), NOW(), 0),
(3, 'lecturer2', 'lecturer2@smd.edu.vn', '$2a$10$XptfskLsT6KrGfFfX8yVpOaK2FLCwaMGrFRww5/HaZZCCpGwh3Wf2', 'Trần Thị B', '0923456789', true, false, NOW(), NOW(), 0)
ON CONFLICT DO NOTHING;

-- Assign LECTURER role to lecturer users
INSERT INTO user_roles (user_id, role_id) VALUES 
(2, 5),
(3, 5)
ON CONFLICT DO NOTHING;

-- Create sample Academic Affairs user
-- Password: AA@123 (BCrypt encoded)
INSERT INTO users (user_id, username, email, password, full_name, phone_number, is_active, is_locked, created_at, updated_at, failed_attempts)
VALUES (4, 'academic', 'academic@smd.edu.vn', '$2a$10$XptfskLsT6KrGfFfX8yVpOaK2FLCwaMGrFRww5/HaZZCCpGwh3Wf2', 'Phòng Đào Tạo', '0934567890', true, false, NOW(), NOW(), 0)
ON CONFLICT DO NOTHING;

-- Assign ACADEMIC_AFFAIRS role
INSERT INTO user_roles (user_id, role_id) VALUES (4, 3) ON CONFLICT DO NOTHING;
-- Create sample student users  
INSERT INTO users (user_id, username, email, password, full_name, phone_number, is_active, is_locked, created_at, updated_at, failed_attempts)
VALUES 
(5, 'student1', 'student1@smd.edu.vn', '$2a$10$XptfskLsT6KrGfFfX8yVpOaK2FLCwaMGrFRww5/HaZZCCpGwh3Wf2', 'Lê Văn C', '0945678901', true, false, NOW(), NOW(), 0),
(6, 'rector', 'rector@smd.edu.vn', '$2a$10$XptfskLsT6KrGfFfX8yVpOaK2FLCwaMGrFRww5/HaZZCCpGwh3Wf2', 'Bùi Thị D', '0956789012', true, false, NOW(), NOW(), 0)
ON CONFLICT DO NOTHING;

-- Assign STUDENT role to student users
INSERT INTO user_roles (user_id, role_id) VALUES (5, 6) ON CONFLICT DO NOTHING;

-- Assign RECTOR role
INSERT INTO user_roles (user_id, role_id) VALUES (6, 2) ON CONFLICT DO NOTHING;

-- Reset sequences to start from the next available ID after initial data is loaded
-- This ensures that newly created users via the application don't conflict with existing IDs
-- The sequences were pre-created in schema.sql
-- Reset sequences to start from the next available ID
-- SETVAL(seq, value, is_called) - when is_called=true, nextval will return value+1
-- when is_called=false, nextval will return value
-- We want nextval to return MAX+1, so we use SETVAL(seq, MAX, true) or SETVAL(seq, MAX+1, false)
SELECT SETVAL('user_id_seq', GREATEST((SELECT COALESCE(MAX(user_id), 0) FROM users), 1), true);
SELECT SETVAL('role_id_seq', GREATEST((SELECT COALESCE(MAX(role_id), 0) FROM roles), 1), true);
SELECT SETVAL('permission_id_seq', GREATEST((SELECT COALESCE(MAX(permission_id), 0) FROM permissions), 1), true);