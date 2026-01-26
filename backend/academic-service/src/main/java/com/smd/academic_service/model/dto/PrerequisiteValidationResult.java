package com.smd.academic_service.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * Result object for prerequisite validation
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrerequisiteValidationResult {
    
    private Long subjectId;
    private String subjectCode;
    private String subjectName;
    
    private Boolean isValid;  // Overall validation result
    private String message;   // Summary message
    
    private List<String> validationErrors = new ArrayList<>();
    private List<String> warnings = new ArrayList<>();
    private List<String> suggestions = new ArrayList<>();
    
    // Prerequisite chain details
    private List<PrerequisiteChainDto> prerequisiteChain;
    private Boolean hasCircularDependency;
    private List<String> circularDependencyChain;
    
    /**
     * Inner class to represent prerequisite chain
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PrerequisiteChainDto {
        private Long subjectId;
        private String subjectCode;
        private String subjectName;
        private Integer depth;  // How many levels deep
        private Boolean isCompleted;  // Whether prerequisite is completed
        private List<PrerequisiteChainDto> prerequisites;  // Recursive structure
    }
}
