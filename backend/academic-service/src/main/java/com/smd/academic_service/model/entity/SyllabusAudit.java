package com.smd.academic_service.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * SyllabusAudit - Audit trail for Syllabus changes
 * Tracks all modifications to syllabus for version history and comparison
 */
@Entity
@Table(name = "syllabus_audit", indexes = {
    @Index(name = "idx_syllabus_audit_syllabus_id", columnList = "syllabus_id"),
    @Index(name = "idx_syllabus_audit_created_at", columnList = "created_at")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SyllabusAudit {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "syllabus_id", nullable = false)
    private Long syllabusId;  // Reference to Syllabus (not ManyToOne to avoid constraints)
    
    @Column(name = "version_number", nullable = false)
    private Integer versionNumber;  // Version sequence (1, 2, 3, ...)
    
    @Column(name = "content", columnDefinition = "TEXT")
    private String content;  // Snapshot of content at this version
    
    @Column(name = "learning_objectives", columnDefinition = "TEXT")
    private String learningObjectives;  // Snapshot of learning objectives
    
    @Column(name = "teaching_methods", columnDefinition = "TEXT")
    private String teachingMethods;  // Snapshot of teaching methods
    
    @Column(name = "assessment_methods", columnDefinition = "TEXT")
    private String assessmentMethods;  // Snapshot of assessment methods
    
    @Column(name = "academic_year", length = 50)
    private String academicYear;  // Academic year at this version
    
    @Column(name = "semester")
    private Integer semester;  // Semester at this version
    
    @Column(name = "status", length = 50)
    private String status;  // Status at time of change
    
    @Column(name = "approval_status", length = 50)
    private String approvalStatus;  // Approval status at time of change
    
    @Column(name = "change_type", length = 50)
    private String changeType;  // CREATE, UPDATE, APPROVE, REJECT, PUBLISH
    
    @Column(name = "change_description", columnDefinition = "TEXT")
    private String changeDescription;  // What changed and why
    
    @Column(name = "changed_by", length = 100)
    private String changedBy;  // User ID who made the change
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;  // When this change was made
    
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
