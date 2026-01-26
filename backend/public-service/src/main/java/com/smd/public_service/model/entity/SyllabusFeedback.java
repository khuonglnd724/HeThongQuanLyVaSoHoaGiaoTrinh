package com.smd.public_service.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

/**
 * Syllabus Feedback - Báo cáo lỗi/góp ý từ sinh viên
 */
@Entity
@Table(name = "syllabus_feedback", indexes = {
    @Index(name = "idx_feedback_syllabus_id", columnList = "syllabus_id"),
    @Index(name = "idx_feedback_status", columnList = "status")
})
@Getter
@Setter
@ToString(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class SyllabusFeedback extends BaseEntity {
    
    @Column(name = "syllabus_id", nullable = false)
    private Long syllabusId;
    
    @Column(name = "user_id")
    private Long userId;
    
    @Column(name = "user_email", length = 255)
    private String userEmail;
    
    @Column(name = "feedback_type", nullable = false, length = 50)
    private String feedbackType;  // ERROR, SUGGESTION, QUESTION, OTHER
    
    @Column(name = "title", nullable = false, length = 255)
    private String title;
    
    @Column(name = "message", nullable = false, columnDefinition = "TEXT")
    private String message;
    
    @Column(name = "status", length = 50)
    private String status;  // PENDING, REVIEWED, RESOLVED, CLOSED
    
    @Column(name = "response", columnDefinition = "TEXT")
    private String response;
    
    @Column(name = "resolved_by")
    private Long resolvedBy;
    
    @Column(name = "resolved_at")
    private Long resolvedAt;  // Timestamp
}
