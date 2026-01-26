package com.smd.academic_service.service;

import com.smd.academic_service.model.dto.CloMappingDto;
import com.smd.academic_service.model.entity.Clo;
import com.smd.academic_service.model.entity.CloMapping;
import com.smd.academic_service.model.entity.Plo;
import com.smd.academic_service.repository.CloMappingRepository;
import com.smd.academic_service.repository.CloRepository;
import com.smd.academic_service.repository.PloRepository;
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
public class CloMappingService {
    
    private final CloMappingRepository cloMappingRepository;
    private final CloRepository cloRepository;
    private final PloRepository ploRepository;
    
    // Create Mapping
    @CacheEvict(value = {"clos", "plos", "programs", "subjects"}, allEntries = true)
    public CloMappingDto createMapping(CloMappingDto mappingDto, String createdBy) {
        log.info("Creating mapping between CLO {} and PLO {}", mappingDto.getCloId(), mappingDto.getPloId());
        
        // Check if mapping already exists
        if (cloMappingRepository.findByClosAndPlosId(mappingDto.getCloId(), mappingDto.getPloId()).isPresent()) {
            throw new RuntimeException("Mapping already exists between CLO and PLO");
        }
        
        Clo clo = cloRepository.findById(mappingDto.getCloId())
            .orElseThrow(() -> new RuntimeException("CLO not found with id: " + mappingDto.getCloId()));
        
        Plo plo = ploRepository.findById(mappingDto.getPloId())
            .orElseThrow(() -> new RuntimeException("PLO not found with id: " + mappingDto.getPloId()));
        
        CloMapping mapping = CloMapping.builder()
            .clo(clo)
            .plo(plo)
            .mappingLevel(mappingDto.getMappingLevel())
            .proficiencyLevel(mappingDto.getProficiencyLevel())
            .evidenceMethod(mappingDto.getEvidenceMethod())
            .notes(mappingDto.getNotes())
            .strengthLevel(mappingDto.getStrengthLevel() != null ? mappingDto.getStrengthLevel() : 3)
            .isActive(true)
            .createdBy(createdBy)
            .build();
        
        CloMapping savedMapping = cloMappingRepository.save(mapping);
        log.info("Mapping created successfully with id: {}", savedMapping.getId());
        return mapToDto(savedMapping);
    }
    
    // Read
    public CloMappingDto getMappingById(Long id) {
        log.debug("Fetching mapping with id: {}", id);
        CloMapping mapping = cloMappingRepository.findByIdAndIsActiveTrue(id)
            .orElseThrow(() -> new RuntimeException("Mapping not found with id: " + id));
        return mapToDto(mapping);
    }
    
    public List<CloMappingDto> getMappingsByCloId(Long cloId) {
        log.debug("Fetching mappings for CLO id: {}", cloId);
        return cloMappingRepository.findActiveMappingsByCloId(cloId)
            .stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }
    
    public List<CloMappingDto> getMappingsByPloId(Long ploId) {
        log.debug("Fetching mappings for PLO id: {}", ploId);
        return cloMappingRepository.findActiveMappingsByPloId(ploId)
            .stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }
    
    public List<CloMappingDto> getMappingsByProgramId(Long programId) {
        log.debug("Fetching mappings for program id: {}", programId);
        return cloMappingRepository.findMappingsByProgramId(programId)
            .stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }
    
    public List<CloMappingDto> getAllMappings() {
        log.debug("Fetching all mappings");
        return cloMappingRepository.findAll()
            .stream()
            .filter(CloMapping::getIsActive)
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }
    
    // Update Mapping
    @CacheEvict(value = {"clos", "plos", "programs", "subjects"}, allEntries = true)
    public CloMappingDto updateMapping(Long id, CloMappingDto mappingDto, String updatedBy) {
        log.info("Updating mapping with id: {}", id);
        
        CloMapping mapping = cloMappingRepository.findByIdAndIsActiveTrue(id)
            .orElseThrow(() -> new RuntimeException("Mapping not found with id: " + id));
        
        if (mappingDto.getMappingLevel() != null) {
            mapping.setMappingLevel(mappingDto.getMappingLevel());
        }
        if (mappingDto.getProficiencyLevel() != null) {
            mapping.setProficiencyLevel(mappingDto.getProficiencyLevel());
        }
        if (mappingDto.getEvidenceMethod() != null) {
            mapping.setEvidenceMethod(mappingDto.getEvidenceMethod());
        }
        if (mappingDto.getNotes() != null) {
            mapping.setNotes(mappingDto.getNotes());
        }
        if (mappingDto.getStrengthLevel() != null) {
            mapping.setStrengthLevel(mappingDto.getStrengthLevel());
        }
        
        mapping.setUpdatedBy(updatedBy);
        CloMapping updatedMapping = cloMappingRepository.save(mapping);
        
        log.info("Mapping updated successfully with id: {}", id);
        return mapToDto(updatedMapping);
    }
    
    // Delete Mapping
    @CacheEvict(value = {"clos", "plos", "programs", "subjects"}, allEntries = true)
    public void deleteMapping(Long id, String deletedBy) {
        log.info("Deleting mapping with id: {}", id);
        
        CloMapping mapping = cloMappingRepository.findByIdAndIsActiveTrue(id)
            .orElseThrow(() -> new RuntimeException("Mapping not found with id: " + id));
        
        mapping.setIsActive(false);
        mapping.setUpdatedBy(deletedBy);
        cloMappingRepository.save(mapping);
        
        log.info("Mapping deleted successfully with id: {}", id);
    }
    
    // Utility
    private CloMappingDto mapToDto(CloMapping mapping) {
        return CloMappingDto.builder()
            .id(mapping.getId())
            .cloId(mapping.getClo().getId())
            .ploId(mapping.getPlo().getId())
            .mappingLevel(mapping.getMappingLevel())
            .proficiencyLevel(mapping.getProficiencyLevel())
            .evidenceMethod(mapping.getEvidenceMethod())
            .notes(mapping.getNotes())
            .strengthLevel(mapping.getStrengthLevel())
            .isActive(mapping.getIsActive())
            .createdAt(mapping.getCreatedAt())
            .updatedAt(mapping.getUpdatedAt())
            .build();
    }
}
