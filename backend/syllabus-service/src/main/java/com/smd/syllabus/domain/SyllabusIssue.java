package com.smd.syllabus.domain;

import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "syllabus_issues", indexes = {
        @Index(name = "idx_issue_root_id", columnList = "syllabus_root_id"),
        @Index(name = "idx_issue_syllabus_id", columnList = "syllabus_id"),
        @Index(name = "idx_issue_reporter", columnList = "reporter_user_id"),
        @Index(name = "idx_issue_status", columnList = "status"),
        @Index(name = "idx_issue_created_at", columnList = "created_at")
})
public class SyllabusIssue {

    public enum Status {
        OPEN,
        IN_PROGRESS,
        RESOLVED,
        CLOSED
    }

    @Id
    @GeneratedValue
    @UuidGenerator
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "syllabus_root_id")
    private UUID syllabusRootId;

    @Column(name = "syllabus_id")
    private UUID syllabusId;

    @Column(name = "reporter_user_id", nullable = false, length = 100)
    private String reporterUserId;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "description", nullable = false, length = 4000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private Status status;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(name = "resolved_at")
    private Instant resolvedAt;

    public SyllabusIssue() {
    }

    @PrePersist
    void prePersist() {
        Instant now = Instant.now();
        if (createdAt == null)
            createdAt = now;
        if (updatedAt == null)
            updatedAt = now;
        if (status == null)
            status = Status.OPEN;

        if (reporterUserId != null)
            reporterUserId = reporterUserId.trim();
        if (title != null)
            title = title.trim();
        if (description != null)
            description = description.trim();
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
        if (title != null)
            title = title.trim();
        if (description != null)
            description = description.trim();
    }

    // Getters / Setters

    public UUID getId() {
        return id;
    }

    public UUID getSyllabusRootId() {
        return syllabusRootId;
    }

    public void setSyllabusRootId(UUID syllabusRootId) {
        this.syllabusRootId = syllabusRootId;
    }

    public UUID getSyllabusId() {
        return syllabusId;
    }

    public void setSyllabusId(UUID syllabusId) {
        this.syllabusId = syllabusId;
    }

    public String getReporterUserId() {
        return reporterUserId;
    }

    public void setReporterUserId(String reporterUserId) {
        this.reporterUserId = reporterUserId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public Instant getResolvedAt() {
        return resolvedAt;
    }

    public void setResolvedAt(Instant resolvedAt) {
        this.resolvedAt = resolvedAt;
    }
}
