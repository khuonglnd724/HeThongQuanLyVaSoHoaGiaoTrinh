package com.smd.academic_service.service;

import com.smd.academic_service.model.entity.Syllabus;
import com.smd.academic_service.repository.SyllabusRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service để tìm kiếm, lọc và tra cứu các Giáo trình
 * Hỗ trợ các bộ lọc: mã giáo trình, năm học, kì học, chương trình, trạng thái, v.v.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class SyllabusSearchService {
    
    private final SyllabusRepository syllabusRepository;
    
    /**
     * Tìm kiếm giáo trình theo mã hoặc tên môn học
     */
    public Page<Syllabus> searchBySyllabusCodeOrSubjectName(String keyword, Pageable pageable) {
        log.debug("Searching syllabuses with keyword: {}", keyword);
        
        List<Syllabus> allSyllabuses = syllabusRepository.findAll().stream()
            .filter(Syllabus::getIsActive)
            .filter(s -> s.getSyllabusCode().toLowerCase().contains(keyword.toLowerCase()) ||
                        s.getSubject().getSubjectName().toLowerCase().contains(keyword.toLowerCase()))
            .collect(Collectors.toList());
        
        return createPageFromList(allSyllabuses, pageable);
    }
    
    /**
     * Lọc giáo trình theo năm học
     */
    public Page<Syllabus> filterByAcademicYear(String academicYear, Pageable pageable) {
        log.debug("Filtering syllabuses by academic year: {}", academicYear);
        
        List<Syllabus> syllabuses = syllabusRepository.findAll().stream()
            .filter(Syllabus::getIsActive)
            .filter(s -> academicYear.equals(s.getAcademicYear()))
            .collect(Collectors.toList());
        
        return createPageFromList(syllabuses, pageable);
    }
    
    /**
     * Lọc giáo trình theo kì học
     */
    public Page<Syllabus> filterBySemester(Integer semester, Pageable pageable) {
        log.debug("Filtering syllabuses by semester: {}", semester);
        
        List<Syllabus> syllabuses = syllabusRepository.findAll().stream()
            .filter(Syllabus::getIsActive)
            .filter(s -> semester.equals(s.getSemester()))
            .collect(Collectors.toList());
        
        return createPageFromList(syllabuses, pageable);
    }
    
    /**
     * Lọc giáo trình theo trạng thái
     */
    public Page<Syllabus> filterByStatus(String status, Pageable pageable) {
        log.debug("Filtering syllabuses by status: {}", status);
        
        List<Syllabus> syllabuses = syllabusRepository.findSyllabusesByStatus(status).stream()
            .filter(Syllabus::getIsActive)
            .collect(Collectors.toList());
        
        return createPageFromList(syllabuses, pageable);
    }
    
    /**
     * Lọc giáo trình theo trạng thái phê duyệt
     */
    public Page<Syllabus> filterByApprovalStatus(String approvalStatus, Pageable pageable) {
        log.debug("Filtering syllabuses by approval status: {}", approvalStatus);
        
        List<Syllabus> syllabuses = syllabusRepository.findSyllabusesByApprovalStatus(approvalStatus).stream()
            .filter(Syllabus::getIsActive)
            .collect(Collectors.toList());
        
        return createPageFromList(syllabuses, pageable);
    }
    
    /**
     * Lọc giáo trình theo chương trình
     */
    public Page<Syllabus> filterByProgram(Long programId, Pageable pageable) {
        log.debug("Filtering syllabuses by program: {}", programId);
        
        List<Syllabus> syllabuses = syllabusRepository.findSyllabusesByProgramId(programId).stream()
            .filter(Syllabus::getIsActive)
            .collect(Collectors.toList());
        
        return createPageFromList(syllabuses, pageable);
    }
    
    /**
     * Lọc giáo trình theo môn học
     */
    public Page<Syllabus> filterBySubject(Long subjectId, Pageable pageable) {
        log.debug("Filtering syllabuses by subject: {}", subjectId);
        
        List<Syllabus> syllabuses = syllabusRepository.findActiveSyllabusesBySubjectId(subjectId).stream()
            .filter(Syllabus::getIsActive)
            .collect(Collectors.toList());
        
        return createPageFromList(syllabuses, pageable);
    }
    
    /**
     * Tìm kiếm nâng cao với multiple filters
     */
    public Page<Syllabus> advancedSearch(SearchCriteria criteria, Pageable pageable) {
        log.debug("Performing advanced search with criteria: {}", criteria);
        
        List<Syllabus> results = syllabusRepository.findAll().stream()
            .filter(Syllabus::getIsActive)
            .filter(s -> criteria.getKeyword() == null || 
                        s.getSyllabusCode().toLowerCase().contains(criteria.getKeyword().toLowerCase()) ||
                        s.getSubject().getSubjectName().toLowerCase().contains(criteria.getKeyword().toLowerCase()))
            .filter(s -> criteria.getAcademicYear() == null || 
                        criteria.getAcademicYear().equals(s.getAcademicYear()))
            .filter(s -> criteria.getSemester() == null || 
                        criteria.getSemester().equals(s.getSemester()))
            .filter(s -> criteria.getStatus() == null || 
                        criteria.getStatus().equals(s.getStatus()))
            .filter(s -> criteria.getApprovalStatus() == null || 
                        criteria.getApprovalStatus().equals(s.getApprovalStatus()))
            .filter(s -> criteria.getProgramId() == null || 
                        criteria.getProgramId().equals(s.getSubject().getProgram().getId()))
            .collect(Collectors.toList());
        
        return createPageFromList(results, pageable);
    }
    
    /**
     * Lấy tất cả giáo trình đang chờ phê duyệt (L1 hoặc L2)
     */
    public Page<Syllabus> getPendingApprovalSyllabuses(Pageable pageable) {
        log.debug("Fetching pending approval syllabuses");
        
        List<Syllabus> syllabuses = syllabusRepository.findAll().stream()
            .filter(Syllabus::getIsActive)
            .filter(s -> "L1_PENDING".equals(s.getApprovalStatus()) || 
                        "L2_PENDING".equals(s.getApprovalStatus()))
            .collect(Collectors.toList());
        
        return createPageFromList(syllabuses, pageable);
    }
    
    /**
     * Lấy tất cả giáo trình bị từ chối
     */
    public Page<Syllabus> getRejectedSyllabuses(Pageable pageable) {
        log.debug("Fetching rejected syllabuses");
        
        List<Syllabus> syllabuses = syllabusRepository.findAll().stream()
            .filter(Syllabus::getIsActive)
            .filter(s -> "L1_REJECTED".equals(s.getApprovalStatus()) || 
                        "L2_REJECTED".equals(s.getApprovalStatus()))
            .collect(Collectors.toList());
        
        return createPageFromList(syllabuses, pageable);
    }
    
    /**
     * Lấy tất cả giáo trình đã phê duyệt
     */
    public Page<Syllabus> getApprovedSyllabuses(Pageable pageable) {
        log.debug("Fetching approved syllabuses");
        
        List<Syllabus> syllabuses = syllabusRepository.findAll().stream()
            .filter(Syllabus::getIsActive)
            .filter(s -> "APPROVED".equals(s.getApprovalStatus()))
            .collect(Collectors.toList());
        
        return createPageFromList(syllabuses, pageable);
    }
    
    /**
     * Helper method to convert List to Page
     */
    private Page<Syllabus> createPageFromList(List<Syllabus> list, Pageable pageable) {
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), list.size());
        
        List<Syllabus> pageContent = list.subList(start, end);
        return new PageImpl<>(pageContent, pageable, list.size());
    }
    
    /**
     * DTO for advanced search criteria
     */
    public static class SearchCriteria {
        private String keyword;
        private String academicYear;
        private Integer semester;
        private String status;
        private String approvalStatus;
        private Long programId;
        
        public SearchCriteria() {}
        
        public SearchCriteria(String keyword, String academicYear, Integer semester, 
                            String status, String approvalStatus, Long programId) {
            this.keyword = keyword;
            this.academicYear = academicYear;
            this.semester = semester;
            this.status = status;
            this.approvalStatus = approvalStatus;
            this.programId = programId;
        }
        
        // Getters and Setters
        public String getKeyword() { return keyword; }
        public void setKeyword(String keyword) { this.keyword = keyword; }
        
        public String getAcademicYear() { return academicYear; }
        public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }
        
        public Integer getSemester() { return semester; }
        public void setSemester(Integer semester) { this.semester = semester; }
        
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        
        public String getApprovalStatus() { return approvalStatus; }
        public void setApprovalStatus(String approvalStatus) { this.approvalStatus = approvalStatus; }
        
        public Long getProgramId() { return programId; }
        public void setProgramId(Long programId) { this.programId = programId; }
    }
}
