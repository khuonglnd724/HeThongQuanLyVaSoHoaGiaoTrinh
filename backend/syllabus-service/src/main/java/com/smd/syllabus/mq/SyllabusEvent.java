package com.smd.syllabus.mq;

import java.time.Instant;
import java.util.UUID;

public class SyllabusEvent {
    private String type; // CREATED, SUBMITTED, APPROVED, REJECTED, PUBLISHED, VERSION_CREATED
    private UUID syllabusId;
    private UUID rootId;
    private Integer versionNo;
    private String actorId;
    private String subjectCode;
    private String subjectName;
    private Instant at;

    public SyllabusEvent() {
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public UUID getSyllabusId() {
        return syllabusId;
    }

    public void setSyllabusId(UUID syllabusId) {
        this.syllabusId = syllabusId;
    }

    public UUID getRootId() {
        return rootId;
    }

    public void setRootId(UUID rootId) {
        this.rootId = rootId;
    }

    public Integer getVersionNo() {
        return versionNo;
    }

    public void setVersionNo(Integer versionNo) {
        this.versionNo = versionNo;
    }

    public String getActorId() {
        return actorId;
    }

    public void setActorId(String actorId) {
        this.actorId = actorId;
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

    public Instant getAt() {
        return at;
    }

    public void setAt(Instant at) {
        this.at = at;
    }
}
