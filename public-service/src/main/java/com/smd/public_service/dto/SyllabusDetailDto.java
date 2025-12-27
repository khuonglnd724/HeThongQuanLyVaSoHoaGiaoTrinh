package com.smd.public_service.dto;

import java.util.List;

public class SyllabusDetailDto {

    private Long id;
    private String syllabusCode;
    private String version;
    private String academicYear;
    private Integer semester;
    private String subjectName;
    private String subjectCode;
    private String description;
    private String content;
    private String learningObjectives;
    private String teachingMethods;
    private String assessmentMethods;
    private String status;
    private String approvalStatus;
    private String updatedAt;
    private Integer credits;
    private List<CloSummaryDto> clos;
    private List<CloMappingDto> cloMappings;

    public SyllabusDetailDto() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSyllabusCode() {
        return syllabusCode;
    }

    public void setSyllabusCode(String syllabusCode) {
        this.syllabusCode = syllabusCode;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public String getAcademicYear() {
        return academicYear;
    }

    public void setAcademicYear(String academicYear) {
        this.academicYear = academicYear;
    }

    public Integer getSemester() {
        return semester;
    }

    public void setSemester(Integer semester) {
        this.semester = semester;
    }

    public String getSubjectName() {
        return subjectName;
    }

    public void setSubjectName(String subjectName) {
        this.subjectName = subjectName;
    }

    public String getSubjectCode() {
        return subjectCode;
    }

    public void setSubjectCode(String subjectCode) {
        this.subjectCode = subjectCode;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getLearningObjectives() {
        return learningObjectives;
    }

    public void setLearningObjectives(String learningObjectives) {
        this.learningObjectives = learningObjectives;
    }

    public String getTeachingMethods() {
        return teachingMethods;
    }

    public void setTeachingMethods(String teachingMethods) {
        this.teachingMethods = teachingMethods;
    }

    public String getAssessmentMethods() {
        return assessmentMethods;
    }

    public void setAssessmentMethods(String assessmentMethods) {
        this.assessmentMethods = assessmentMethods;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getApprovalStatus() {
        return approvalStatus;
    }

    public void setApprovalStatus(String approvalStatus) {
        this.approvalStatus = approvalStatus;
    }

    public String getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(String updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Integer getCredits() {
        return credits;
    }

    public void setCredits(Integer credits) {
        this.credits = credits;
    }

    public List<CloSummaryDto> getClos() {
        return clos;
    }

    public void setClos(List<CloSummaryDto> clos) {
        this.clos = clos;
    }

    public List<CloMappingDto> getCloMappings() {
        return cloMappings;
    }

    public void setCloMappings(List<CloMappingDto> cloMappings) {
        this.cloMappings = cloMappings;
    }
}
