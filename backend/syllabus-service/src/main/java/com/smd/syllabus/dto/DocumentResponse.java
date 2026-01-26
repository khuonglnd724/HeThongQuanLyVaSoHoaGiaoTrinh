package com.smd.syllabus.dto;

import com.smd.syllabus.domain.DocumentFileType;
import com.smd.syllabus.domain.DocumentStatus;
import com.smd.syllabus.domain.SyllabusDocument;

import java.time.Instant;
import java.util.UUID;

public class DocumentResponse {
    private UUID id;
    private UUID syllabusId;
    private String fileName;
    private String originalName;
    private DocumentFileType fileType;
    private Long fileSize;
    private String uploadedBy;
    private Integer syllabusVersion;
    private DocumentStatus status;
    private String description;
    private Instant uploadedAt;
    private Instant updatedAt;
    private String downloadUrl;
    private String aiIngestionJobId;
    private Instant aiSummaryGeneratedAt;

    public DocumentResponse() {
    }

    public static DocumentResponse fromEntity(SyllabusDocument doc) {
        DocumentResponse response = new DocumentResponse();
        response.setId(doc.getId());
        response.setSyllabusId(doc.getSyllabusId());
        response.setFileName(doc.getFileName());
        response.setOriginalName(doc.getOriginalName());
        response.setFileType(doc.getFileType());
        response.setFileSize(doc.getFileSize());
        response.setUploadedBy(doc.getUploadedBy());
        response.setSyllabusVersion(doc.getSyllabusVersion());
        response.setStatus(doc.getStatus());
        response.setDescription(doc.getDescription());
        response.setUploadedAt(doc.getUploadedAt());
        response.setUpdatedAt(doc.getUpdatedAt());
        response.setDownloadUrl("/api/syllabus/documents/" + doc.getId() + "/download");
        response.setAiIngestionJobId(doc.getAiIngestionJobId());
        response.setAiSummaryGeneratedAt(doc.getAiSummaryGeneratedAt());
        return response;
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

    public String getDownloadUrl() {
        return downloadUrl;
    }

    public void setDownloadUrl(String downloadUrl) {
        this.downloadUrl = downloadUrl;
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
    
    // Get MIME type based on file type
    public String getMimeType() {
        if (fileType == null) {
            return "application/octet-stream";
        }
        
        switch (fileType) {
            case PDF:
                return "application/pdf";
            case DOCX:
                return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            case PPTX:
                return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
            case XLSX:
                return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            default:
                return "application/octet-stream";
        }
    }
}
