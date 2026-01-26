package com.smd.workflow_service.domain;

public enum UserRole {
    ROLE_ADMIN,            // Admin - Quản trị hệ thống
    ROLE_LECTURER,         // Giáo viên - Quản lý giáo trình
    ROLE_ACADEMIC_AFFAIRS, // Công chức học vụ - Duyệt cấp 2
    ROLE_HOD,              // Trưởng bộ môn - Duyệt cấp 1
    ROLE_RECTOR,           // Hiệu trưởng - Duyệt cuối
    ROLE_STUDENT;          // Người dùng - Xem công khai
}
