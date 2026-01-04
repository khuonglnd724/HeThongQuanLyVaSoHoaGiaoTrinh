package com.smd.academic_service.service;

import com.smd.academic_service.model.dto.ApprovalValidationResult;
import com.smd.academic_service.model.entity.*;
import com.smd.academic_service.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Service để validate xem một Syllabus có đủ điều kiện để phê duyệt hay không
 * Kiểm tra:
 * - CLO-PLO mapping coverage (>= 80%)
 * - Required course content
 * - Learning objectives
 * - Teaching methods
 * - Assessment methods
 * - Valid prerequisites
 * - Credit requirements
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ApprovalValidationService {
    
    private final SyllabusRepository syllabusRepository;
    private final CloRepository cloRepository;
    private final CloMappingRepository cloMappingRepository;
    private final PrerequisiteValidatorService prerequisiteValidator;
    private final ProgramRepository programRepository;
    private final SubjectRepository subjectRepository;
    
    // Configurable thresholds
    private static final int MIN_CLO_COVERAGE_PERCENTAGE = 80;
    private static final int MIN_CONTENT_LENGTH = 100;  // Minimum characters for content
    private static final int MIN_OBJECTIVES_LENGTH = 50;
    
    /**
     * Validate syllabus for academic approval
     * @param syllabusId ID của giáo trình
     * @return ApprovalValidationResult với chi tiết validation
     */
    public ApprovalValidationResult validateForApproval(Long syllabusId) {
        log.info("Validating syllabus for approval: {}", syllabusId);
        
        Syllabus syllabus = syllabusRepository.findByIdAndIsActiveTrue(syllabusId)
            .orElseThrow(() -> new com.smd.academic_service.exception.ResourceNotFoundException(
                "Syllabus not found with id: " + syllabusId));
        
        ApprovalValidationResult result = ApprovalValidationResult.builder()
            .syllabusId(syllabus.getId())
            .syllabusCode(syllabus.getSyllabusCode())
            .validationChecks(new ArrayList<>())
            .errors(new ArrayList<>())
            .warnings(new ArrayList<>())
            .suggestions(new ArrayList<>())
            .approvalScore(0)
            .minRequiredCoverage(MIN_CLO_COVERAGE_PERCENTAGE)
            .build();
        
        try {
            // 1. Check CLO-PLO Coverage
            checkCloCoverage(syllabus, result);
            
            // 2. Check Course Content
            checkCourseContent(syllabus, result);
            
            // 3. Check Learning Objectives
            checkLearningObjectives(syllabus, result);
            
            // 4. Check Teaching Methods
            checkTeachingMethods(syllabus, result);
            
            // 5. Check Assessment Methods
            checkAssessmentMethods(syllabus, result);
            
            // 6. Check Prerequisites (if subject has prerequisites)
            checkPrerequisites(syllabus, result);
            
            // 7. Check Credit Requirements
            checkCredits(syllabus, result);
            
            // 8. Calculate overall approval readiness
            calculateApprovalScore(result);
            
        } catch (Exception e) {
            log.error("Error validating syllabus for approval: {}", syllabusId, e);
            result.getErrors().add("Error during validation: " + e.getMessage());
            result.setIsReadyForApproval(false);
            result.setMessage("Validation failed due to system error");
        }
        
        // Set final message
        if (result.getIsReadyForApproval()) {
            result.setMessage("Syllabus is ready for approval (Score: " + result.getApprovalScore() + "/100)");
        } else {
            result.setMessage("Syllabus is NOT ready for approval - " + result.getErrors().size() + " issue(s) found");
        }
        
        return result;
    }
    
    /**
     * Check CLO-PLO coverage percentage
     */
    private void checkCloCoverage(Syllabus syllabus, ApprovalValidationResult result) {
        log.debug("Checking CLO coverage for syllabus: {}", syllabus.getSyllabusCode());
        
        Subject subject = syllabus.getSubject();
        Program program = subject.getProgram();
        
        // Get all CLOs for this subject
        List<Clo> subjectClos = cloRepository.findActiveClosBySubjectId(subject.getId());
        
        if (subjectClos.isEmpty()) {
            result.getErrors().add("No CLOs defined for this subject");
            result.setCloCoveragePercentage(0);
            result.getValidationChecks().add(
                ApprovalValidationResult.ValidationCheckItem.builder()
                    .checkName("CLO-PLO Coverage")
                    .isPassed(false)
                    .description("Percentage of CLOs mapped to PLOs in program")
                    .feedback("No CLOs defined. At least 1 CLO is required.")
                    .weight(3)
                    .build()
            );
            return;
        }
        
        // Get all mappings for these CLOs
        List<CloMapping> mappings = cloMappingRepository.findMappingsByProgramId(program.getId())
            .stream()
            .filter(m -> subjectClos.stream().anyMatch(clo -> clo.getId().equals(m.getClo().getId())))
            .collect(Collectors.toList());
        
        long mappedClos = mappings.stream()
            .map(m -> m.getClo().getId())
            .distinct()
            .count();
        
        int coveragePercentage = (int) ((mappedClos * 100) / subjectClos.size());
        result.setCloCoveragePercentage(coveragePercentage);
        
        boolean passed = coveragePercentage >= MIN_CLO_COVERAGE_PERCENTAGE;
        
        result.getValidationChecks().add(
            ApprovalValidationResult.ValidationCheckItem.builder()
                .checkName("CLO-PLO Coverage")
                .isPassed(passed)
                .description("At least " + MIN_CLO_COVERAGE_PERCENTAGE + "% of CLOs should be mapped to PLOs")
                .feedback("Current coverage: " + coveragePercentage + "% (" + mappedClos + "/" + subjectClos.size() + " CLOs mapped)")
                .weight(3)
                .build()
        );
        
        if (!passed) {
            result.getErrors().add("CLO-PLO coverage is below required threshold: " + coveragePercentage + "% (required: " + MIN_CLO_COVERAGE_PERCENTAGE + "%)");
            result.getSuggestions().add("Map " + (subjectClos.size() - mappedClos) + " more CLOs to PLOs to meet the requirement");
        }
    }
    
    /**
     * Check if course content is defined
     */
    private void checkCourseContent(Syllabus syllabus, ApprovalValidationResult result) {
        log.debug("Checking course content for syllabus: {}", syllabus.getSyllabusCode());
        
        boolean hasContent = syllabus.getContent() != null && 
                            syllabus.getContent().trim().length() >= MIN_CONTENT_LENGTH;
        result.setHasCourseContent(hasContent);
        
        result.getValidationChecks().add(
            ApprovalValidationResult.ValidationCheckItem.builder()
                .checkName("Course Content")
                .isPassed(hasContent)
                .description("Detailed course content should be provided")
                .feedback(hasContent ? 
                    "Content defined (" + syllabus.getContent().length() + " characters)" :
                    "Content is missing or too short (minimum " + MIN_CONTENT_LENGTH + " characters required)")
                .weight(2)
                .build()
        );
        
        if (!hasContent) {
            result.getErrors().add("Course content is missing or insufficient");
            result.getSuggestions().add("Provide detailed course content (minimum " + MIN_CONTENT_LENGTH + " characters)");
        }
    }
    
    /**
     * Check if learning objectives are defined
     */
    private void checkLearningObjectives(Syllabus syllabus, ApprovalValidationResult result) {
        log.debug("Checking learning objectives for syllabus: {}", syllabus.getSyllabusCode());
        
        boolean hasObjectives = syllabus.getLearningObjectives() != null && 
                               syllabus.getLearningObjectives().trim().length() >= MIN_OBJECTIVES_LENGTH;
        result.setHasLearningObjectives(hasObjectives);
        
        result.getValidationChecks().add(
            ApprovalValidationResult.ValidationCheckItem.builder()
                .checkName("Learning Objectives")
                .isPassed(hasObjectives)
                .description("Clear learning objectives should be defined for the course")
                .feedback(hasObjectives ? 
                    "Learning objectives defined (" + syllabus.getLearningObjectives().length() + " characters)" :
                    "Learning objectives are missing or insufficient")
                .weight(2)
                .build()
        );
        
        if (!hasObjectives) {
            result.getErrors().add("Learning objectives are not defined");
            result.getSuggestions().add("Define clear learning objectives for the course");
        }
    }
    
    /**
     * Check if teaching methods are defined
     */
    private void checkTeachingMethods(Syllabus syllabus, ApprovalValidationResult result) {
        log.debug("Checking teaching methods for syllabus: {}", syllabus.getSyllabusCode());
        
        boolean hasTeachingMethods = syllabus.getTeachingMethods() != null && 
                                   !syllabus.getTeachingMethods().trim().isEmpty();
        result.setHasTeachingMethods(hasTeachingMethods);
        
        result.getValidationChecks().add(
            ApprovalValidationResult.ValidationCheckItem.builder()
                .checkName("Teaching Methods")
                .isPassed(hasTeachingMethods)
                .description("Teaching methods should be specified")
                .feedback(hasTeachingMethods ? 
                    "Teaching methods defined: " + syllabus.getTeachingMethods() :
                    "Teaching methods are not specified")
                .weight(1)
                .build()
        );
        
        if (!hasTeachingMethods) {
            result.getWarnings().add("Teaching methods are not specified");
            result.getSuggestions().add("Specify teaching methods (lecture, discussion, lab, etc.)");
        }
    }
    
    /**
     * Check if assessment methods are defined
     */
    private void checkAssessmentMethods(Syllabus syllabus, ApprovalValidationResult result) {
        log.debug("Checking assessment methods for syllabus: {}", syllabus.getSyllabusCode());
        
        boolean hasAssessmentMethods = syllabus.getAssessmentMethods() != null && 
                                      !syllabus.getAssessmentMethods().trim().isEmpty();
        result.setHasAssessmentMethods(hasAssessmentMethods);
        
        result.getValidationChecks().add(
            ApprovalValidationResult.ValidationCheckItem.builder()
                .checkName("Assessment Methods")
                .isPassed(hasAssessmentMethods)
                .description("Assessment/evaluation methods should be specified")
                .feedback(hasAssessmentMethods ? 
                    "Assessment methods defined: " + syllabus.getAssessmentMethods() :
                    "Assessment methods are not specified")
                .weight(2)
                .build()
        );
        
        if (!hasAssessmentMethods) {
            result.getErrors().add("Assessment methods are not defined");
            result.getSuggestions().add("Define assessment methods (exam, project, participation, etc.)");
        }
    }
    
    /**
     * Check if prerequisites are valid
     */
    private void checkPrerequisites(Syllabus syllabus, ApprovalValidationResult result) {
        log.debug("Checking prerequisites for syllabus: {}", syllabus.getSyllabusCode());
        
        Subject subject = syllabus.getSubject();
        
        if (subject.getPrerequisites() == null || subject.getPrerequisites().trim().isEmpty()) {
            result.setHasValidPrerequisites(true);
            result.getValidationChecks().add(
                ApprovalValidationResult.ValidationCheckItem.builder()
                    .checkName("Prerequisites Validation")
                    .isPassed(true)
                    .description("Check if prerequisites are valid")
                    .feedback("No prerequisites defined")
                    .weight(1)
                    .build()
            );
            return;
        }
        
        // Validate prerequisites using PrerequisiteValidatorService
        var prereqResult = prerequisiteValidator.validatePrerequisites(subject.getId());
        boolean prereqValid = Boolean.TRUE.equals(prereqResult.getIsValid()) && 
                             !Boolean.TRUE.equals(prereqResult.getHasCircularDependency());
        
        result.setHasValidPrerequisites(prereqValid);
        
        result.getValidationChecks().add(
            ApprovalValidationResult.ValidationCheckItem.builder()
                .checkName("Prerequisites Validation")
                .isPassed(prereqValid)
                .description("Check if prerequisite chain is valid (no circular dependencies)")
                .feedback(prereqValid ? 
                    "Prerequisites are valid" :
                    "Prerequisites have issues: " + String.join(", ", prereqResult.getValidationErrors()))
                .weight(2)
                .build()
        );
        
        if (!prereqValid) {
            result.getErrors().addAll(prereqResult.getValidationErrors());
        }
    }
    
    /**
     * Check if credits match program standard
     */
    private void checkCredits(Syllabus syllabus, ApprovalValidationResult result) {
        log.debug("Checking credits for syllabus: {}", syllabus.getSyllabusCode());
        
        Subject subject = syllabus.getSubject();
        boolean validCredits = subject.getCredits() != null && subject.getCredits() > 0;
        
        result.setHasRequiredCredits(validCredits);
        
        result.getValidationChecks().add(
            ApprovalValidationResult.ValidationCheckItem.builder()
                .checkName("Credit Requirement")
                .isPassed(validCredits)
                .description("Subject should have valid credits (> 0)")
                .feedback(validCredits ? 
                    "Credits: " + subject.getCredits() :
                    "Invalid or missing credit information")
                .weight(1)
                .build()
        );
        
        if (!validCredits) {
            result.getErrors().add("Subject has invalid credit information");
        }
    }
    
    /**
     * Calculate overall approval score based on validation checks
     */
    private void calculateApprovalScore(ApprovalValidationResult result) {
        if (result.getValidationChecks().isEmpty()) {
            result.setApprovalScore(0);
            result.setIsReadyForApproval(false);
            return;
        }
        
        int totalWeight = result.getValidationChecks().stream()
            .mapToInt(check -> check.getWeight())
            .sum();
        
        int passedWeight = result.getValidationChecks().stream()
            .filter(check -> Boolean.TRUE.equals(check.getIsPassed()))
            .mapToInt(check -> check.getWeight())
            .sum();
        
        int score = totalWeight > 0 ? (int) ((passedWeight * 100.0) / totalWeight) : 0;
        result.setApprovalScore(Math.min(100, score));
        
        // Ready for approval if:
        // - No errors
        // - CLO coverage >= 80%
        // - Score >= 70
        boolean readyForApproval = result.getErrors().isEmpty() && 
                                  (result.getCloCoveragePercentage() == null || result.getCloCoveragePercentage() >= MIN_CLO_COVERAGE_PERCENTAGE) &&
                                  score >= 70;
        
        result.setIsReadyForApproval(readyForApproval);
    }
}
