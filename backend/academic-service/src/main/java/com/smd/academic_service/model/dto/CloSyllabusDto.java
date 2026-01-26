package com.smd.academic_service.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * CloSyllabus DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CloSyllabusDto {
    private Long id;
    private Long cloId;
    private String syllabusId;
    private LocalDateTime createdAt;
    private String createdBy;
}
