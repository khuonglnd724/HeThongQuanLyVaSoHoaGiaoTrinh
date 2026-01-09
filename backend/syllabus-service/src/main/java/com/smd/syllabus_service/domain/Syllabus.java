package com.smd.syllabus_service.domain;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "syllabus", indexes = {
        @Index(name = "idx_syllabus_group_version", columnList = "group_id, version"),
        @Index(name = "idx_syllabus_course_code", columnList = "course_code")
})
public class Syllabus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ===== Existing fields (keep for backward compatibility) =====
    @Column(nullable = false)
    private String name;

    @Column(name = "course_code", nullable = false)
    private String courseCode;

    // ===== New fields for Syllabus Builder / Versioning =====
    @Column(name = "group_id", nullable = false, length = 50)
    private String groupId;

    @Column(nullable = false)
    private Integer version;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SyllabusStatus status;

    // Basic metadata (optional)
    @Column(name = "academic_year")
    private String academicYear;

    @Column(name = "semester")
    private String semester;

    // Sections (optional, can be empty)
    @Column(columnDefinition = "text")
    private String overview;

    @Column(name = "learning_objectives", columnDefinition = "text")
    private String learningObjectives;

    @Column(name = "teaching_methods", columnDefinition = "text")
    private String teachingMethods;

    @Column(columnDefinition = "text")
    private String assessments;

    @Column(name = "course_content", columnDefinition = "text")
    private String courseContent;

    @Column(columnDefinition = "text")
    private String references;

    // CLO-PLO mapping / Assessment tables as JSON strings (keeps backend simple)
    @Column(name = "clo_plo_map_json", columnDefinition = "text")
    private String cloPloMapJson;

    @Column(name = "assessment_table_json", columnDefinition = "text")
    private String assessmentTableJson;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    public void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = Instant.now();
    }

    // ===== getters/setters =====

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getCourseCode() {
        return courseCode;
    }

    public String getGroupId() {
        return groupId;
    }

    public Integer getVersion() {
        return version;
    }

    public SyllabusStatus getStatus() {
        return status;
    }

    public String getAcademicYear() {
        return academicYear;
    }

    public String getSemester() {
        return semester;
    }

    public String getOverview() {
        return overview;
    }

    public String getLearningObjectives() {
        return learningObjectives;
    }

    public String getTeachingMethods() {
        return teachingMethods;
    }

    public String getAssessments() {
        return assessments;
    }

    public String getCourseContent() {
        return courseContent;
    }

    public String getReferences() {
        return references;
    }

    public String getCloPloMapJson() {
        return cloPloMapJson;
    }

    public String getAssessmentTableJson() {
        return assessmentTableJson;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setCourseCode(String courseCode) {
        this.courseCode = courseCode;
    }

    public void setGroupId(String groupId) {
        this.groupId = groupId;
    }

    public void setVersion(Integer version) {
        this.version = version;
    }

    public void setStatus(SyllabusStatus status) {
        this.status = status;
    }

    public void setAcademicYear(String academicYear) {
        this.academicYear = academicYear;
    }

    public void setSemester(String semester) {
        this.semester = semester;
    }

    public void setOverview(String overview) {
        this.overview = overview;
    }

    public void setLearningObjectives(String learningObjectives) {
        this.learningObjectives = learningObjectives;
    }

    public void setTeachingMethods(String teachingMethods) {
        this.teachingMethods = teachingMethods;
    }

    public void setAssessments(String assessments) {
        this.assessments = assessments;
    }

    public void setCourseContent(String courseContent) {
        this.courseContent = courseContent;
    }

    public void setReferences(String references) {
        this.references = references;
    }

    public void setCloPloMapJson(String cloPloMapJson) {
        this.cloPloMapJson = cloPloMapJson;
    }

    public void setAssessmentTableJson(String assessmentTableJson) {
        this.assessmentTableJson = assessmentTableJson;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
