package com.smd.syllabus.dto;

import com.fasterxml.jackson.databind.JsonNode;

/**
 * Update syllabus by creating a NEW version.
 * No validation annotations (pom.xml is not modified).
 */
public class UpdateSyllabusRequest {

    private String subjectName;

    private String summary;

    /**
     * Full syllabus authoring payload (JSON object).
     */
    private JsonNode content;

    private String changeNote;

    public UpdateSyllabusRequest() {
    }

    public String getSubjectName() {
        return subjectName;
    }

    public void setSubjectName(String subjectName) {
        this.subjectName = subjectName;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public JsonNode getContent() {
        return content;
    }

    public void setContent(JsonNode content) {
        this.content = content;
    }

    public String getChangeNote() {
        return changeNote;
    }

    public void setChangeNote(String changeNote) {
        this.changeNote = changeNote;
    }
}
