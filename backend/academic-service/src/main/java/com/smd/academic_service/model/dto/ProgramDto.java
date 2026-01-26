package com.smd.academic_service.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.Set;

/**
 * Program DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProgramDto {
    private Long id;
    private String programCode;
    private String programName;
    private String description;
    private Long departmentId;
    private Integer creditsRequired;
    private Integer durationYears;
    private String degreeType;
    private String accreditationStatus;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Set<PloDto> plos;
    private Set<SubjectDto> subjects;
}
