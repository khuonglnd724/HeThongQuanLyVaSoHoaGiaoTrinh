package com.smd.public_service.service;

import com.smd.public_service.dto.SearchResponse;
import com.smd.public_service.dto.SyllabusSummary;
import com.smd.public_service.model.entity.Syllabus;
import com.smd.public_service.model.entity.Subject;
import com.smd.public_service.repository.SyllabusRepository;
import com.smd.public_service.repository.SubjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

/**
 * SyllabusSearchService - Xử lý tìm kiếm giáo trình
 * Hỗ trợ full-text search, filter theo Tên/Mã môn học, Chuyên ngành/Học kỳ
 */
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
@Slf4j
public class SyllabusSearchService {
    
    private final SyllabusRepository syllabusRepository;
    private final SubjectRepository subjectRepository;
    
    /**
     * Tìm kiếm giáo trình với các tiêu chí
     */
    public SearchResponse search(
            String query,
            String subjectCode,
            String majorName,
            Integer semester,
            Integer year,
            String version,
            String sort,
            int page,
            int size,
            boolean fuzzy,
            boolean highlight) {
        
        Pageable pageable = PageRequest.of(page - 1, size);
        Page<Syllabus> resultPage;
        
        // Nếu có query (simple search - không dùng fullText vì H2 không hỗ trợ)
        if (query != null && !query.trim().isEmpty()) {
            resultPage = syllabusRepository.searchBySimpleQuery(query.trim(), pageable);
        } else if (subjectCode != null && !subjectCode.isEmpty()) {
            // Search by subject code
            resultPage = syllabusRepository.findBySubjectCodeSimple(subjectCode, pageable);
        } else {
            // Return all approved syllabi
            resultPage = syllabusRepository.findByStatus("APPROVED", pageable);
        }
        
        // Convert to DTO
        List<SyllabusSummary> results = resultPage.getContent().stream()
                .map(this::convertToSummary)
                .collect(Collectors.toList());
        
        return new SearchResponse(resultPage.getTotalElements(), page, size, results);
    }
    
    /**
     * Tìm kiếm theo môn học
     */
    public SearchResponse searchBySubject(String subjectCode, int page, int size) {
        Subject subject = subjectRepository.findBySubjectCode(subjectCode)
                .orElseThrow(() -> new RuntimeException("Subject not found: " + subjectCode));
        
        Pageable pageable = PageRequest.of(page - 1, size);
        Page<Syllabus> resultPage = syllabusRepository.findBySubjectId(subject.getId(), pageable);
        
        List<SyllabusSummary> results = resultPage.getContent().stream()
                .map(this::convertToSummary)
                .collect(Collectors.toList());
        
        return new SearchResponse(resultPage.getTotalElements(), page, size, results);
    }
    
    /**
     * Tìm kiếm theo học kỳ và năm học
     */
    public SearchResponse searchBySemesterAndYear(String academicYear, Integer semester, int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size);
        Page<Syllabus> resultPage = syllabusRepository.findByAcademicYearAndSemester(academicYear, semester, pageable);
        
        List<SyllabusSummary> results = resultPage.getContent().stream()
                .map(this::convertToSummary)
                .collect(Collectors.toList());
        
        return new SearchResponse(resultPage.getTotalElements(), page, size, results);
    }
    
    /**
     * Convert Syllabus entity to SyllabusSummary DTO
     */
    private SyllabusSummary convertToSummary(Syllabus syllabus) {
        SyllabusSummary summary = new SyllabusSummary();
        summary.setId(syllabus.getId());
        summary.setTitle(syllabus.getSubject().getSubjectName());
        summary.setCode(syllabus.getSubject().getSubjectCode());
        summary.setMajor("TBD");  // TODO: Get from program
        summary.setSemester(String.valueOf(syllabus.getSemester()));
        summary.setVersion(String.valueOf(syllabus.getVersion()));
        summary.setUpdatedAt(syllabus.getUpdatedAt().format(DateTimeFormatter.ISO_DATE_TIME));
        summary.setSnippet(extractSnippet(syllabus.getContent(), 150));
        summary.setDetailUrl("/api/public/syllabi/" + syllabus.getId());
        
        return summary;
    }
    
    /**
     * Extract snippet from content
     */
    private String extractSnippet(String content, int length) {
        if (content == null || content.isEmpty()) {
            return "";
        }
        if (content.length() <= length) {
            return content;
        }
        return content.substring(0, length) + "...";
    }
    
    /**
     * Get syllabus by ID
     */
    public Syllabus getSyllabusById(Long id) {
        return syllabusRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Syllabus not found: " + id));
    }
    
    /**
     * Get all versions of a subject
     */
    public List<Syllabus> getAllVersionsBySubject(Long subjectId) {
        return syllabusRepository.findBySubjectId(subjectId);
    }
    
    /**
     * Get specific version of a subject
     */
    public Syllabus getVersionBySubject(Long subjectId, Integer version) {
        List<Syllabus> syllabi = syllabusRepository.findBySubjectIdAndVersion(subjectId, version);
        if (syllabi.isEmpty()) {
            throw new RuntimeException("Syllabus version not found for subject: " + subjectId + ", version: " + version);
        }
        return syllabi.get(0);
    }
}
