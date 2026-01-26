package com.smd.academic_service.service;

import com.smd.academic_service.model.dto.ProgramDto;
import com.smd.academic_service.model.entity.Program;
import com.smd.academic_service.repository.ProgramRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ProgramService {
    
    private final ProgramRepository programRepository;
    
    // Create
    @CacheEvict(value = "programs", allEntries = true)
    public ProgramDto createProgram(ProgramDto programDto, String createdBy) {
        log.info("Creating program with code: {}", programDto.getProgramCode());
        
        Program program = Objects.requireNonNull(Program.builder()
            .programCode(programDto.getProgramCode())
            .programName(programDto.getProgramName())
            .description(programDto.getDescription())
            .departmentId(programDto.getDepartmentId())
            .creditsRequired(programDto.getCreditsRequired())
            .durationYears(programDto.getDurationYears())
            .degreeType(programDto.getDegreeType())
            .accreditationStatus(programDto.getAccreditationStatus())
            .isActive(true)
            .createdBy(createdBy)
            .build());
        
        Program savedProgram = Objects.requireNonNull(programRepository.save(program));
        log.info("Program created successfully with id: {}", savedProgram.getId());
        return mapToDto(savedProgram);
    }
    
    // Read
    @Cacheable(value = "programs", key = "'id_' + #id")
    public ProgramDto getProgramById(Long id) {
        log.debug("Fetching program with id: {}", id);
        Program program = programRepository.findByIdAndIsActiveTrue(id)
            .orElseThrow(() -> new RuntimeException("Program not found with id: " + id));
        return mapToDto(program);
    }
    
    @Cacheable(value = "programs", key = "'code_' + #code")
    public ProgramDto getProgramByCode(String code) {
        log.debug("Fetching program with code: {}", code);
        Program program = programRepository.findByProgramCodeAndIsActiveTrue(code)
            .orElseThrow(() -> new RuntimeException("Program not found with code: " + code));
        return mapToDto(program);
    }
    
    @Cacheable(value = "programs", key = "'dept_' + #departmentId")
    public List<ProgramDto> getProgramsByDepartmentId(Long departmentId) {
        log.debug("Fetching programs for department id: {}", departmentId);
        return programRepository.findActiveProgramsByDepartment(departmentId)
            .stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }
    
    @Cacheable(value = "programs", key = "'all'")
    public List<ProgramDto> getAllPrograms() {
        log.debug("Fetching all programs");
        return programRepository.findByIsActiveTrueOrderByProgramCode()
            .stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }
    
    @Cacheable(value = "programs", key = "'search_' + #name")
    public List<ProgramDto> searchProgramsByName(String name) {
        log.debug("Searching programs with name: {}", name);
        return programRepository.findByProgramNameContainingIgnoreCase(name)
            .stream()
            .filter(Program::getIsActive)
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }
    
    // Update
    @CacheEvict(value = "programs", allEntries = true)
    public ProgramDto updateProgram(Long id, ProgramDto programDto, String updatedBy) {
        log.info("Updating program with id: {}", id);
        
        Program program = programRepository.findByIdAndIsActiveTrue(id)
            .orElseThrow(() -> new RuntimeException("Program not found with id: " + id));
        
        if (programDto.getProgramCode() != null) {
            program.setProgramCode(programDto.getProgramCode());
        }
        if (programDto.getProgramName() != null) {
            program.setProgramName(programDto.getProgramName());
        }
        if (programDto.getDescription() != null) {
            program.setDescription(programDto.getDescription());
        }
        if (programDto.getCreditsRequired() != null) {
            program.setCreditsRequired(programDto.getCreditsRequired());
        }
        if (programDto.getDurationYears() != null) {
            program.setDurationYears(programDto.getDurationYears());
        }
        if (programDto.getDegreeType() != null) {
            program.setDegreeType(programDto.getDegreeType());
        }
        if (programDto.getAccreditationStatus() != null) {
            program.setAccreditationStatus(programDto.getAccreditationStatus());
        }
        
        program.setUpdatedBy(updatedBy);
        Program updatedProgram = programRepository.save(program);
        
        log.info("Program updated successfully with id: {}", id);
        return mapToDto(updatedProgram);
    }
    
    // Delete (Soft delete)
    @CacheEvict(value = "programs", allEntries = true)
    public void deleteProgram(Long id, String deletedBy) {
        log.info("Deleting program with id: {}", id);
        
        Program program = programRepository.findByIdAndIsActiveTrue(id)
            .orElseThrow(() -> new RuntimeException("Program not found with id: " + id));
        
        program.setIsActive(false);
        program.setUpdatedBy(deletedBy);
        programRepository.save(program);
        
        log.info("Program deleted successfully with id: {}", id);
    }
    
    // Utility
    private ProgramDto mapToDto(Program program) {
        return ProgramDto.builder()
            .id(program.getId())
            .programCode(program.getProgramCode())
            .programName(program.getProgramName())
            .description(program.getDescription())
            .departmentId(program.getDepartmentId())
            .creditsRequired(program.getCreditsRequired())
            .durationYears(program.getDurationYears())
            .degreeType(program.getDegreeType())
            .accreditationStatus(program.getAccreditationStatus())
            .isActive(program.getIsActive())
            .createdAt(program.getCreatedAt())
            .updatedAt(program.getUpdatedAt())
            .build();
    }
}
