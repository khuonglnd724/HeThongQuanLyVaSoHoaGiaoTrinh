package com.smd.public_service.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.experimental.SuperBuilder;

/**
 * Subject Relationship - Mối quan hệ giữa các môn học (Prerequisite, Corequisite)
 */
@Entity
@Table(name = "subject_relationship", indexes = {
    @Index(name = "idx_rel_subject_id", columnList = "subject_id"),
    @Index(name = "idx_rel_related_subject_id", columnList = "related_subject_id")
})
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class SubjectRelationship extends BaseEntity {
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "related_subject_id", nullable = false)
    private Subject relatedSubject;
    
    @Column(name = "relationship_type", nullable = false, length = 50)
    private String relationshipType;  // PREREQUISITE, COREQUISITE, RECOMMENDED
    
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
}
