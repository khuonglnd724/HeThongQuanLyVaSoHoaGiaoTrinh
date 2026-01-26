package com.smd.syllabus.domain;

import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.UUID;

/**
 * Entity representing teaching materials uploaded by lecturers
 * All documents are versioned and linked to specific syllabus versions
 */
@Entity
@Table(name = "syllabus_documents", indexes = {
        @Index(name = "idx_documents_syllabus_id", columnList = "syllabus_id"),
        @Index(name = "idx_documents_status", columnList = "status"),
        @Index(name = "idx_documents_upload_by", columnList = "uploaded_by")
})
public class SyllabusDocument {

    @Id
    @GeneratedValue
    @UuidGenerator
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "syllabus_id", nullable = false)
    private UUID syllabusId;

    @Column(name = "file_name", nullable = false, length = 255)
    private String fileName;

    @Column(name = "original_name", nullable = false, length = 255)
    private String originalName;

    @Enumerated(EnumType.STRING)
    @Column(name = "file_type", nullable = false, length = 20)
    private DocumentFileType fileType;

    @Column(name = "file_size", nullable = false)
    private Long fileSize; // in bytes

    @Column(name = "file_path", nullable = false, length = 500)
    private String filePath;

    @Column(name = "mime_type", length = 100)
    private String mimeType;

    @Column(name = "uploaded_by", nullable = false, length = 100)
    private String uploadedBy;

    @Column(name = "syllabus_version", nullable = false)
    private Integer syllabusVersion;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private DocumentStatus status = DocumentStatus.DRAFT;

    @Column(name = "description", columnDefinition = "text")
    private String description;

    @Column(name = "uploaded_at", nullable = false)
    private Instant uploadedAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(name = "is_deleted", nullable = false)
    private boolean deleted = false;

    @Column(name = "ai_ingestion_job_id", length = 50)
    private String aiIngestionJobId;

    @Column(name = "ai_summary_generated_at")
    private Instant aiSummaryGeneratedAt;

    // Constructors
    public SyllabusDocument() {
    }

    @PrePersist
    void prePersist() {
        Instant now = Instant.now();
        this.uploadedAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    void preUpdate() {
        this.updatedAt = Instant.now();
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getSyllabusId() {
        return syllabusId;
    }

    public void setSyllabusId(UUID syllabusId) {
        this.syllabusId = syllabusId;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getOriginalName() {
        return originalName;
    }

    public void setOriginalName(String originalName) {
        this.originalName = originalName;
    }

    public DocumentFileType getFileType() {
        return fileType;
    }

    public void setFileType(DocumentFileType fileType) {
        this.fileType = fileType;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public String getMimeType() {
        return mimeType;
    }

    public void setMimeType(String mimeType) {
        this.mimeType = mimeType;
    }

    public String getUploadedBy() {
        return uploadedBy;
    }

    public void setUploadedBy(String uploadedBy) {
        this.uploadedBy = uploadedBy;
    }

    public Integer getSyllabusVersion() {
        return syllabusVersion;
    }

    public void setSyllabusVersion(Integer syllabusVersion) {
        this.syllabusVersion = syllabusVersion;
    }

    public DocumentStatus getStatus() {
        return status;
    }

    public void setStatus(DocumentStatus status) {
        this.status = status;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Instant getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(Instant uploadedAt) {
        this.uploadedAt = uploadedAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public boolean isDeleted() {
        return deleted;
    }

    public void setDeleted(boolean deleted) {
        this.deleted = deleted;
    }

    public String getAiIngestionJobId() {
        return aiIngestionJobId;
    }

    public void setAiIngestionJobId(String aiIngestionJobId) {
        this.aiIngestionJobId = aiIngestionJobId;
    }

    public Instant getAiSummaryGeneratedAt() {
        return aiSummaryGeneratedAt;
    }

    public void setAiSummaryGeneratedAt(Instant aiSummaryGeneratedAt) {
        this.aiSummaryGeneratedAt = aiSummaryGeneratedAt;
    }
}
