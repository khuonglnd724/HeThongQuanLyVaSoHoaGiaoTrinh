package com.smd.academic_service.service;

import com.smd.academic_service.model.dto.PrerequisiteValidationResult;
import com.smd.academic_service.model.entity.Subject;
import com.smd.academic_service.repository.SubjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Service để validate prerequisite (tiên quyết) và corequisite (đồng tiên quyết) của môn học
 * Kiểm tra circular dependencies, prerequisite chains, và validation rules
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class PrerequisiteValidatorService {
    
    private final SubjectRepository subjectRepository;
    
    /**
     * Validate prerequisite chain của một môn học
     * @param subjectId ID của môn học cần kiểm tra
     * @return PrerequisiteValidationResult với chi tiết validation
     */
    public PrerequisiteValidationResult validatePrerequisites(Long subjectId) {
        log.info("Validating prerequisites for subject id: {}", subjectId);
        
        Subject subject = subjectRepository.findByIdAndIsActiveTrue(subjectId)
            .orElseThrow(() -> new RuntimeException("Subject not found with id: " + subjectId));
        
        PrerequisiteValidationResult result = PrerequisiteValidationResult.builder()
            .subjectId(subject.getId())
            .subjectCode(subject.getSubjectCode())
            .subjectName(subject.getSubjectName())
            .validationErrors(new ArrayList<>())
            .warnings(new ArrayList<>())
            .suggestions(new ArrayList<>())
            .prerequisiteChain(new ArrayList<>())
            .hasCircularDependency(false)
            .circularDependencyChain(new ArrayList<>())
            .build();
        
        try {
            // 1. Check if prerequisites field is empty
            if (subject.getPrerequisites() == null || subject.getPrerequisites().trim().isEmpty()) {
                result.setMessage("No prerequisites defined");
                result.setIsValid(true);
                return result;
            }
            
            // 2. Parse prerequisites (expected format: "CS101,CS102" or "CS101;CS102")
            List<String> prerequisiteCodes = parsePrerequisiteString(subject.getPrerequisites());
            
            // 3. Validate each prerequisite exists
            List<Subject> prerequisiteSubjects = new ArrayList<>();
            for (String code : prerequisiteCodes) {
                Subject prereqSubject = subjectRepository.findBySubjectCodeAndIsActiveTrue(code)
                    .orElse(null);
                
                if (prereqSubject == null) {
                    result.getValidationErrors().add("Prerequisite subject not found: " + code);
                } else {
                    prerequisiteSubjects.add(prereqSubject);
                }
            }
            
            // 4. Check for circular dependencies
            Set<Long> visited = new HashSet<>();
            List<Long> recursionStack = new ArrayList<>();
            boolean hasCircular = detectCircularDependency(subject.getId(), visited, recursionStack);
            
            if (hasCircular) {
                result.setHasCircularDependency(true);
                result.getValidationErrors().add("Circular dependency detected in prerequisite chain");
                result.getCircularDependencyChain().addAll(
                    recursionStack.stream()
                        .map(id -> subjectRepository.findById(id)
                            .map(s -> s.getSubjectCode())
                            .orElse("UNKNOWN"))
                        .collect(Collectors.toList())
                );
            }
            
            // 5. Build prerequisite chain tree
            List<PrerequisiteValidationResult.PrerequisiteChainDto> chainDtos = prerequisiteSubjects.stream()
                .map(preq -> buildPrerequisiteChain(preq, 1, new HashSet<>()))
                .collect(Collectors.toList());
            result.setPrerequisiteChain(chainDtos);
            
            // 6. Validation logic
            if (result.getValidationErrors().isEmpty() && !hasCircular) {
                result.setIsValid(true);
                result.setMessage("All prerequisites are valid");
                
                // Add suggestions
                if (prerequisiteSubjects.size() > 3) {
                    result.getSuggestions().add("Consider reducing number of prerequisites (currently " + prerequisiteSubjects.size() + ")");
                }
            } else {
                result.setIsValid(false);
                result.setMessage("Prerequisite validation failed with " + result.getValidationErrors().size() + " error(s)");
            }
            
        } catch (Exception e) {
            log.error("Error validating prerequisites for subject: {}", subjectId, e);
            result.setIsValid(false);
            result.getValidationErrors().add("Error validating prerequisites: " + e.getMessage());
            result.setMessage("Prerequisite validation failed due to system error");
        }
        
        return result;
    }
    
    /**
     * Validate corequisites (đồng tiên quyết) của một môn học
     */
    public PrerequisiteValidationResult validateCorequisites(Long subjectId) {
        log.info("Validating corequisites for subject id: {}", subjectId);
        
        Subject subject = subjectRepository.findByIdAndIsActiveTrue(subjectId)
            .orElseThrow(() -> new RuntimeException("Subject not found with id: " + subjectId));
        
        PrerequisiteValidationResult result = PrerequisiteValidationResult.builder()
            .subjectId(subject.getId())
            .subjectCode(subject.getSubjectCode())
            .subjectName(subject.getSubjectName())
            .validationErrors(new ArrayList<>())
            .warnings(new ArrayList<>())
            .suggestions(new ArrayList<>())
            .build();
        
        // Check if corequisites field is empty
        if (subject.getCorequisites() == null || subject.getCorequisites().trim().isEmpty()) {
            result.setMessage("No corequisites defined");
            result.setIsValid(true);
            return result;
        }
        
        // Parse and validate corequisites
        List<String> corequisiteCodes = parsePrerequisiteString(subject.getCorequisites());
        for (String code : corequisiteCodes) {
            Subject coreqSubject = subjectRepository.findBySubjectCodeAndIsActiveTrue(code)
                .orElse(null);
            
            if (coreqSubject == null) {
                result.getValidationErrors().add("Corequisite subject not found: " + code);
            }
        }
        
        result.setIsValid(result.getValidationErrors().isEmpty());
        result.setMessage(result.getValidationErrors().isEmpty() ? 
            "All corequisites are valid" : 
            "Corequisite validation failed with " + result.getValidationErrors().size() + " error(s)");
        
        return result;
    }
    
    /**
     * Validate prerequisite chain for entire program
     */
    public Map<Long, PrerequisiteValidationResult> validateProgramPrerequisites(Long programId) {
        log.info("Validating prerequisites for all subjects in program: {}", programId);
        
        List<Subject> subjects = subjectRepository.findActiveSubjectsByProgramId(programId);
        
        return subjects.stream()
            .collect(Collectors.toMap(
                Subject::getId,
                subject -> validatePrerequisites(subject.getId())
            ));
    }
    
    /**
     * Detect circular dependency in prerequisite chain using DFS
     */
    private boolean detectCircularDependency(Long subjectId, Set<Long> visited, List<Long> recursionStack) {
        visited.add(subjectId);
        recursionStack.add(subjectId);
        
        Subject subject = subjectRepository.findById(subjectId).orElse(null);
        if (subject == null || subject.getPrerequisites() == null) {
            recursionStack.remove(subjectId);
            return false;
        }
        
        List<String> prerequisiteCodes = parsePrerequisiteString(subject.getPrerequisites());
        
        for (String code : prerequisiteCodes) {
            Subject prereqSubject = subjectRepository.findBySubjectCodeAndIsActiveTrue(code)
                .orElse(null);
            
            if (prereqSubject == null) continue;
            
            if (recursionStack.contains(prereqSubject.getId())) {
                // Circular dependency found
                return true;
            }
            
            if (!visited.contains(prereqSubject.getId())) {
                if (detectCircularDependency(prereqSubject.getId(), visited, recursionStack)) {
                    return true;
                }
            }
        }
        
        recursionStack.remove(subjectId);
        return false;
    }
    
    /**
     * Build prerequisite chain as tree structure
     */
    private PrerequisiteValidationResult.PrerequisiteChainDto buildPrerequisiteChain(
            Subject subject, int depth, Set<Long> visited) {
        
        // Prevent infinite recursion
        if (depth > 10 || visited.contains(subject.getId())) {
            return PrerequisiteValidationResult.PrerequisiteChainDto.builder()
                .subjectId(subject.getId())
                .subjectCode(subject.getSubjectCode())
                .subjectName(subject.getSubjectName())
                .depth(depth)
                .prerequisites(new ArrayList<>())
                .build();
        }
        
        visited.add(subject.getId());
        
        List<PrerequisiteValidationResult.PrerequisiteChainDto> childPrereqs = new ArrayList<>();
        
        if (subject.getPrerequisites() != null && !subject.getPrerequisites().isEmpty()) {
            List<String> prerequisiteCodes = parsePrerequisiteString(subject.getPrerequisites());
            
            for (String code : prerequisiteCodes) {
                Subject prereqSubject = subjectRepository.findBySubjectCodeAndIsActiveTrue(code)
                    .orElse(null);
                
                if (prereqSubject != null) {
                    PrerequisiteValidationResult.PrerequisiteChainDto childDto = 
                        buildPrerequisiteChain(prereqSubject, depth + 1, new HashSet<>(visited));
                    childPrereqs.add(childDto);
                }
            }
        }
        
        return PrerequisiteValidationResult.PrerequisiteChainDto.builder()
            .subjectId(subject.getId())
            .subjectCode(subject.getSubjectCode())
            .subjectName(subject.getSubjectName())
            .depth(depth)
            .prerequisites(childPrereqs)
            .build();
    }
    
    /**
     * Parse prerequisite string into list of subject codes
     * Supports formats: "CS101,CS102,CS103" or "CS101;CS102;CS103" or "CS101 CS102 CS103"
     */
    private List<String> parsePrerequisiteString(String prerequisiteString) {
        if (prerequisiteString == null || prerequisiteString.trim().isEmpty()) {
            return new ArrayList<>();
        }
        
        // Replace common delimiters with comma
        String normalized = prerequisiteString
            .replaceAll("[;|\\s]+", ",")  // Replace ; | or spaces with comma
            .trim();
        
        return Arrays.stream(normalized.split(","))
            .map(String::trim)
            .filter(s -> !s.isEmpty())
            .collect(Collectors.toList());
    }
    
    /**
     * Get prerequisite subjects for a given subject
     */
    public List<Subject> getPrerequisiteSubjects(Long subjectId) {
        Subject subject = subjectRepository.findByIdAndIsActiveTrue(subjectId)
            .orElseThrow(() -> new RuntimeException("Subject not found with id: " + subjectId));
        
        if (subject.getPrerequisites() == null || subject.getPrerequisites().isEmpty()) {
            return new ArrayList<>();
        }
        
        List<String> codes = parsePrerequisiteString(subject.getPrerequisites());
        return codes.stream()
            .map(code -> subjectRepository.findBySubjectCodeAndIsActiveTrue(code))
            .filter(Optional::isPresent)
            .map(Optional::get)
            .collect(Collectors.toList());
    }
    
    /**
     * Get subjects that depend on this subject as prerequisite
     */
    public List<Subject> getDependentSubjects(Long subjectId) {
        Subject subject = subjectRepository.findByIdAndIsActiveTrue(subjectId)
            .orElseThrow(() -> new RuntimeException("Subject not found with id: " + subjectId));
        
        // Get all active subjects in same program
        List<Subject> allSubjects = subjectRepository.findActiveSubjectsByProgramId(
            subject.getProgram().getId());
        
        return allSubjects.stream()
            .filter(s -> s.getPrerequisites() != null && 
                    s.getPrerequisites().toUpperCase().contains(subject.getSubjectCode().toUpperCase()))
            .collect(Collectors.toList());
    }
}
