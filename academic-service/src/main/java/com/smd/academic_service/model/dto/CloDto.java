package com.smd.academic_service.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * CLO DTO - Course Learning Outcome
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CloDto {
    private Long id;
    private String cloCode;
    private String cloName;
    private String description;
    private Long subjectId;
    private Long syllabusId;
    private String bloomLevel;
    private Integer displayOrder;
    private String teachingMethod;
    private String evaluationMethod;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
