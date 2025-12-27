package com.smd.academic_service.service;

import com.smd.academic_service.model.dto.DashboardStatsDto;
import com.smd.academic_service.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class DashboardService {
    
    private final ProgramRepository programRepository;
    private final PloRepository ploRepository;
    private final CloRepository cloRepository;
    private final SubjectRepository subjectRepository;
    private final SyllabusRepository syllabusRepository;
    private final CloMappingRepository cloMappingRepository;
    
    /**
     * Lấy thống kê Dashboard cho một chương trình
     */
    public DashboardStatsDto getDashboardStats(Long programId) {
        log.debug("Generating dashboard stats for program id: {}", programId);
        
        // Verify program exists
        programRepository.findById(programId)
            .orElseThrow(() -> new RuntimeException("Program not found with id: " + programId));
        
        // Count PLOs
        long totalPlos = ploRepository.countByProgramIdAndIsActiveTrue(programId);
        
        // Count CLOs
        var subjects = subjectRepository.findActiveSubjectsByProgramId(programId);
        long totalClos = subjects.stream()
            .mapToLong(s -> cloRepository.countBySubjectIdAndIsActiveTrue(s.getId()))
            .sum();
        
        // Count mapped CLOs
        var allMappings = cloMappingRepository.findMappingsByProgramId(programId);
        long mappedClos = allMappings.stream()
            .map(m -> m.getClo().getId())
            .distinct()
            .count();
        
        long unmappedClos = totalClos - mappedClos;
        
        // Calculate coverage percentage
        int coveragePercentage = totalClos > 0 ? (int) ((mappedClos * 100) / totalClos) : 0;
        
        // Count covered PLOs
        long fullyMappedPlos = allMappings.stream()
            .map(m -> m.getPlo().getId())
            .distinct()
            .count();
        
        long partiallyCoveredPlos = 0;  // Can be calculated based on mapping strength
        long uncoveredPlos = totalPlos - fullyMappedPlos;
        
        // Count subjects and syllabuses
        long totalSubjects = subjectRepository.countByProgramIdAndIsActiveTrue(programId);
        long subjectsWithClo = subjects.stream()
            .filter(s -> cloRepository.countBySubjectIdAndIsActiveTrue(s.getId()) > 0)
            .count();
        
        var syllabuses = syllabusRepository.findSyllabusesByProgramId(programId);
        long totalSyllabuses = syllabuses.size();
        long syllabusesApproved = syllabuses.stream()
            .filter(s -> "Approved".equals(s.getApprovalStatus()))
            .count();
        long syllabusesUnderReview = syllabuses.stream()
            .filter(s -> "Pending".equals(s.getApprovalStatus()))
            .count();
        long syllabusesRejected = syllabuses.stream()
            .filter(s -> "Rejected".equals(s.getApprovalStatus()))
            .count();
        
        return DashboardStatsDto.builder()
            .programId(programId)
            .totalPloCoveragePercentage(coveragePercentage)
            .totalClos((int) totalClos)
            .mappedClos((int) mappedClos)
            .unmappedClos((int) unmappedClos)
            .totalPlos((int) totalPlos)
            .fullyCoveredPlos((int) fullyMappedPlos)
            .partiallyCoveredPlos((int) partiallyCoveredPlos)
            .uncoveredPlos((int) uncoveredPlos)
            .totalSubjects((int) totalSubjects)
            .subjectsWithClo((int) subjectsWithClo)
            .totalSyllabuses((int) totalSyllabuses)
            .syllabusesApproved((int) syllabusesApproved)
            .syllabusesUnderReview((int) syllabusesUnderReview)
            .syllabusesRejected((int) syllabusesRejected)
            .build();
    }
}
