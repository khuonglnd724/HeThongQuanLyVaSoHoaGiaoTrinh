package com.smd.public_service.dto;

public class SyllabusDiffDto {

    private Long syllabusId;
    private String currentVersion;
    private String previousVersion;
    private String field;
    private String oldValue;
    private String newValue;
    private String changeType; // ADDED, REMOVED, MODIFIED

    public SyllabusDiffDto() {
    }

    public SyllabusDiffDto(Long syllabusId, String field, String oldValue, String newValue) {
        this.syllabusId = syllabusId;
        this.field = field;
        this.oldValue = oldValue;
        this.newValue = newValue;
    }

    public Long getSyllabusId() {
        return syllabusId;
    }

    public void setSyllabusId(Long syllabusId) {
        this.syllabusId = syllabusId;
    }

    public String getCurrentVersion() {
        return currentVersion;
    }

    public void setCurrentVersion(String currentVersion) {
        this.currentVersion = currentVersion;
    }

    public String getPreviousVersion() {
        return previousVersion;
    }

    public void setPreviousVersion(String previousVersion) {
        this.previousVersion = previousVersion;
    }

    public String getField() {
        return field;
    }

    public void setField(String field) {
        this.field = field;
    }

    public String getOldValue() {
        return oldValue;
    }

    public void setOldValue(String oldValue) {
        this.oldValue = oldValue;
    }

    public String getNewValue() {
        return newValue;
    }

    public void setNewValue(String newValue) {
        this.newValue = newValue;
    }

    public String getChangeType() {
        return changeType;
    }

    public void setChangeType(String changeType) {
        this.changeType = changeType;
    }
}
