package com.smd.academic_service.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for displaying syllabus version history
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SyllabusVersionDto {
    
    private Long auditId;
    private Long syllabusId;
    private Integer versionNumber;
    private String changeType;  // CREATE, UPDATE, APPROVE, REJECT, PUBLISH
    private String changeDescription;
    private String changedBy;
    private LocalDateTime createdAt;
    
    // Snapshot data
    private String status;
    private String approvalStatus;
    private String academicYear;
    private Integer semester;
}
