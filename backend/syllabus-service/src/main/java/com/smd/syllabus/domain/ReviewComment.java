package com.smd.syllabus.domain;

import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "review_comments", indexes = {
        @Index(name = "idx_rc_syllabus_id", columnList = "syllabus_id"),
        @Index(name = "idx_rc_section_key", columnList = "section_key")
})
public class ReviewComment {

    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    @Column(name = "syllabus_id", nullable = false)
    private UUID syllabusId;

    /**
     * FE section identifier:
     * e.g. "CLO_TABLE", "ASSESSMENT_WEIGHT", "PREREQUISITE"
     */
    @Column(name = "section_key", nullable = false, length = 100)
    private String sectionKey;

    @Column(name = "content", nullable = false, columnDefinition = "text")
    private String content;

    @Column(name = "author_id", nullable = false)
    private Long authorId;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    void prePersist() {
        this.createdAt = Instant.now();
    }

    @PreUpdate
    void preUpdate() {
        this.updatedAt = Instant.now();
    }

    // getters & setters
    public UUID getId() {
        return id;
    }

    public UUID getSyllabusId() {
        return syllabusId;
    }

    public void setSyllabusId(UUID syllabusId) {
        this.syllabusId = syllabusId;
    }

    public String getSectionKey() {
        return sectionKey;
    }

    public void setSectionKey(String sectionKey) {
        this.sectionKey = sectionKey;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Long getAuthorId() {
        return authorId;
    }

    public void setAuthorId(Long authorId) {
        this.authorId = authorId;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
