package com.smd.academic_service.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * CloSyllabus - Mapping giữa CLO và Syllabus (từ syllabus_db)
 * Tạo quan hệ N-N giữa CLO (academic_db) và Syllabus (syllabus_db)
 */
@Entity
@Table(name = "clo_syllabus", indexes = {
    @Index(name = "idx_clo_syllabus_clo_id", columnList = "clo_id"),
    @Index(name = "idx_clo_syllabus_syllabus_id", columnList = "syllabus_id")
}, uniqueConstraints = {
    @UniqueConstraint(name = "unique_clo_syllabus", columnNames = {"clo_id", "syllabus_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CloSyllabus {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "clo_id", nullable = false)
    private Long cloId;
    
    @Column(name = "syllabus_id", nullable = false, length = 36)
    private String syllabusId;  // UUID từ syllabus_db.syllabuses.id
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "created_by", length = 255)
    private String createdBy;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
