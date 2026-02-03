-- ============================================================
-- ROLES & AUTH DATA INITIALIZATION
-- Merged: original roles_init + backend/auth-service/src/main/resources/data.sql
-- Creates permissions/roles/role_permissions/users/user_roles and seeds initial data
-- ============================================================

-- Ensure we operate on the auth database
\c auth_db

-- Ensure permission/role relationship tables exist
CREATE TABLE IF NOT EXISTS permissions (
	permission_id BIGSERIAL PRIMARY KEY,
	name VARCHAR(200) NOT NULL UNIQUE,
	description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS roles (
	role_id BIGSERIAL PRIMARY KEY,
	name VARCHAR(200) NOT NULL UNIQUE,
	description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS role_permissions (
	role_id BIGINT NOT NULL REFERENCES roles(role_id) ON DELETE CASCADE,
	permission_id BIGINT NOT NULL REFERENCES permissions(permission_id) ON DELETE CASCADE,
	PRIMARY KEY (role_id, permission_id)
);

-- Ensure users and user_roles exist so we can seed accounts
CREATE TABLE IF NOT EXISTS users (
	user_id BIGINT PRIMARY KEY,
	username VARCHAR(150) NOT NULL UNIQUE,
	email VARCHAR(200) NOT NULL UNIQUE,
	password VARCHAR(255) NOT NULL,
	full_name VARCHAR(255),
	phone_number VARCHAR(50),
	is_active BOOLEAN DEFAULT TRUE,
	is_locked BOOLEAN DEFAULT FALSE,
	created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
	failed_attempts INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS user_roles (
	user_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
	role_id BIGINT NOT NULL REFERENCES roles(role_id) ON DELETE CASCADE,
	PRIMARY KEY (user_id, role_id)
);

-- ============================================================
-- Seed roles (explicit ids provided to match application expectations)
-- ============================================================
INSERT INTO roles (role_id, name, description) VALUES
(1, 'ROLE_ADMIN', 'Quản trị viên hệ thống'),
(2, 'ROLE_RECTOR', 'Hiệu trưởng'),
(3, 'ROLE_ACADEMIC_AFFAIRS', 'Phòng đào tạo'),
(4, 'ROLE_HOD', 'Trưởng khoa'),
(5, 'ROLE_LECTURER', 'Giảng viên'),
(6, 'ROLE_STUDENT', 'Sinh viên'),
(7, 'ROLE_COUNCIL_MEMBER', 'Thành viên hội đồng')
ON CONFLICT (name) DO NOTHING;

-- Seed permissions
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
ON CONFLICT (name) DO NOTHING;

-- Map roles to permissions (avoid duplicate inserts)
INSERT INTO role_permissions (role_id, permission_id) VALUES
	(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8), (1, 9), (1, 10),
	(2, 1), (2, 5), (2, 9), (2, 10),
	(3, 1), (3, 5), (3, 6), (3, 7), (3, 9), (3, 10),
	(4, 1), (4, 5), (4, 6), (4, 7), (4, 9),
	(5, 1), (5, 5), (5, 6), (5, 7),
	(6, 1), (6, 5),
	(7, 1), (7, 5), (7, 9)
ON CONFLICT DO NOTHING;

-- ============================================================
-- Seed users and their roles
-- Passwords are expected to be BCrypt hashes already
-- ============================================================
INSERT INTO users (user_id, username, email, password, full_name, phone_number, is_active, is_locked, created_at, updated_at, failed_attempts)
VALUES (1, 'admin', 'admin@smd.edu.vn', '$2a$10$BnduqvTYEKLOt86RVyHCxOX.G.SXp2ae5QDmxiQsHfo2NHPS6dR4i', 'System Administrator', '0123456789', true, false, NOW(), NOW(), 0)
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO user_roles (user_id, role_id) VALUES (1, 1) ON CONFLICT DO NOTHING;

INSERT INTO users (user_id, username, email, password, full_name, phone_number, is_active, is_locked, created_at, updated_at, failed_attempts)
VALUES 
(2, 'lecturer1', 'lecturer1@smd.edu.vn', '$2a$10$BnduqvTYEKLOt86RVyHCxOX.G.SXp2ae5QDmxiQsHfo2NHPS6dR4i', 'Nguyễn Văn A', '0912345678', true, false, NOW(), NOW(), 0),
(3, 'lecturer2', 'lecturer2@smd.edu.vn', '$2a$10$BnduqvTYEKLOt86RVyHCxOX.G.SXp2ae5QDmxiQsHfo2NHPS6dR4i', 'Trần Thị B', '0923456789', true, false, NOW(), NOW(), 0)
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO user_roles (user_id, role_id) VALUES 
	(2, 5),
	(3, 4)
ON CONFLICT DO NOTHING;

INSERT INTO users (user_id, username, email, password, full_name, phone_number, is_active, is_locked, created_at, updated_at, failed_attempts)
VALUES (4, 'academic', 'academic@smd.edu.vn', '$2a$10$BnduqvTYEKLOt86RVyHCxOX.G.SXp2ae5QDmxiQsHfo2NHPS6dR4i', 'Phòng Đào Tạo', '0934567890', true, false, NOW(), NOW(), 0)
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO user_roles (user_id, role_id) VALUES (4, 3) ON CONFLICT DO NOTHING;

INSERT INTO users (user_id, username, email, password, full_name, phone_number, is_active, is_locked, created_at, updated_at, failed_attempts)
VALUES (5, 'student1', 'student1@smd.edu.vn', '$2a$10$BnduqvTYEKLOt86RVyHCxOX.G.SXp2ae5QDmxiQsHfo2NHPS6dR4i', 'Lê Minh C', '0945678901', true, false, NOW(), NOW(), 0)
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO user_roles (user_id, role_id) VALUES (5, 6) ON CONFLICT DO NOTHING;

INSERT INTO users (user_id, username, email, password, full_name, phone_number, is_active, is_locked, created_at, updated_at, failed_attempts)
VALUES (6, 'rector', 'rector@smd.edu.vn', '$2a$10$BnduqvTYEKLOt86RVyHCxOX.G.SXp2ae5QDmxiQsHfo2NHPS6dR4i', 'Hiệu Trưởng Đại Học', '0956789012', true, false, NOW(), NOW(), 0)
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO user_roles (user_id, role_id) VALUES (6, 2) ON CONFLICT DO NOTHING;

-- Final verification
SELECT * FROM roles ORDER BY role_id;
SELECT count(*) AS roles_count FROM roles;
SELECT count(*) AS permissions_count FROM permissions;
SELECT count(*) AS users_count FROM users;

-- ============================================================
-- Reset sequences to continue after initial data
-- This ensures new users get ID > max existing ID
-- setval(seq, value, is_called=true) means nextval returns value+1
-- setval(seq, value, is_called=false) means nextval returns value
-- Uses pg_get_serial_sequence to avoid missing-sequence errors
-- ============================================================
DO $$
DECLARE
	seq_name text;
BEGIN
	seq_name := pg_get_serial_sequence('users', 'user_id');
	IF seq_name IS NOT NULL THEN
		EXECUTE format(
			'SELECT setval(%L, GREATEST(COALESCE((SELECT MAX(user_id) FROM users), 0), 1), true)',
			seq_name
		);
	END IF;

	seq_name := pg_get_serial_sequence('roles', 'role_id');
	IF seq_name IS NOT NULL THEN
		EXECUTE format(
			'SELECT setval(%L, GREATEST(COALESCE((SELECT MAX(role_id) FROM roles), 0), 1), true)',
			seq_name
		);
	END IF;

	seq_name := pg_get_serial_sequence('permissions', 'permission_id');
	IF seq_name IS NOT NULL THEN
		EXECUTE format(
			'SELECT setval(%L, GREATEST(COALESCE((SELECT MAX(permission_id) FROM permissions), 0), 1), true)',
			seq_name
		);
	END IF;
END $$;
