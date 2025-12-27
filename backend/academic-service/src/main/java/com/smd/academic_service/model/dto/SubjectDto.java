package com.smd.academic_service.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.Set;

/**
 * Subject DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubjectDto {
    private Long id;
    private String subjectCode;
    private String subjectName;
    private String description;
    private Long programId;
    private Integer credits;
    private Integer semester;
    private String prerequisites;
    private String corequisites;
    private String subjectType;
    private Boolean isFoundational;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Set<CloDto> clos;
    private Set<SyllabusDto> syllabuses;
}
