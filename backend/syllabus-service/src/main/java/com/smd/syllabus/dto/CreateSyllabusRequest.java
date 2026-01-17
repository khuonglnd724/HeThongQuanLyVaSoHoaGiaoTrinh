package com.smd.syllabus.dto;

import com.fasterxml.jackson.databind.JsonNode;

/**
 * Create a new syllabus as Draft.
 * (No jakarta.validation annotations because pom cannot be changed.)
 */
public class CreateSyllabusRequest {

    private String subjectCode;
    private String subjectName;
    private String summary;

    /**
     * Full syllabus authoring payload.
     * Expected as JSON object in request body.
     */
    private JsonNode content;

    public CreateSyllabusRequest() {
    }

    public String getSubjectCode() {
        return subjectCode;
    }

    public void setSubjectCode(String subjectCode) {
        this.subjectCode = subjectCode;
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
}
