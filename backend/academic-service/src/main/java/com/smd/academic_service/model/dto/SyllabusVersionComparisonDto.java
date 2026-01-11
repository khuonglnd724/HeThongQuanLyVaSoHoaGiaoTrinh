package com.smd.academic_service.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * Result object for syllabus version comparison
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SyllabusVersionComparisonDto {
    
    private Long syllabusId;
    private String syllabusCode;
    
    private Integer version1;
    private Integer version2;
    
    // Comparison results
    private List<ComparisonField> differences = new ArrayList<>();
    private Boolean hasDifferences;
    
    /**
     * Individual field comparison
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ComparisonField {
        private String fieldName;
        private String fieldLabel;  // Display name
        private String value1;      // Value from version 1
        private String value2;      // Value from version 2
        private Boolean isDifferent;
    }
}
