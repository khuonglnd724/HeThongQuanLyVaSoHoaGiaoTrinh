package com.smd.syllabus.domain;

import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "syllabus_follows", uniqueConstraints = {
        @UniqueConstraint(name = "uk_follow_user_root", columnNames = { "user_id", "syllabus_root_id" })
}, indexes = {
        @Index(name = "idx_follow_user_id", columnList = "user_id"),
        @Index(name = "idx_follow_root_id", columnList = "syllabus_root_id"),
        @Index(name = "idx_follow_created_at", columnList = "created_at")
})
public class SyllabusFollow {

    @Id
    @GeneratedValue
    @UuidGenerator
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "user_id", nullable = false, length = 100)
    private String userId;

    @Column(name = "syllabus_root_id", nullable = false)
    private UUID syllabusRootId;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    public SyllabusFollow() {
    }

    @PrePersist
    void prePersist() {
        if (createdAt == null)
            createdAt = Instant.now();
        if (userId != null)
            userId = userId.trim();
    }

    public UUID getId() {
        return id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public UUID getSyllabusRootId() {
        return syllabusRootId;
    }

    public void setSyllabusRootId(UUID syllabusRootId) {
        this.syllabusRootId = syllabusRootId;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
