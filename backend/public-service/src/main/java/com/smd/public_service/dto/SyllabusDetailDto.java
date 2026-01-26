package com.smd.public_service.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Syllabus Detail DTO - Chi tiết giáo trình
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SyllabusDetailDto {
    
    @JsonProperty("id")
    private Long id;
    
    @JsonProperty("syllabusCode")
    private String syllabusCode;
    
    @JsonProperty("version")
    private Integer version;
    
    @JsonProperty("academicYear")
    private String academicYear;
    
    @JsonProperty("semester")
    private Integer semester;
    
    @JsonProperty("subject")
    private SubjectDto subject;
    
    @JsonProperty("content")
    private String content;
    
    @JsonProperty("learningObjectives")
    private String learningObjectives;
    
    @JsonProperty("teachingMethods")
    private String teachingMethods;
    
    @JsonProperty("assessmentMethods")
    private String assessmentMethods;
    
    @JsonProperty("status")
    private String status;
    
    @JsonProperty("updatedAt")
    private String updatedAt;
    
    @JsonProperty("approvalComments")
    private String approvalComments;
}
