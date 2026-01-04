package com.smd.academic_service.service;

import com.smd.academic_service.model.dto.SyllabusVersionComparisonDto;
import com.smd.academic_service.model.dto.SyllabusVersionDto;
import com.smd.academic_service.model.entity.Syllabus;
import com.smd.academic_service.model.entity.SyllabusAudit;
import com.smd.academic_service.repository.SyllabusAuditRepository;
import com.smd.academic_service.repository.SyllabusRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service để quản lý version history và comparison của Syllabus
 * Tracks changes, maintains audit trail, và provides version comparison
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SyllabusVersionService {
    
    private final SyllabusAuditRepository syllabusAuditRepository;
    private final SyllabusRepository syllabusRepository;
    
    /**
     * Record a change to syllabus in audit trail
     * Called automatically when syllabus is created/updated/approved/rejected
     */
    @Transactional
    public SyllabusAudit recordChange(Long syllabusId, String changeType, String changeDescription, String changedBy) {
        log.info("Recording change for syllabus id: {} - Change type: {}", syllabusId, changeType);
        
        Syllabus syllabus = syllabusRepository.findByIdAndIsActiveTrue(syllabusId)
            .orElseThrow(() -> new RuntimeException("Syllabus not found with id: " + syllabusId));
        
        // Get version number (latest + 1)
        long versionCount = syllabusAuditRepository.countBySyllabusId(syllabusId);
        int newVersionNumber = (int) (versionCount + 1);
        
        SyllabusAudit audit = SyllabusAudit.builder()
            .syllabusId(syllabusId)
            .versionNumber(newVersionNumber)
            .content(syllabus.getContent())
            .learningObjectives(syllabus.getLearningObjectives())
            .teachingMethods(syllabus.getTeachingMethods())
            .assessmentMethods(syllabus.getAssessmentMethods())
            .academicYear(syllabus.getAcademicYear())
            .semester(syllabus.getSemester())
            .status(syllabus.getStatus())
            .approvalStatus(syllabus.getApprovalStatus())
            .changeType(changeType)
            .changeDescription(changeDescription)
            .changedBy(changedBy)
            .build();
        
        SyllabusAudit savedAudit = syllabusAuditRepository.save(audit);
        log.info("Change recorded successfully - Version: {}", newVersionNumber);
        
        return savedAudit;
    }
    
    /**
     * Get version history for a syllabus
     */
    @Transactional(readOnly = true)
    public List<SyllabusVersionDto> getVersionHistory(Long syllabusId) {
        log.debug("Fetching version history for syllabus id: {}", syllabusId);
        
        // Verify syllabus exists
        syllabusRepository.findByIdAndIsActiveTrue(syllabusId)
            .orElseThrow(() -> new RuntimeException("Syllabus not found with id: " + syllabusId));
        
        return syllabusAuditRepository.findBySyllabusIdOrderByVersionNumberDesc(syllabusId)
            .stream()
            .map(this::mapToVersionDto)
            .collect(Collectors.toList());
    }
    
    /**
     * Get specific version of syllabus
     */
    @Transactional(readOnly = true)
    public SyllabusVersionDto getVersion(Long syllabusId, Integer versionNumber) {
        log.debug("Fetching version {} for syllabus id: {}", versionNumber, syllabusId);
        
        SyllabusAudit audit = syllabusAuditRepository.findBySyllabusIdAndVersionNumber(syllabusId, versionNumber)
            .orElseThrow(() -> new RuntimeException("Version not found - Syllabus: " + syllabusId + ", Version: " + versionNumber));
        
        return mapToVersionDto(audit);
    }
    
    /**
     * Get latest version of syllabus
     */
    @Transactional(readOnly = true)
    public SyllabusVersionDto getLatestVersion(Long syllabusId) {
        log.debug("Fetching latest version for syllabus id: {}", syllabusId);
        
        SyllabusAudit audit = syllabusAuditRepository.findLatestAuditBySyllabusId(syllabusId)
            .orElseThrow(() -> new RuntimeException("No version history found for syllabus: " + syllabusId));
        
        return mapToVersionDto(audit);
    }
    
    /**
     * Compare two versions of syllabus
     */
    @Transactional(readOnly = true)
    public SyllabusVersionComparisonDto compareVersions(Long syllabusId, Integer version1, Integer version2) {
        log.info("Comparing versions {} and {} for syllabus id: {}", version1, version2, syllabusId);
        
        // Verify syllabus exists
        Syllabus syllabus = syllabusRepository.findByIdAndIsActiveTrue(syllabusId)
            .orElseThrow(() -> new RuntimeException("Syllabus not found with id: " + syllabusId));
        
        // Get both versions
        SyllabusAudit audit1 = syllabusAuditRepository.findBySyllabusIdAndVersionNumber(syllabusId, version1)
            .orElseThrow(() -> new RuntimeException("Version " + version1 + " not found"));
        
        SyllabusAudit audit2 = syllabusAuditRepository.findBySyllabusIdAndVersionNumber(syllabusId, version2)
            .orElseThrow(() -> new RuntimeException("Version " + version2 + " not found"));
        
        // Ensure version1 < version2 for comparison
        if (version1 > version2) {
            SyllabusAudit temp = audit1;
            audit1 = audit2;
            audit2 = temp;
        }
        
        SyllabusVersionComparisonDto comparison = SyllabusVersionComparisonDto.builder()
            .syllabusId(syllabusId)
            .syllabusCode(syllabus.getSyllabusCode())
            .version1(version1)
            .version2(version2)
            .differences(new ArrayList<>())
            .hasDifferences(false)
            .build();
        
        // Compare fields
        compareField("Content", "Course Content", audit1.getContent(), audit2.getContent(), comparison);
        compareField("Learning Objectives", "Learning Objectives", audit1.getLearningObjectives(), audit2.getLearningObjectives(), comparison);
        compareField("Teaching Methods", "Teaching Methods", audit1.getTeachingMethods(), audit2.getTeachingMethods(), comparison);
        compareField("Assessment Methods", "Assessment Methods", audit1.getAssessmentMethods(), audit2.getAssessmentMethods(), comparison);
        compareField("Academic Year", "Academic Year", audit1.getAcademicYear(), audit2.getAcademicYear(), comparison);
        compareField("Semester", "Semester", String.valueOf(audit1.getSemester()), String.valueOf(audit2.getSemester()), comparison);
        compareField("Status", "Status", audit1.getStatus(), audit2.getStatus(), comparison);
        compareField("Approval Status", "Approval Status", audit1.getApprovalStatus(), audit2.getApprovalStatus(), comparison);
        
        // Set hasDifferences flag
        comparison.setHasDifferences(!comparison.getDifferences().isEmpty());
        
        return comparison;
    }
    
    /**
     * Get version history between two specific versions
     */
    @Transactional(readOnly = true)
    public List<SyllabusVersionDto> getVersionsBetween(Long syllabusId, Integer startVersion, Integer endVersion) {
        log.debug("Fetching versions between {} and {} for syllabus id: {}", startVersion, endVersion, syllabusId);
        
        return syllabusAuditRepository.findAuditBetweenVersions(syllabusId, startVersion, endVersion)
            .stream()
            .map(this::mapToVersionDto)
            .collect(Collectors.toList());
    }
    
    /**
     * Get count of total versions for a syllabus
     */
    @Transactional(readOnly = true)
    public long getVersionCount(Long syllabusId) {
        return syllabusAuditRepository.countBySyllabusId(syllabusId);
    }
    
    /**
     * Helper method to compare individual fields
     */
    private void compareField(String fieldName, String fieldLabel, String value1, String value2, 
                             SyllabusVersionComparisonDto comparison) {
        boolean isDifferent = !normalizeValue(value1).equals(normalizeValue(value2));
        
        if (isDifferent) {
            comparison.getDifferences().add(
                SyllabusVersionComparisonDto.ComparisonField.builder()
                    .fieldName(fieldName)
                    .fieldLabel(fieldLabel)
                    .value1(value1 != null ? value1 : "(empty)")
                    .value2(value2 != null ? value2 : "(empty)")
                    .isDifferent(true)
                    .build()
            );
        }
    }
    
    /**
     * Normalize values for comparison (handle null/empty)
     */
    private String normalizeValue(String value) {
        return value == null || value.trim().isEmpty() ? "" : value.trim();
    }
    
    /**
     * Map SyllabusAudit entity to DTO
     */
    private SyllabusVersionDto mapToVersionDto(SyllabusAudit audit) {
        return SyllabusVersionDto.builder()
            .auditId(audit.getId())
            .syllabusId(audit.getSyllabusId())
            .versionNumber(audit.getVersionNumber())
            .changeType(audit.getChangeType())
            .changeDescription(audit.getChangeDescription())
            .changedBy(audit.getChangedBy())
            .createdAt(audit.getCreatedAt())
            .status(audit.getStatus())
            .approvalStatus(audit.getApprovalStatus())
            .academicYear(audit.getAcademicYear())
            .semester(audit.getSemester())
            .build();
    }
}
