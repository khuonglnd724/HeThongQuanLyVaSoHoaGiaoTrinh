package com.smd.academic_service.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import java.util.HashSet;
import java.util.Set;

/**
 * Syllabus (Giáo trình)
 * Chi tiết nội dung dạy của một môn học trong một năm/kỳ cụ thể
 */
@Entity
@Table(name = "syllabus", indexes = {
    @Index(name = "idx_syllabus_subject_id", columnList = "subject_id"),
    @Index(name = "idx_syllabus_code", columnList = "syllabus_code")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Syllabus extends BaseEntity {
    
    @Column(name = "syllabus_code", nullable = false, length = 50)
    private String syllabusCode;  // Ví dụ: CS101-2024-01
    
    @Column(name = "version", nullable = false)
    private Integer version;  // Phiên bản (1, 2, 3, ...)
    
    @Column(name = "academic_year", nullable = false, length = 50)
    private String academicYear;  // 2023-2024, 2024-2025, etc.
    
    @Column(name = "semester", nullable = false)
    private Integer semester;  // Học kỳ
    
    @ManyToOne(fetch = jakarta.persistence.FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;  // Môn học
    
    @Column(name = "content", columnDefinition = "TEXT")
    private String content;  // Nội dung chi tiết
    
    @Column(name = "learning_objectives", columnDefinition = "TEXT")
    private String learningObjectives;  // Mục tiêu học tập
    
    @Column(name = "teaching_methods", columnDefinition = "TEXT")
    private String teachingMethods;  // Phương pháp giảng dạy
    
    @Column(name = "assessment_methods", columnDefinition = "TEXT")
    private String assessmentMethods;  // Phương pháp đánh giá
    
    @Column(name = "status", length = 50)
    private String status;  // Draft, Submitted, Under Review, Approved, Rejected, Published
    
    @Column(name = "approval_status", length = 50)
    private String approvalStatus;  // Pending, Approved, Rejected
    
    @Column(name = "approved_by")
    private Long approvedBy;  // ID người phê duyệt
    
    @Column(name = "approval_comments", columnDefinition = "TEXT")
    private String approvalComments;  // Nhận xét phê duyệt
    
    @OneToMany(mappedBy = "syllabus", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Clo> clos = new HashSet<>();
}
