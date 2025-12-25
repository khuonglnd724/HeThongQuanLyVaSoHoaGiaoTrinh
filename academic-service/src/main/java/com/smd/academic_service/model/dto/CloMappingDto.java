package com.smd.academic_service.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * CLO-PLO Mapping DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CloMappingDto {
    private Long id;
    private Long cloId;
    private Long ploId;
    private String mappingLevel;  // Directly Supports, Partially Supports, Not Related
    private String proficiencyLevel;  // Introduce, Develop, Master
    private String evidenceMethod;
    private String notes;
    private Integer strengthLevel;  // 1-5
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
