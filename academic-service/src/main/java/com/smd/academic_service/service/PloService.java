package com.smd.academic_service.service;

import com.smd.academic_service.model.dto.PloDto;
import com.smd.academic_service.model.entity.Plo;
import com.smd.academic_service.model.entity.Program;
import com.smd.academic_service.repository.PloRepository;
import com.smd.academic_service.repository.ProgramRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PloService {
    
    private final PloRepository ploRepository;
    private final ProgramRepository programRepository;
    
    // Create
    public PloDto createPlo(PloDto ploDto, String createdBy) {
        log.info("Creating PLO with code: {}", ploDto.getPloCode());
        
        Program program = programRepository.findById(ploDto.getProgramId())
            .orElseThrow(() -> new RuntimeException("Program not found with id: " + ploDto.getProgramId()));
        
        Plo plo = Plo.builder()
            .ploCode(ploDto.getPloCode())
            .ploName(ploDto.getPloName())
            .description(ploDto.getDescription())
            .program(program)
            .displayOrder(ploDto.getDisplayOrder())
            .ploLevel(ploDto.getPloLevel())
            .assessmentMethod(ploDto.getAssessmentMethod())
            .isActive(true)
            .createdBy(createdBy)
            .build();
        
        Plo savedPlo = ploRepository.save(plo);
        log.info("PLO created successfully with id: {}", savedPlo.getId());
        return mapToDto(savedPlo);
    }
    
    // Read
    public PloDto getPloById(Long id) {
        log.debug("Fetching PLO with id: {}", id);
        Plo plo = ploRepository.findByIdAndIsActiveTrue(id)
            .orElseThrow(() -> new RuntimeException("PLO not found with id: " + id));
        return mapToDto(plo);
    }
    
    public List<PloDto> getPlosByProgramId(Long programId) {
        log.debug("Fetching PLOs for program id: {}", programId);
        return ploRepository.findActivePlosByProgramId(programId)
            .stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }
    
    public List<PloDto> getAllPlos() {
        log.debug("Fetching all PLOs");
        return ploRepository.findAll()
            .stream()
            .filter(Plo::getIsActive)
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }
    
    public List<PloDto> searchPlosByCode(String code) {
        log.debug("Searching PLOs with code: {}", code);
        return ploRepository.findByPloCodeContainingIgnoreCase(code)
            .stream()
            .filter(Plo::getIsActive)
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }
    
    // Update
    public PloDto updatePlo(Long id, PloDto ploDto, String updatedBy) {
        log.info("Updating PLO with id: {}", id);
        
        Plo plo = ploRepository.findByIdAndIsActiveTrue(id)
            .orElseThrow(() -> new RuntimeException("PLO not found with id: " + id));
        
        if (ploDto.getPloCode() != null) {
            plo.setPloCode(ploDto.getPloCode());
        }
        if (ploDto.getPloName() != null) {
            plo.setPloName(ploDto.getPloName());
        }
        if (ploDto.getDescription() != null) {
            plo.setDescription(ploDto.getDescription());
        }
        if (ploDto.getDisplayOrder() != null) {
            plo.setDisplayOrder(ploDto.getDisplayOrder());
        }
        if (ploDto.getPloLevel() != null) {
            plo.setPloLevel(ploDto.getPloLevel());
        }
        if (ploDto.getAssessmentMethod() != null) {
            plo.setAssessmentMethod(ploDto.getAssessmentMethod());
        }
        
        plo.setUpdatedBy(updatedBy);
        Plo updatedPlo = ploRepository.save(plo);
        
        log.info("PLO updated successfully with id: {}", id);
        return mapToDto(updatedPlo);
    }
    
    // Delete (Soft delete)
    public void deletePlo(Long id, String deletedBy) {
        log.info("Deleting PLO with id: {}", id);
        
        Plo plo = ploRepository.findByIdAndIsActiveTrue(id)
            .orElseThrow(() -> new RuntimeException("PLO not found with id: " + id));
        
        plo.setIsActive(false);
        plo.setUpdatedBy(deletedBy);
        ploRepository.save(plo);
        
        log.info("PLO deleted successfully with id: {}", id);
    }
    
    // Utility
    private PloDto mapToDto(Plo plo) {
        return PloDto.builder()
            .id(plo.getId())
            .ploCode(plo.getPloCode())
            .ploName(plo.getPloName())
            .description(plo.getDescription())
            .programId(plo.getProgram().getId())
            .displayOrder(plo.getDisplayOrder())
            .ploLevel(plo.getPloLevel())
            .assessmentMethod(plo.getAssessmentMethod())
            .isActive(plo.getIsActive())
            .createdAt(plo.getCreatedAt())
            .updatedAt(plo.getUpdatedAt())
            .build();
    }
}
