package com.smd.academic_service.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * Result object for syllabus approval validation
 * Checks if a syllabus meets all requirements for academic approval
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApprovalValidationResult {
    
    private Long syllabusId;
    private String syllabusCode;
    
    private Boolean isReadyForApproval;  // Overall result
    private String message;              // Summary message
    private Integer approvalScore;       // Score 0-100
    
    // Detailed validation results
    private List<ValidationCheckItem> validationChecks = new ArrayList<>();
    
    // Specific metrics
    private Integer cloCoveragePercentage;      // % of CLOs mapped to PLO
    private Integer minRequiredCoverage = 80;   // Minimum required coverage
    private Boolean hasRequiredCredits;          // Check if credits match program standard
    private Boolean hasCourseContent;            // Check if course content exists
    private Boolean hasLearningObjectives;       // Check if learning objectives defined
    private Boolean hasTeachingMethods;          // Check if teaching methods defined
    private Boolean hasAssessmentMethods;        // Check if assessment methods defined
    private Boolean hasValidPrerequisites;       // Check if prerequisites are valid
    
    private List<String> errors = new ArrayList<>();
    private List<String> warnings = new ArrayList<>();
    private List<String> suggestions = new ArrayList<>();
    
    /**
     * Inner class to represent individual validation check
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ValidationCheckItem {
        private String checkName;           // E.g., "CLO Coverage", "Course Content", etc.
        private Boolean isPassed;           // Result of this check
        private String description;         // What was checked
        private String feedback;            // Feedback for this check
        private Integer weight = 1;         // Weight in overall score calculation
    }
}
