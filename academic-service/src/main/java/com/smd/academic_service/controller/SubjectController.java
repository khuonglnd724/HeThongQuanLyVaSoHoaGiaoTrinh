package com.smd.academic_service.controller;

import com.smd.academic_service.model.dto.ApiResponse;
import com.smd.academic_service.model.dto.SubjectDto;
import com.smd.academic_service.service.SubjectService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/subject")
@RequiredArgsConstructor
@Slf4j
public class SubjectController {
    
    private final SubjectService subjectService;
    
    /**
     * Create new Subject
     * POST /api/v1/subject
     */
    @PostMapping
    public ResponseEntity<ApiResponse<SubjectDto>> createSubject(@RequestBody SubjectDto subjectDto) {
        log.info("Creating subject with code: {}", subjectDto.getSubjectCode());
        String createdBy = "SYSTEM";
        SubjectDto created = subjectService.createSubject(subjectDto, createdBy);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(created, "Subject created successfully"));
    }
    
    /**
     * Get Subject by ID
     * GET /api/v1/subject/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SubjectDto>> getSubjectById(@PathVariable Long id) {
        log.info("Fetching subject with id: {}", id);
        SubjectDto subject = subjectService.getSubjectById(id);
        return ResponseEntity.ok(ApiResponse.success(subject, "Subject fetched successfully"));
    }
    
    /**
     * Get Subjects by Program
     * GET /api/v1/subject/program/{programId}
     */
    @GetMapping("/program/{programId}")
    public ResponseEntity<ApiResponse<List<SubjectDto>>> getSubjectsByProgramId(@PathVariable Long programId) {
        log.info("Fetching subjects for program id: {}", programId);
        List<SubjectDto> subjects = subjectService.getSubjectsByProgramId(programId);
        return ResponseEntity.ok(ApiResponse.success(subjects, "Subjects fetched successfully"));
    }
    
    /**
     * Get Subjects by Program and Semester
     * GET /api/v1/subject/program/{programId}/semester/{semester}
     */
    @GetMapping("/program/{programId}/semester/{semester}")
    public ResponseEntity<ApiResponse<List<SubjectDto>>> getSubjectsByProgramAndSemester(
        @PathVariable Long programId,
        @PathVariable Integer semester) {
        log.info("Fetching subjects for program id: {} and semester: {}", programId, semester);
        List<SubjectDto> subjects = subjectService.getSubjectsByProgramAndSemester(programId, semester);
        return ResponseEntity.ok(ApiResponse.success(subjects, "Subjects fetched successfully"));
    }
    
    /**
     * Get all Subjects
     * GET /api/v1/subject
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<SubjectDto>>> getAllSubjects() {
        log.info("Fetching all subjects");
        List<SubjectDto> subjects = subjectService.getAllSubjects();
        return ResponseEntity.ok(ApiResponse.success(subjects, "All subjects fetched successfully"));
    }
    
    /**
     * Search Subjects by Code
     * GET /api/v1/subject/search?code=CS101
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<SubjectDto>>> searchSubjects(@RequestParam String code) {
        log.info("Searching subjects with code: {}", code);
        List<SubjectDto> subjects = subjectService.searchSubjectsByCode(code);
        return ResponseEntity.ok(ApiResponse.success(subjects, "Subjects searched successfully"));
    }
    
    /**
     * Update Subject
     * PUT /api/v1/subject/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SubjectDto>> updateSubject(@PathVariable Long id, @RequestBody SubjectDto subjectDto) {
        log.info("Updating subject with id: {}", id);
        String updatedBy = "SYSTEM";
        SubjectDto updated = subjectService.updateSubject(id, subjectDto, updatedBy);
        return ResponseEntity.ok(ApiResponse.success(updated, "Subject updated successfully"));
    }
    
    /**
     * Delete Subject (soft delete)
     * DELETE /api/v1/subject/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSubject(@PathVariable Long id) {
        log.info("Deleting subject with id: {}", id);
        String deletedBy = "SYSTEM";
        subjectService.deleteSubject(id, deletedBy);
        return ResponseEntity.ok(ApiResponse.success(null, "Subject deleted successfully"));
    }
}
