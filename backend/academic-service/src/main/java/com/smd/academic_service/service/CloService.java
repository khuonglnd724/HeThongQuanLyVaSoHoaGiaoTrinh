package com.smd.academic_service.service;

import com.smd.academic_service.model.dto.CloDto;
import com.smd.academic_service.model.entity.Clo;
import com.smd.academic_service.model.entity.Subject;
import com.smd.academic_service.model.entity.Syllabus;
import com.smd.academic_service.repository.CloRepository;
import com.smd.academic_service.repository.SubjectRepository;
import com.smd.academic_service.repository.SyllabusRepository;
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
public class CloService {
    
    private final CloRepository cloRepository;
    private final SubjectRepository subjectRepository;
    private final SyllabusRepository syllabusRepository;
    
    // Create
    public CloDto createClo(CloDto cloDto, String createdBy) {
        log.info("Creating CLO with code: {}", cloDto.getCloCode());
        
        // Resolve subject and syllabus; both can be null (CLO as standalone/reusable resource)
        Subject subject = null;
        if (cloDto.getSubjectId() != null) {
            subject = subjectRepository.findById(cloDto.getSubjectId())
                .orElseThrow(() -> new RuntimeException("Subject not found with id: " + cloDto.getSubjectId()));
        }

        Syllabus syllabus = null;
        if (cloDto.getSyllabusId() != null) {
            syllabus = syllabusRepository.findById(cloDto.getSyllabusId())
                .orElseThrow(() -> new RuntimeException("Syllabus not found with id: " + cloDto.getSyllabusId()));
        }
        
        Clo clo = Clo.builder()
            .cloCode(cloDto.getCloCode())
            .cloName(cloDto.getCloName() != null ? cloDto.getCloName() : cloDto.getCloCode())
            .description(cloDto.getDescription())
            .subject(subject)
            .syllabus(syllabus)
            .bloomLevel(cloDto.getBloomLevel())
            .displayOrder(cloDto.getDisplayOrder() != null ? cloDto.getDisplayOrder() : 0)
            .teachingMethod(cloDto.getTeachingMethod())
            .evaluationMethod(cloDto.getEvaluationMethod())
            .isActive(true)
            .createdBy(createdBy)
            .build();
        
        Clo savedClo = cloRepository.save(clo);
        log.info("CLO created successfully with id: {}", savedClo.getId());
        return mapToDto(savedClo);
    }
    
    // Read
    public CloDto getCloById(Long id) {
        log.debug("Fetching CLO with id: {}", id);
        Clo clo = cloRepository.findByIdAndIsActiveTrue(id)
            .orElseThrow(() -> new RuntimeException("CLO not found with id: " + id));
        return mapToDto(clo);
    }
    
    public List<CloDto> getClosBySubjectId(Long subjectId) {
        log.debug("Fetching CLOs for subject id: {}", subjectId);
        return cloRepository.findActiveClosBySubjectId(subjectId)
            .stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }
    
    public List<CloDto> getClosBySyllabusId(Long syllabusId) {
        log.debug("Fetching CLOs for syllabus id: {}", syllabusId);
        return cloRepository.findActiveClosBySyllabusId(syllabusId)
            .stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }
    
    public List<CloDto> getAllClos() {
        log.debug("Fetching all CLOs");
        return cloRepository.findAll()
            .stream()
            .filter(Clo::getIsActive)
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }

    public List<CloDto> getUnassignedClos() {
        log.debug("Fetching CLOs without subject");
        return cloRepository.findBySubjectIsNullAndIsActiveTrue()
            .stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }

    public CloDto assignCloToSubject(Long cloId, Long subjectId, String updatedBy) {
        log.info("Assigning CLO {} to subject {}", cloId, subjectId);

        Clo clo = cloRepository.findByIdAndIsActiveTrue(cloId)
            .orElseThrow(() -> new RuntimeException("CLO not found with id: " + cloId));

        Subject subject = null;
        if (subjectId != null) {
            subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new RuntimeException("Subject not found with id: " + subjectId));
        }

        clo.setSubject(subject);
        clo.setUpdatedBy(updatedBy);
        Clo saved = cloRepository.save(clo);
        log.info("CLO {} assigned to subject {}", cloId, subjectId);
        return mapToDto(saved);
    }
    
    public List<CloDto> searchClosByCode(String code) {
        log.debug("Searching CLOs with code: {}", code);
        return cloRepository.findByCloCodeContainingIgnoreCase(code)
            .stream()
            .filter(Clo::getIsActive)
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }
    
    // Update
    public CloDto updateClo(Long id, CloDto cloDto, String updatedBy) {
        log.info("Updating CLO with id: {}", id);
        
        Clo clo = cloRepository.findByIdAndIsActiveTrue(id)
            .orElseThrow(() -> new RuntimeException("CLO not found with id: " + id));
        
        if (cloDto.getCloCode() != null) {
            clo.setCloCode(cloDto.getCloCode());
        }
        if (cloDto.getCloName() != null) {
            clo.setCloName(cloDto.getCloName());
        }
        if (cloDto.getDescription() != null) {
            clo.setDescription(cloDto.getDescription());
        }
        if (cloDto.getBloomLevel() != null) {
            clo.setBloomLevel(cloDto.getBloomLevel());
        }
        if (cloDto.getDisplayOrder() != null) {
            clo.setDisplayOrder(cloDto.getDisplayOrder());
        }
        if (cloDto.getTeachingMethod() != null) {
            clo.setTeachingMethod(cloDto.getTeachingMethod());
        }
        if (cloDto.getEvaluationMethod() != null) {
            clo.setEvaluationMethod(cloDto.getEvaluationMethod());
        }
        
        clo.setUpdatedBy(updatedBy);
        Clo updatedClo = cloRepository.save(clo);
        
        log.info("CLO updated successfully with id: {}", id);
        return mapToDto(updatedClo);
    }
    
    // Delete (Soft delete)
    public void deleteClo(Long id, String deletedBy) {
        log.info("Deleting CLO with id: {}", id);
        
        Clo clo = cloRepository.findByIdAndIsActiveTrue(id)
            .orElseThrow(() -> new RuntimeException("CLO not found with id: " + id));
        
        clo.setIsActive(false);
        clo.setUpdatedBy(deletedBy);
        cloRepository.save(clo);
        
        log.info("CLO deleted successfully with id: {}", id);
    }
    
    // Utility
    private CloDto mapToDto(Clo clo) {
        return CloDto.builder()
            .id(clo.getId())
            .cloCode(clo.getCloCode())
            .cloName(clo.getCloName())
            .description(clo.getDescription())
            .subjectId(clo.getSubject() != null ? clo.getSubject().getId() : null)
            .syllabusId(clo.getSyllabus() != null ? clo.getSyllabus().getId() : null)
            .bloomLevel(clo.getBloomLevel())
            .displayOrder(clo.getDisplayOrder())
            .teachingMethod(clo.getTeachingMethod())
            .evaluationMethod(clo.getEvaluationMethod())
            .isActive(clo.getIsActive())
            .createdAt(clo.getCreatedAt())
            .updatedAt(clo.getUpdatedAt())
            .build();
    }
}
