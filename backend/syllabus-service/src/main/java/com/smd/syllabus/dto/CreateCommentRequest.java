package com.smd.syllabus.dto;

import java.util.UUID;

public class CreateCommentRequest {

    private UUID syllabusId;
    private String sectionKey;
    private String content;

    public CreateCommentRequest() {
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
}
