-- ============================================================
-- ROLES INITIALIZATION SCRIPT
-- Initialize roles for role-based access control
-- ============================================================

-- Connect to auth_db and insert roles
\c auth_db

-- Insert roles for different portals/modules
-- Note: Role names must match the constraint in the roles table

INSERT INTO roles (name, description) VALUES
('ROLE_ADMIN', 'Admin - Quản trị hệ thống')
ON CONFLICT DO NOTHING;

INSERT INTO roles (name, description) VALUES
('ROLE_LECTURER', 'Giáo viên - Quản lý giáo trình')
ON CONFLICT DO NOTHING;

INSERT INTO roles (name, description) VALUES
('ROLE_ACADEMIC_AFFAIRS', 'Công chức học vụ - Duyệt cấp 2')
ON CONFLICT DO NOTHING;

INSERT INTO roles (name, description) VALUES
('ROLE_HOD', 'Trưởng bộ môn - Duyệt cấp 1')
ON CONFLICT DO NOTHING;

INSERT INTO roles (name, description) VALUES
('ROLE_RECTOR', 'Hiệu trưởng - Duyệt cuối')
ON CONFLICT DO NOTHING;

INSERT INTO roles (name, description) VALUES
('ROLE_STUDENT', 'Người dùng - Xem công khai')
ON CONFLICT DO NOTHING;

INSERT INTO roles (name, description) VALUES
('ROLE_COUNCIL_MEMBER', 'Thành viên hội đồng - Duyệt đặc biệt')
ON CONFLICT DO NOTHING;

-- Verify inserted roles
SELECT * FROM roles ORDER BY role_id;
