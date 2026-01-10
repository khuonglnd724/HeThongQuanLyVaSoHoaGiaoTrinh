package com.smd.public_service.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.experimental.SuperBuilder;

/**
 * Syllabus Follow/Subscribe - Sinh viên theo dõi giáo trình
 */
@Entity
@Table(name = "syllabus_follow", indexes = {
    @Index(name = "idx_follow_syllabus_id", columnList = "syllabus_id"),
    @Index(name = "idx_follow_user_id", columnList = "user_id"),
    @Index(name = "idx_follow_unique", columnList = "syllabus_id,user_id", unique = true)
})
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class SyllabusFollow extends BaseEntity {
    
    @Column(name = "syllabus_id", nullable = false)
    private Long syllabusId;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Column(name = "email", nullable = false, length = 255)
    private String email;
    
    @Column(name = "notify_on_change", nullable = false)
    @Builder.Default
    private Boolean notifyOnChange = true;
    
    @Column(name = "followed_at", nullable = false)
    private Long followedAt;  // Timestamp
}
