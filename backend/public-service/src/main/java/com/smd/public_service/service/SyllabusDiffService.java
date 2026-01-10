package com.smd.public_service.service;

import com.smd.public_service.model.entity.Syllabus;
import com.smd.public_service.repository.SyllabusRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * SyllabusDiffService - So sánh 2 phiên bản giáo trình
 * Hiển thị diff: Xanh (thêm), Đỏ (xóa), Vàng (thay đổi)
 */
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
@Slf4j
public class SyllabusDiffService {
    
    private final SyllabusRepository syllabusRepository;
    
    /**
     * DTO cho diff result
     */
    public static class DiffResult {
        public SyllabusSummary oldVersion;
        public SyllabusSummary newVersion;
        public List<FieldDiff> differences;
        public String summary;
        
        public DiffResult() {
            this.differences = new ArrayList<>();
        }
    }
    
    public static class SyllabusSummary {
        public Long id;
        public String code;
        public Integer version;
        public String academicYear;
        public Integer semester;
        public String updatedAt;
        public String status;
    }
    
    public static class FieldDiff {
        public String fieldName;
        public String fieldLabel;
        public String oldValue;
        public String newValue;
        public String changeType;  // ADDED, REMOVED, MODIFIED
        
        public FieldDiff(String fieldName, String fieldLabel, String oldValue, String newValue, String changeType) {
            this.fieldName = fieldName;
            this.fieldLabel = fieldLabel;
            this.oldValue = oldValue;
            this.newValue = newValue;
            this.changeType = changeType;
        }
    }
    
    /**
     * So sánh 2 phiên bản giáo trình
     */
    public DiffResult compareSyllabi(Long oldSyllabusId, Long newSyllabusId) {
        Syllabus oldSyllabus = syllabusRepository.findById(oldSyllabusId)
                .orElseThrow(() -> new RuntimeException("Old syllabus not found"));
        
        Syllabus newSyllabus = syllabusRepository.findById(newSyllabusId)
                .orElseThrow(() -> new RuntimeException("New syllabus not found"));
        
        DiffResult result = new DiffResult();
        result.oldVersion = convertToSummary(oldSyllabus);
        result.newVersion = convertToSummary(newSyllabus);
        
        // Compare content
        compareSyllabusContent(oldSyllabus, newSyllabus, result);
        
        // Generate summary
        result.summary = generateSummary(result.differences);
        
        return result;
    }
    
    /**
     * So sánh 2 phiên bản của cùng một môn học
     */
    public DiffResult compareSyllabusVersions(Long subjectId, Integer oldVersion, Integer newVersion) {
        List<Syllabus> syllabi = syllabusRepository.findBySubjectId(subjectId);
        
        Syllabus oldSyllabus = syllabi.stream()
                .filter(s -> s.getVersion().equals(oldVersion))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Version not found: " + oldVersion));
        
        Syllabus newSyllabus = syllabi.stream()
                .filter(s -> s.getVersion().equals(newVersion))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Version not found: " + newVersion));
        
        return compareSyllabi(oldSyllabus.getId(), newSyllabus.getId());
    }
    
    /**
     * So sánh nội dung 2 giáo trình
     */
    private void compareSyllabusContent(Syllabus oldSyllabus, Syllabus newSyllabus, DiffResult result) {
        // Compare learning objectives
        if (!Objects.equals(oldSyllabus.getLearningObjectives(), newSyllabus.getLearningObjectives())) {
            result.differences.add(new FieldDiff(
                    "learningObjectives",
                    "Learning Objectives",
                    oldSyllabus.getLearningObjectives(),
                    newSyllabus.getLearningObjectives(),
                    "MODIFIED"
            ));
        }
        
        // Compare content
        if (!Objects.equals(oldSyllabus.getContent(), newSyllabus.getContent())) {
            result.differences.add(new FieldDiff(
                    "content",
                    "Content",
                    truncate(oldSyllabus.getContent(), 100),
                    truncate(newSyllabus.getContent(), 100),
                    "MODIFIED"
            ));
        }
        
        // Compare teaching methods
        if (!Objects.equals(oldSyllabus.getTeachingMethods(), newSyllabus.getTeachingMethods())) {
            result.differences.add(new FieldDiff(
                    "teachingMethods",
                    "Teaching Methods",
                    oldSyllabus.getTeachingMethods(),
                    newSyllabus.getTeachingMethods(),
                    "MODIFIED"
            ));
        }
        
        // Compare assessment methods
        if (!Objects.equals(oldSyllabus.getAssessmentMethods(), newSyllabus.getAssessmentMethods())) {
            result.differences.add(new FieldDiff(
                    "assessmentMethods",
                    "Assessment Methods",
                    oldSyllabus.getAssessmentMethods(),
                    newSyllabus.getAssessmentMethods(),
                    "MODIFIED"
            ));
        }
    }
    
    /**
     * Generate summary of changes
     */
    private String generateSummary(List<FieldDiff> differences) {
        if (differences.isEmpty()) {
            return "No changes detected";
        }
        
        long modified = differences.stream().filter(d -> "MODIFIED".equals(d.changeType)).count();
        long added = differences.stream().filter(d -> "ADDED".equals(d.changeType)).count();
        long removed = differences.stream().filter(d -> "REMOVED".equals(d.changeType)).count();
        
        return String.format("Total changes: %d (Modified: %d, Added: %d, Removed: %d)",
                differences.size(), modified, added, removed);
    }
    
    private SyllabusSummary convertToSummary(Syllabus syllabus) {
        SyllabusSummary summary = new SyllabusSummary();
        summary.id = syllabus.getId();
        summary.code = syllabus.getSyllabusCode();
        summary.version = syllabus.getVersion();
        summary.academicYear = syllabus.getAcademicYear();
        summary.semester = syllabus.getSemester();
        summary.updatedAt = syllabus.getUpdatedAt().format(DateTimeFormatter.ISO_DATE_TIME);
        summary.status = syllabus.getStatus();
        
        return summary;
    }
    
    private String truncate(String text, int length) {
        if (text == null || text.length() <= length) {
            return text;
        }
        return text.substring(0, length) + "...";
    }
}
