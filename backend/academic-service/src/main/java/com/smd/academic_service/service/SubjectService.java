package com.smd.academic_service.service;

import com.smd.academic_service.model.dto.SubjectDto;
import com.smd.academic_service.model.entity.Program;
import com.smd.academic_service.model.entity.Subject;
import com.smd.academic_service.repository.ProgramRepository;
import com.smd.academic_service.repository.SubjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class SubjectService {
    
    private final SubjectRepository subjectRepository;
    private final ProgramRepository programRepository;
    
    // Create
    public SubjectDto createSubject(SubjectDto subjectDto, String createdBy) {
        log.info("Creating subject with code: {}", subjectDto.getSubjectCode());
        
        Program program = programRepository.findById(subjectDto.getProgramId())
            .orElseThrow(() -> new RuntimeException("Program not found with id: " + subjectDto.getProgramId()));
        
        Subject subject = Subject.builder()
            .subjectCode(subjectDto.getSubjectCode())
            .subjectName(subjectDto.getSubjectName())
            .description(subjectDto.getDescription())
            .program(program)
            .credits(subjectDto.getCredits())
            .semester(subjectDto.getSemester())
            .prerequisites(subjectDto.getPrerequisites())
            .corequisites(subjectDto.getCorequisites())
            .subjectType(subjectDto.getSubjectType())
            .isFoundational(subjectDto.getIsFoundational() != null ? subjectDto.getIsFoundational() : false)
            .isActive(true)
            .createdBy(createdBy)
            .build();
        
        Subject savedSubject = subjectRepository.save(subject);
        log.info("Subject created successfully with id: {}", savedSubject.getId());
        return mapToDto(savedSubject);
    }
    
    // Read
    public SubjectDto getSubjectById(Long id) {
        log.debug("Fetching subject with id: {}", id);
        Subject subject = subjectRepository.findByIdAndIsActiveTrue(id)
            .orElseThrow(() -> new RuntimeException("Subject not found with id: " + id));
        return mapToDto(subject);
    }

    public List<SubjectDto> getSubjectsByProgramId(Long programId) {
        log.debug("Fetching subjects for program id: {}", programId);
        return subjectRepository.findActiveSubjectsByProgramId(programId)
            .stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }

    public List<SubjectDto> getSubjectsByProgramAndSemester(Long programId, Integer semester) {
        log.debug("Fetching subjects for program id: {} and semester: {}", programId, semester);
        return subjectRepository.findSubjectsByProgramAndSemester(programId, semester)
            .stream()
            .filter(Subject::getIsActive)
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }

    public List<SubjectDto> getAllSubjects() {
        log.debug("Fetching all subjects");
        return subjectRepository.findAll()
            .stream()
            .filter(Subject::getIsActive)
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }

    public List<SubjectDto> searchSubjectsByCode(String code) {
        log.debug("Searching subjects with code: {}", code);
        return subjectRepository.findBySubjectCodeContainingIgnoreCase(code)
            .stream()
            .filter(Subject::getIsActive)
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }

    public List<SubjectDto> searchSubjectsByProgramName(String programName) {
        log.debug("Searching subjects for program name: {}", programName);
        return subjectRepository.findSubjectsByProgramName(programName)
            .stream()
            .filter(Subject::getIsActive)
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }
    
    // Update
    public SubjectDto updateSubject(Long id, SubjectDto subjectDto, String updatedBy) {
        log.info("Updating subject with id: {}", id);
        
        Subject subject = subjectRepository.findByIdAndIsActiveTrue(id)
            .orElseThrow(() -> new RuntimeException("Subject not found with id: " + id));
        
        if (subjectDto.getSubjectCode() != null) {
            subject.setSubjectCode(subjectDto.getSubjectCode());
        }
        if (subjectDto.getSubjectName() != null) {
            subject.setSubjectName(subjectDto.getSubjectName());
        }
        if (subjectDto.getDescription() != null) {
            subject.setDescription(subjectDto.getDescription());
        }
        if (subjectDto.getCredits() != null) {
            subject.setCredits(subjectDto.getCredits());
        }
        if (subjectDto.getSemester() != null) {
            subject.setSemester(subjectDto.getSemester());
        }
        if (subjectDto.getPrerequisites() != null) {
            subject.setPrerequisites(subjectDto.getPrerequisites());
        }
        if (subjectDto.getCorequisites() != null) {
            subject.setCorequisites(subjectDto.getCorequisites());
        }
        if (subjectDto.getSubjectType() != null) {
            subject.setSubjectType(subjectDto.getSubjectType());
        }
        if (subjectDto.getIsFoundational() != null) {
            subject.setIsFoundational(subjectDto.getIsFoundational());
        }
        
        subject.setUpdatedBy(updatedBy);
        Subject updatedSubject = subjectRepository.save(subject);
        
        log.info("Subject updated successfully with id: {}", id);
        return mapToDto(updatedSubject);
    }
    
    // Delete (Soft delete)
    public void deleteSubject(Long id, String deletedBy) {
        log.info("Deleting subject with id: {}", id);
        
        Subject subject = subjectRepository.findByIdAndIsActiveTrue(id)
            .orElseThrow(() -> new RuntimeException("Subject not found with id: " + id));
        
        subject.setIsActive(false);
        subject.setUpdatedBy(deletedBy);
        subjectRepository.save(subject);
        
        log.info("Subject deleted successfully with id: {}", id);
    }
    
    // Utility
    private SubjectDto mapToDto(Subject subject) {
        return SubjectDto.builder()
            .id(subject.getId())
            .subjectCode(subject.getSubjectCode())
            .subjectName(subject.getSubjectName())
            .description(subject.getDescription())
            .programId(subject.getProgram().getId())
            .credits(subject.getCredits())
            .semester(subject.getSemester())
            .prerequisites(subject.getPrerequisites())
            .corequisites(subject.getCorequisites())
            .subjectType(subject.getSubjectType())
            .isFoundational(subject.getIsFoundational())
            .isActive(subject.getIsActive())
            .createdAt(subject.getCreatedAt())
            .updatedAt(subject.getUpdatedAt())
            .build();
    }
}
