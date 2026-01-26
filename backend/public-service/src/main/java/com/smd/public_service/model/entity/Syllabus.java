package com.smd.public_service.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

/**
 * Syllabus (Giáo trình) - Read-only replica cho public-service
 */
@Entity
@Table(name = "syllabus", indexes = {
    @Index(name = "idx_syllabus_subject_id", columnList = "subject_id"),
    @Index(name = "idx_syllabus_code", columnList = "syllabus_code"),
    @Index(name = "idx_syllabus_status", columnList = "status"),
    @Index(name = "idx_syllabus_updated_at", columnList = "updated_at")
})
@Getter
@Setter
@ToString(callSuper = true, exclude = {"subject"})
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Syllabus extends BaseEntity {
    
    @Column(name = "syllabus_code", nullable = false, length = 50)
    private String syllabusCode;
    
    @Column(name = "version", nullable = false)
    private Integer version;
    
    @Column(name = "academic_year", nullable = false, length = 50)
    private String academicYear;
    
    @Column(name = "semester", nullable = false)
    private Integer semester;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;
    
    @Column(name = "content", columnDefinition = "TEXT")
    private String content;
    
    @Column(name = "learning_objectives", columnDefinition = "TEXT")
    private String learningObjectives;
    
    @Column(name = "teaching_methods", columnDefinition = "TEXT")
    private String teachingMethods;
    
    @Column(name = "assessment_methods", columnDefinition = "TEXT")
    private String assessmentMethods;
    
    @Column(name = "status", length = 50)
    private String status;
    
    @Column(name = "approved_by")
    private Long approvedBy;
    
    @Column(name = "approval_comments", columnDefinition = "TEXT")
    private String approvalComments;

    // Full-text search support (PostgreSQL only - disabled for H2)
    // @Column(name = "search_vector", columnDefinition = "tsvector")
    // private String searchVector;
}