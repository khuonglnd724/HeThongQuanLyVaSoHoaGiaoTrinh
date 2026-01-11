package com.smd.public_service.service;

import com.smd.public_service.model.entity.Syllabus;
import com.smd.public_service.repository.SyllabusRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

/**
 * PdfExportService - Export giáo trình thành dữ liệu có cấu trúc
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PdfExportService {
    
    private final SyllabusRepository syllabusRepository;
    
    /**
     * Export syllabus data structure (can be converted to PDF/Excel client-side)
     */
    @Transactional(readOnly = true)
    public Map<String, Object> exportSyllabusData(Long syllabusId) {
        Syllabus syllabus = syllabusRepository.findById(syllabusId)
                .orElseThrow(() -> new RuntimeException("Syllabus not found: " + syllabusId));
        
        Map<String, Object> data = new HashMap<>();
        data.put("syllabusCode", syllabus.getSyllabusCode());
        data.put("subjectCode", syllabus.getSubject().getSubjectCode());
        data.put("subjectName", syllabus.getSubject().getSubjectName());
        data.put("version", syllabus.getVersion());
        data.put("academicYear", syllabus.getAcademicYear());
        data.put("semester", syllabus.getSemester());
        data.put("status", syllabus.getStatus());
        data.put("learningObjectives", syllabus.getLearningObjectives());
        data.put("teachingMethods", syllabus.getTeachingMethods());
        data.put("assessmentMethods", syllabus.getAssessmentMethods());
        data.put("content", syllabus.getContent());
        data.put("approvalComments", syllabus.getApprovalComments());
        data.put("updatedAt", syllabus.getUpdatedAt() != null ? 
                syllabus.getUpdatedAt().format(DateTimeFormatter.ISO_DATE) : null);
        data.put("exportDate", java.time.LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));
        
        log.info("Successfully exported syllabus data for: {}", syllabusId);
        return data;
    }
}
