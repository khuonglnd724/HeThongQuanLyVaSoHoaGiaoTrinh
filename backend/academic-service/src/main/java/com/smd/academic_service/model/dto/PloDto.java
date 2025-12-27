package com.smd.academic_service.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * PLO DTO - Program Learning Outcome
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PloDto {
    private Long id;
    private String ploCode;
    private String ploName;
    private String description;
    private Long programId;
    private Integer displayOrder;
    private String ploLevel;
    private String assessmentMethod;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
