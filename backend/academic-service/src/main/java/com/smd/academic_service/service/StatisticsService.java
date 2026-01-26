package com.smd.academic_service.service;

import com.smd.academic_service.model.dto.StatisticsDto;
import com.smd.academic_service.model.entity.*;
import com.smd.academic_service.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Service để tính toán thống kê độ phủ CLO-PLO tại các cấp độ khác nhau
 * - Program level: % CLO/PLO coverage cho toàn chương trình
 * - Subject level: % CLO/PLO coverage cho từng môn học
 * - Department level: Thống kê toàn Khoa
 * - System level: Thống kê toàn hệ thống
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class StatisticsService {
    
    private final ProgramRepository programRepository;
    private final SubjectRepository subjectRepository;
    private final CloRepository cloRepository;
    private final CloMappingRepository cloMappingRepository;
    private final PloRepository ploRepository;
    private final SyllabusRepository syllabusRepository;
    
    /**
     * Lấy thống kê CLO-PLO coverage cho một Chương trình
     */
    public StatisticsDto.ProgramStatistics getProgramStatistics(Long programId) {
        log.debug("Calculating statistics for program: {}", programId);
        
        Program program = programRepository.findById(programId)
            .orElseThrow(() -> new com.smd.academic_service.exception.ResourceNotFoundException(
                "Program not found with id: " + programId));
        
        // Get all subjects in program
        List<Subject> subjects = subjectRepository.findAll().stream()
            .filter(s -> s.getProgram().getId().equals(programId) && s.getIsActive())
            .collect(Collectors.toList());
        
        // Get all CLOs in program
        List<Clo> allClos = cloRepository.findAll().stream()
            .filter(c -> subjects.stream().anyMatch(s -> s.getId().equals(c.getSubject().getId())) && c.getIsActive())
            .collect(Collectors.toList());
        
        // Get all PLOs for program
        List<Plo> plos = ploRepository.findAll().stream()
            .filter(p -> p.getProgram().getId().equals(programId) && p.getIsActive())
            .collect(Collectors.toList());
        
        // Get mappings
        List<CloMapping> mappings = cloMappingRepository.findMappingsByProgramId(programId);
        
        // Calculate coverage
        Set<Long> mappedClos = mappings.stream()
            .map(m -> m.getClo().getId())
            .collect(Collectors.toSet());
        
        Set<Long> mappedPlos = mappings.stream()
            .map(m -> m.getPlo().getId())
            .collect(Collectors.toSet());
        
        double cloCoverage = allClos.isEmpty() ? 0 : (double) mappedClos.size() / allClos.size() * 100;
        double ploCoverage = plos.isEmpty() ? 0 : (double) mappedPlos.size() / plos.size() * 100;
        
        return StatisticsDto.ProgramStatistics.builder()
            .programId(programId)
            .programCode(program.getProgramCode())
            .programName(program.getProgramName())
            .totalSubjects(subjects.size())
            .totalClos(allClos.size())
            .mappedClos(mappedClos.size())
            .cloCoveragePercentage((int) cloCoverage)
            .totalPlos(plos.size())
            .mappedPlos(mappedPlos.size())
            .ploCoveragePercentage((int) ploCoverage)
            .totalMappings(mappings.size())
            .build();
    }
    
    /**
     * Lấy thống kê CLO-PLO coverage cho một Môn học
     */
    public StatisticsDto.SubjectStatistics getSubjectStatistics(Long subjectId) {
        log.debug("Calculating statistics for subject: {}", subjectId);
        
        Subject subject = subjectRepository.findById(subjectId)
            .orElseThrow(() -> new com.smd.academic_service.exception.ResourceNotFoundException(
                "Subject not found with id: " + subjectId));
        
        // Get all CLOs for this subject
        List<Clo> clos = cloRepository.findActiveClosBySubjectId(subjectId);
        
        // Get program PLOs
        Program program = subject.getProgram();
        List<Plo> plos = ploRepository.findAll().stream()
            .filter(p -> p.getProgram().getId().equals(program.getId()) && p.getIsActive())
            .collect(Collectors.toList());
        
        // Get mappings
        List<CloMapping> mappings = cloMappingRepository.findMappingsByProgramId(program.getId()).stream()
            .filter(m -> clos.stream().anyMatch(c -> c.getId().equals(m.getClo().getId())))
            .collect(Collectors.toList());
        
        Set<Long> mappedClos = mappings.stream()
            .map(m -> m.getClo().getId())
            .collect(Collectors.toSet());
        
        Set<Long> mappedPlos = mappings.stream()
            .map(m -> m.getPlo().getId())
            .collect(Collectors.toSet());
        
        double cloCoverage = clos.isEmpty() ? 0 : (double) mappedClos.size() / clos.size() * 100;
        double ploCoverage = plos.isEmpty() ? 0 : (double) mappedPlos.size() / plos.size() * 100;
        
        // Get syllabuses count
        long approvedSyllabuses = syllabusRepository.findAll().stream()
            .filter(s -> s.getSubject().getId().equals(subjectId) && "APPROVED".equals(s.getApprovalStatus()))
            .count();
        
        return StatisticsDto.SubjectStatistics.builder()
            .subjectId(subjectId)
            .subjectCode(subject.getSubjectCode())
            .subjectName(subject.getSubjectName())
            .totalClos(clos.size())
            .mappedClos(mappedClos.size())
            .cloCoveragePercentage((int) cloCoverage)
            .totalPlos(plos.size())
            .mappedPlos(mappedPlos.size())
            .ploCoveragePercentage((int) ploCoverage)
            .totalMappings(mappings.size())
            .totalSyllabuses((int) approvedSyllabuses)
            .build();
    }
    
    /**
     * Lấy thống kê CLO-PLO coverage cho toàn Khoa
     */
    public StatisticsDto.DepartmentStatistics getDepartmentStatistics() {
        log.debug("Calculating system-wide statistics");
        
        // Get all active subjects
        List<Subject> allSubjects = subjectRepository.findAll().stream()
            .filter(Subject::getIsActive)
            .collect(Collectors.toList());
        
        // Get all active CLOs
        List<Clo> allClos = cloRepository.findAll().stream()
            .filter(Clo::getIsActive)
            .collect(Collectors.toList());
        
        // Get all active PLOs
        List<Plo> allPlos = ploRepository.findAll().stream()
            .filter(Plo::getIsActive)
            .collect(Collectors.toList());
        
        // Get all mappings
        List<CloMapping> allMappings = cloMappingRepository.findAll();
        
        Set<Long> mappedClos = allMappings.stream()
            .map(m -> m.getClo().getId())
            .collect(Collectors.toSet());
        
        Set<Long> mappedPlos = allMappings.stream()
            .map(m -> m.getPlo().getId())
            .collect(Collectors.toSet());
        
        double cloCoverage = allClos.isEmpty() ? 0 : (double) mappedClos.size() / allClos.size() * 100;
        double ploCoverage = allPlos.isEmpty() ? 0 : (double) mappedPlos.size() / allPlos.size() * 100;
        
        // Get syllabuses count
        long totalSyllabuses = syllabusRepository.findAll().stream()
            .filter(Syllabus::getIsActive)
            .count();
        
        long approvedSyllabuses = syllabusRepository.findAll().stream()
            .filter(s -> s.getIsActive() && "APPROVED".equals(s.getApprovalStatus()))
            .count();
        
        long pendingSyllabuses = syllabusRepository.findAll().stream()
            .filter(s -> s.getIsActive() && ("L1_PENDING".equals(s.getApprovalStatus()) || "L2_PENDING".equals(s.getApprovalStatus())))
            .count();
        
        return StatisticsDto.DepartmentStatistics.builder()
            .totalPrograms(programRepository.findAll().size())
            .totalSubjects(allSubjects.size())
            .totalClos(allClos.size())
            .mappedClos(mappedClos.size())
            .cloCoveragePercentage((int) cloCoverage)
            .totalPlos(allPlos.size())
            .mappedPlos(mappedPlos.size())
            .ploCoveragePercentage((int) ploCoverage)
            .totalMappings(allMappings.size())
            .totalSyllabuses((int) totalSyllabuses)
            .approvedSyllabuses((int) approvedSyllabuses)
            .pendingSyllabuses((int) pendingSyllabuses)
            .rejectedSyllabuses((int) (totalSyllabuses - approvedSyllabuses - pendingSyllabuses))
            .build();
    }
    
    /**
     * Lấy danh sách các Program với coverage rate
     */
    public List<StatisticsDto.ProgramStatistics> getAllProgramsStatistics() {
        log.debug("Fetching statistics for all programs");
        
        return programRepository.findAll().stream()
            .map(p -> getProgramStatistics(p.getId()))
            .collect(Collectors.toList());
    }
    
    /**
     * Lấy danh sách các Subject với coverage rate
     */
    public List<StatisticsDto.SubjectStatistics> getAllSubjectsStatistics() {
        log.debug("Fetching statistics for all subjects");
        
        return subjectRepository.findAll().stream()
            .filter(Subject::getIsActive)
            .map(s -> getSubjectStatistics(s.getId()))
            .collect(Collectors.toList());
    }
    
    /**
     * Lấy danh sách Programs theo thứ tự độ phủ CLO/PLO (từ cao xuống thấp)
     */
    public List<StatisticsDto.ProgramStatistics> getProgramsRankedByCoverage() {
        log.debug("Ranking programs by CLO coverage");
        
        return getAllProgramsStatistics().stream()
            .sorted((a, b) -> Integer.compare(b.getCloCoveragePercentage(), a.getCloCoveragePercentage()))
            .collect(Collectors.toList());
    }
    
    /**
     * Lấy danh sách Subjects theo thứ tự độ phủ CLO/PLO (từ cao xuống thấp)
     */
    public List<StatisticsDto.SubjectStatistics> getSubjectsRankedByCoverage() {
        log.debug("Ranking subjects by CLO coverage");
        
        return getAllSubjectsStatistics().stream()
            .sorted((a, b) -> Integer.compare(b.getCloCoveragePercentage(), a.getCloCoveragePercentage()))
            .collect(Collectors.toList());
    }
    
    /**
     * Lấy các Subjects/Programs có coverage thấp (< minCoverage)
     */
    public List<StatisticsDto.SubjectStatistics> getLowCoverageSubjects(int minCoverage) {
        log.debug("Fetching subjects with coverage below: {}%", minCoverage);
        
        return getAllSubjectsStatistics().stream()
            .filter(s -> s.getCloCoveragePercentage() < minCoverage)
            .sorted(Comparator.comparing(StatisticsDto.SubjectStatistics::getCloCoveragePercentage))
            .collect(Collectors.toList());
    }
}
