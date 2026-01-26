package com.smd.academic_service.service;

import com.smd.academic_service.model.dto.SyllabusDto;
import com.smd.academic_service.model.entity.Subject;
import com.smd.academic_service.model.entity.Syllabus;
import com.smd.academic_service.repository.SubjectRepository;
import com.smd.academic_service.repository.SyllabusRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class SyllabusService {
    
    private final SyllabusRepository syllabusRepository;
    private final SubjectRepository subjectRepository;
    private final SyllabusVersionService syllabusVersionService;
    
    // Create
    @CacheEvict(value = {"syllabi", "subjects", "programs"}, allEntries = true)
    public SyllabusDto createSyllabus(SyllabusDto syllabusDto, String createdBy) {
        log.info("Creating syllabus with code: {}", syllabusDto.getSyllabusCode());
        
        Subject subject = subjectRepository.findById(syllabusDto.getSubjectId())
            .orElseThrow(() -> new com.smd.academic_service.exception.ResourceNotFoundException(
                "Subject not found with id: " + syllabusDto.getSubjectId()));
        
        Syllabus syllabus = Syllabus.builder()
            .syllabusCode(syllabusDto.getSyllabusCode())
            .version(syllabusDto.getVersion() != null ? syllabusDto.getVersion() : 1)
            .academicYear(syllabusDto.getAcademicYear())
            .semester(syllabusDto.getSemester())
            .subject(subject)
            .content(syllabusDto.getContent())
            .learningObjectives(syllabusDto.getLearningObjectives())
            .teachingMethods(syllabusDto.getTeachingMethods())
            .assessmentMethods(syllabusDto.getAssessmentMethods())
            .status(syllabusDto.getStatus() != null ? syllabusDto.getStatus() : "Draft")
            .approvalStatus(syllabusDto.getApprovalStatus() != null ? syllabusDto.getApprovalStatus() : "Pending")
            .isActive(true)
            .createdBy(createdBy)
            .build();
        
        Syllabus savedSyllabus = syllabusRepository.save(syllabus);
        
        // Record in version history
        syllabusVersionService.recordChange(savedSyllabus.getId(), "CREATE", "Syllabus created", createdBy);
        
        log.info("Syllabus created successfully with id: {}", savedSyllabus.getId());
        return mapToDto(savedSyllabus);
    }
    
    // Read
    @Cacheable(value = "syllabi", key = "'academic_id_' + #id")
    public SyllabusDto getSyllabusById(Long id) {
        log.debug("Fetching syllabus with id: {}", id);
        Syllabus syllabus = syllabusRepository.findByIdAndIsActiveTrue(id)
            .orElseThrow(() -> new com.smd.academic_service.exception.ResourceNotFoundException(
                "Syllabus not found with id: " + id));
        return mapToDto(syllabus);
    }
    
    @Cacheable(value = "syllabi", key = "'academic_subject_' + #subjectId")
    public List<SyllabusDto> getSyllabusesBySubjectId(Long subjectId) {
        log.debug("Fetching syllabuses for subject id: {}", subjectId);
        return syllabusRepository.findActiveSyllabusesBySubjectId(subjectId)
            .stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }
    
    public List<SyllabusDto> getSyllabusesByStatus(String status) {
        log.debug("Fetching syllabuses with status: {}", status);
        return syllabusRepository.findSyllabusesByStatus(status)
            .stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }
    
    public List<SyllabusDto> getSyllabusesByApprovalStatus(String approvalStatus) {
        log.debug("Fetching syllabuses with approval status: {}", approvalStatus);
        return syllabusRepository.findSyllabusesByApprovalStatus(approvalStatus)
            .stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }
    
    public List<SyllabusDto> getSyllabusesByProgramId(Long programId) {
        log.debug("Fetching syllabuses for program id: {}", programId);
        return syllabusRepository.findSyllabusesByProgramId(programId)
            .stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }
    
    public List<SyllabusDto> getAllSyllabuses() {
        log.debug("Fetching all syllabuses");
        return syllabusRepository.findAll()
            .stream()
            .filter(Syllabus::getIsActive)
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }
    
    public List<SyllabusDto> getPublishedSyllabuses() {
        log.debug("Fetching published syllabuses");
        return syllabusRepository.findSyllabusesByStatus("Published")
            .stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }
    
    public List<SyllabusDto> getPublishedSyllabusesByProgramName(String programName) {
        log.debug("Fetching published syllabuses for program: {}", programName);
        // Get all published, then filter by programName in DTO
        return syllabusRepository.findSyllabusesByStatus("Published")
            .stream()
            .map(this::mapToDto)
            .filter(dto -> programName.equals(dto.getProgramName()))
            .collect(Collectors.toList());
    }
    
    // Update
    @CacheEvict(value = {"syllabi", "subjects", "programs"}, allEntries = true)
    public SyllabusDto updateSyllabus(Long id, SyllabusDto syllabusDto, String updatedBy) {
        log.info("Updating syllabus with id: {}", id);
        
        Syllabus syllabus = syllabusRepository.findByIdAndIsActiveTrue(id)
            .orElseThrow(() -> new com.smd.academic_service.exception.ResourceNotFoundException(
                "Syllabus not found with id: " + id));
        
        if (syllabusDto.getContent() != null) {
            syllabus.setContent(syllabusDto.getContent());
        }
        if (syllabusDto.getLearningObjectives() != null) {
            syllabus.setLearningObjectives(syllabusDto.getLearningObjectives());
        }
        if (syllabusDto.getTeachingMethods() != null) {
            syllabus.setTeachingMethods(syllabusDto.getTeachingMethods());
        }
        if (syllabusDto.getAssessmentMethods() != null) {
            syllabus.setAssessmentMethods(syllabusDto.getAssessmentMethods());
        }
        if (syllabusDto.getStatus() != null) {
            syllabus.setStatus(syllabusDto.getStatus());
        }
        
        syllabus.setUpdatedBy(updatedBy);
        Syllabus updatedSyllabus = syllabusRepository.save(syllabus);
        
        // Record in version history
        syllabusVersionService.recordChange(id, "UPDATE", "Syllabus updated", updatedBy);
        
        log.info("Syllabus updated successfully with id: {}", id);
        return mapToDto(updatedSyllabus);
    }
    
    // Delete (Soft delete)
    @CacheEvict(value = {"syllabi", "subjects", "programs"}, allEntries = true)
    public void deleteSyllabus(Long id, String deletedBy) {
        log.info("Deleting syllabus with id: {}", id);
        
        Syllabus syllabus = syllabusRepository.findByIdAndIsActiveTrue(id)
            .orElseThrow(() -> new com.smd.academic_service.exception.ResourceNotFoundException(
                "Syllabus not found with id: " + id));
        
        syllabus.setIsActive(false);
        syllabus.setUpdatedBy(deletedBy);
        syllabusRepository.save(syllabus);
        
        // Record in version history
        syllabusVersionService.recordChange(id, "DELETE", "Syllabus deleted", deletedBy);
        
        log.info("Syllabus deleted successfully with id: {}", id);
    }
    
    // Update Approval Status
    @CacheEvict(value = {"syllabi", "subjects", "programs"}, allEntries = true)
    public SyllabusDto updateApprovalStatus(Long id, String approvalStatus, Long approvedBy, String comments, String updatedBy) {
        log.info("Updating approval status of syllabus with id: {} to {}", id, approvalStatus);
        
        Syllabus syllabus = syllabusRepository.findByIdAndIsActiveTrue(id)
            .orElseThrow(() -> new com.smd.academic_service.exception.ResourceNotFoundException(
                "Syllabus not found with id: " + id));
        
        syllabus.setApprovalStatus(approvalStatus);
        syllabus.setApprovedBy(approvedBy);
        syllabus.setApprovalComments(comments);
        if ("Approved".equals(approvalStatus)) {
            syllabus.setStatus("Published");
        } else if ("Rejected".equals(approvalStatus)) {
            syllabus.setStatus("Draft");
        }
        
        syllabus.setUpdatedBy(updatedBy);
        Syllabus updatedSyllabus = syllabusRepository.save(syllabus);
        
        // Record in version history
        String changeType = "Approved".equals(approvalStatus) ? "APPROVE" : "Rejected".equals(approvalStatus) ? "REJECT" : "REVIEW";
        syllabusVersionService.recordChange(id, changeType, "Approval status: " + approvalStatus, updatedBy);
        
        log.info("Syllabus approval status updated successfully with id: {}", id);
        return mapToDto(updatedSyllabus);
    }
    
    // Utility
    private SyllabusDto mapToDto(Syllabus syllabus) {
        return SyllabusDto.builder()
            .id(syllabus.getId())
            .syllabusCode(syllabus.getSyllabusCode())
            .version(syllabus.getVersion())
            .academicYear(syllabus.getAcademicYear())
            .semester(syllabus.getSemester())
            .subjectId(syllabus.getSubject().getId())
            .subjectName(syllabus.getSubject().getSubjectName())
            .subjectCode(syllabus.getSubject().getSubjectCode())
            .programId(syllabus.getSubject().getProgram() != null ? syllabus.getSubject().getProgram().getId() : null)
            .programName(syllabus.getSubject().getProgram() != null ? syllabus.getSubject().getProgram().getProgramName() : null)
            .content(syllabus.getContent())
            .learningObjectives(syllabus.getLearningObjectives())
            .teachingMethods(syllabus.getTeachingMethods())
            .assessmentMethods(syllabus.getAssessmentMethods())
            .status(syllabus.getStatus())
            .approvalStatus(syllabus.getApprovalStatus())
            .approvedBy(syllabus.getApprovedBy())
            .approvalComments(syllabus.getApprovalComments())
            .isActive(syllabus.getIsActive())
            .createdAt(syllabus.getCreatedAt())
            .updatedAt(syllabus.getUpdatedAt())
            .build();
    }
}
