package com.smd.syllabus.dto;

import com.smd.syllabus.domain.SyllabusIssue;

import java.time.Instant;
import java.util.UUID;

public class SyllabusIssueResponse {

    private UUID id;
    private UUID syllabusRootId;
    private UUID syllabusId;
    private String reporterUserId;
    private String title;
    private String description;
    private SyllabusIssue.Status status;
    private Instant createdAt;
    private Instant updatedAt;
    private Instant resolvedAt;

    public static SyllabusIssueResponse from(SyllabusIssue e) {
        SyllabusIssueResponse r = new SyllabusIssueResponse();
        r.id = e.getId();
        r.syllabusRootId = e.getSyllabusRootId();
        r.syllabusId = e.getSyllabusId();
        r.reporterUserId = e.getReporterUserId();
        r.title = e.getTitle();
        r.description = e.getDescription();
        r.status = e.getStatus();
        r.createdAt = e.getCreatedAt();
        r.updatedAt = e.getUpdatedAt();
        r.resolvedAt = e.getResolvedAt();
        return r;
    }

    public UUID getId() {
        return id;
    }

    public UUID getSyllabusRootId() {
        return syllabusRootId;
    }

    public UUID getSyllabusId() {
        return syllabusId;
    }

    public String getReporterUserId() {
        return reporterUserId;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public SyllabusIssue.Status getStatus() {
        return status;
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
}
