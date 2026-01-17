package com.smd.syllabus.dto;

import java.util.UUID;

public class CreateIssueRequest {
    private UUID syllabusRootId;
    private UUID syllabusId;
    private String title;
    private String description;

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
}
