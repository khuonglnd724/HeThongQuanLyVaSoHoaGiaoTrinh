package com.smd.public_service.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.experimental.SuperBuilder;
import java.util.HashSet;
import java.util.Set;

/**
 * Subject (Môn học) - Read-only replica cho public-service
 */
@Entity
@Table(name = "subject", indexes = {
    @Index(name = "idx_subject_code", columnList = "subject_code"),
    @Index(name = "idx_subject_program_id", columnList = "program_id")
})
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Subject extends BaseEntity {
    
    @Column(name = "subject_code", nullable = false, length = 50)
    private String subjectCode;
    
    @Column(name = "subject_name", nullable = false, length = 255)
    private String subjectName;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "program_id", nullable = false)
    private Long programId;
    
    @Column(name = "credits", nullable = false)
    private Integer credits;
    
    @Column(name = "semester", nullable = false)
    private Integer semester;
    
    @Column(name = "prerequisites", columnDefinition = "TEXT")
    private String prerequisites;  // JSON format: [{"id": 1, "code": "CS101"}]
    
    @Column(name = "corequisites", columnDefinition = "TEXT")
    private String corequisites;
    
    @Column(name = "subject_type", length = 50)
    private String subjectType;
    
    @Column(name = "is_foundational", nullable = false)
    private Boolean isFoundational = false;
    
    @OneToMany(mappedBy = "subject", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private Set<Syllabus> syllabuses = new HashSet<>();
    
    @OneToMany(mappedBy = "subject", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private Set<SubjectRelationship> outgoingRelationships = new HashSet<>();
    
    @OneToMany(mappedBy = "relatedSubject", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private Set<SubjectRelationship> incomingRelationships = new HashSet<>();
}
