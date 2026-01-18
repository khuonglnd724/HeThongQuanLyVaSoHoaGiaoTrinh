package com.smd.syllabus.dto;

import com.smd.syllabus.domain.DocumentFileType;

import java.util.UUID;

public class DocumentUploadRequest {
    private UUID syllabusId;
    private String fileName;
    private DocumentFileType fileType;
    private Long fileSize;
    private String description;

    // Getters and Setters
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
