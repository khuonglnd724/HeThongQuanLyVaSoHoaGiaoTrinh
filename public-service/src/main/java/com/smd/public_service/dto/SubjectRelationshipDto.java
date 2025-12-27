package com.smd.public_service.dto;

import java.util.List;

public class SubjectRelationshipDto {

    private Long subjectId;
    private String subjectCode;
    private String subjectName;
    private Integer semester;
    private Integer credits;
    private List<String> prerequisites;
    private List<String> corequisites;
    private List<Long> dependentSubjectIds;

    public SubjectRelationshipDto() {
    }

    public Long getSubjectId() {
        return subjectId;
    }

    public void setSubjectId(Long subjectId) {
        this.subjectId = subjectId;
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

    public Integer getSemester() {
        return semester;
    }

    public void setSemester(Integer semester) {
        this.semester = semester;
    }

    public Integer getCredits() {
        return credits;
    }

    public void setCredits(Integer credits) {
        this.credits = credits;
    }

    public List<String> getPrerequisites() {
        return prerequisites;
    }

    public void setPrerequisites(List<String> prerequisites) {
        this.prerequisites = prerequisites;
    }

    public List<String> getCorequisites() {
        return corequisites;
    }

    public void setCorequisites(List<String> corequisites) {
        this.corequisites = corequisites;
    }

    public List<Long> getDependentSubjectIds() {
        return dependentSubjectIds;
    }

    public void setDependentSubjectIds(List<Long> dependentSubjectIds) {
        this.dependentSubjectIds = dependentSubjectIds;
    }
}
