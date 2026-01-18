-- Insert permissions
INSERT INTO permissions (name, description) VALUES
('USER_MANAGE', 'Manage users'),
('ROLE_MANAGE', 'Manage roles'),
('PERMISSION_MANAGE', 'Manage permissions'),
('SERVICE_MANAGE', 'Manage services'),
('CONFIG_MANAGE', 'Manage configuration'),
('SYLLABUS_VIEW', 'View syllabus'),
('SYLLABUS_EDIT', 'Edit syllabus'),
('ACADEMIC_VIEW', 'View academic data'),
('ACADEMIC_EDIT', 'Edit academic data'),
('PUBLIC_VIEW', 'View public content'),
('WORKFLOW_VIEW', 'View workflows'),
('WORKFLOW_EDIT', 'Edit workflows'),
('SYSTEM_ADMIN', 'System administration');

-- Get permissions
SELECT permission_id, name FROM permissions;

-- Assign all permissions to ADMIN role
INSERT INTO role_permissions (role_id, permission_id)
SELECT 1, permission_id FROM permissions;

-- Assign some permissions to LECTURER
INSERT INTO role_permissions (role_id, permission_id)
SELECT 2, permission_id FROM permissions 
WHERE name IN ('SYLLABUS_VIEW', 'SYLLABUS_EDIT', 'ACADEMIC_VIEW', 'ACADEMIC_EDIT');

-- Assign some permissions to STUDENT
INSERT INTO role_permissions (role_id, permission_id)
SELECT 3, permission_id FROM permissions 
WHERE name IN ('SYLLABUS_VIEW', 'ACADEMIC_VIEW', 'PUBLIC_VIEW');

-- Create admin user (password: admin123)
-- Using bcrypt hash for "admin123": $2a$10$dXJ3SW6G7P50eS3tUQAIdOYvFHwc9q8rnJAjI2hPT7yDNYF6bC0A6
INSERT INTO users (username, email, password, full_name, is_active, is_locked, created_at)
VALUES ('admin', 'admin@smd.edu.vn', '$2a$10$dXJ3SW6G7P50eS3tUQAIdOYvFHwc9q8rnJAjI2hPT7yDNYF6bC0A6', 'System Administrator', true, false, NOW());

-- Get the admin user
SELECT user_id, username, email FROM users;

-- Assign ADMIN role to admin user
INSERT INTO user_roles (user_id, role_id)
SELECT 1, 1;

-- Verify
SELECT u.username, r.name FROM users u
JOIN user_roles ur ON u.user_id = ur.user_id
JOIN roles r ON ur.role_id = r.role_id;
