package com.smd.syllabus_service.domain;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "syllabus_comment", indexes = {
        @Index(name = "idx_comment_group_version", columnList = "group_id, syllabus_version"),
        @Index(name = "idx_comment_section", columnList = "section_key")
})
public class SyllabusComment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "group_id", nullable = false, length = 50)
    private String groupId;

    @Column(name = "syllabus_version", nullable = false)
    private Integer syllabusVersion;

    // e.g. OVERVIEW / COURSE_CONTENT / CLO_PLO_MAPPING ...
    @Column(name = "section_key", nullable = false, length = 40)
    private String sectionKey;

    // optional: if you have auth integration later
    @Column(name = "author", length = 100)
    private String author;

    @Column(name = "content", nullable = false, columnDefinition = "text")
    private String content;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public String getGroupId() {
        return groupId;
    }

    public Integer getSyllabusVersion() {
        return syllabusVersion;
    }

    public String getSectionKey() {
        return sectionKey;
    }

    public String getAuthor() {
        return author;
    }

    public String getContent() {
        return content;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setGroupId(String groupId) {
        this.groupId = groupId;
    }

    public void setSyllabusVersion(Integer syllabusVersion) {
        this.syllabusVersion = syllabusVersion;
    }

    public void setSectionKey(String sectionKey) {
        this.sectionKey = sectionKey;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
