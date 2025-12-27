package com.smd.academic_service.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.Set;

/**
 * Syllabus DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SyllabusDto {
    private Long id;
    private String syllabusCode;
    private Integer version;
    private String academicYear;
    private Integer semester;
    private Long subjectId;
    private String content;
    private String learningObjectives;
    private String teachingMethods;
    private String assessmentMethods;
    private String status;
    private String approvalStatus;
    private Long approvedBy;
    private String approvalComments;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Set<CloDto> clos;
}
