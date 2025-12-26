package com.smd.academic_service.controller;

import com.smd.academic_service.model.dto.ApiResponse;
import com.smd.academic_service.model.dto.SyllabusDto;
import com.smd.academic_service.service.SyllabusService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/syllabus")
@RequiredArgsConstructor
@Slf4j
public class SyllabusController {
    
    private final SyllabusService syllabusService;
    
    /**
     * Create new Syllabus
     * POST /api/v1/syllabus
     */
    @PostMapping
    public ResponseEntity<ApiResponse<SyllabusDto>> createSyllabus(@RequestBody SyllabusDto syllabusDto) {
        log.info("Creating syllabus with code: {}", syllabusDto.getSyllabusCode());
        String createdBy = "SYSTEM";
        SyllabusDto created = syllabusService.createSyllabus(syllabusDto, createdBy);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(created, "Syllabus created successfully"));
    }
    
    /**
     * Get Syllabus by ID
     * GET /api/v1/syllabus/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SyllabusDto>> getSyllabusById(@PathVariable Long id) {
        log.info("Fetching syllabus with id: {}", id);
        SyllabusDto syllabus = syllabusService.getSyllabusById(id);
        return ResponseEntity.ok(ApiResponse.success(syllabus, "Syllabus fetched successfully"));
    }
    
    /**
     * Get Syllabuses by Subject
     * GET /api/v1/syllabus/subject/{subjectId}
     */
    @GetMapping("/subject/{subjectId}")
    public ResponseEntity<ApiResponse<List<SyllabusDto>>> getSyllabusesBySubjectId(@PathVariable Long subjectId) {
        log.info("Fetching syllabuses for subject id: {}", subjectId);
        List<SyllabusDto> syllabuses = syllabusService.getSyllabusesBySubjectId(subjectId);
        return ResponseEntity.ok(ApiResponse.success(syllabuses, "Syllabuses fetched successfully"));
    }
    
    /**
     * Get Syllabuses by Status
     * GET /api/v1/syllabus/status/{status}
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<SyllabusDto>>> getSyllabusesByStatus(@PathVariable String status) {
        log.info("Fetching syllabuses with status: {}", status);
        List<SyllabusDto> syllabuses = syllabusService.getSyllabusesByStatus(status);
        return ResponseEntity.ok(ApiResponse.success(syllabuses, "Syllabuses fetched successfully"));
    }
    
    /**
     * Get Syllabuses by Approval Status
     * GET /api/v1/syllabus/approval-status/{approvalStatus}
     */
    @GetMapping("/approval-status/{approvalStatus}")
    public ResponseEntity<ApiResponse<List<SyllabusDto>>> getSyllabusesByApprovalStatus(@PathVariable String approvalStatus) {
        log.info("Fetching syllabuses with approval status: {}", approvalStatus);
        List<SyllabusDto> syllabuses = syllabusService.getSyllabusesByApprovalStatus(approvalStatus);
        return ResponseEntity.ok(ApiResponse.success(syllabuses, "Syllabuses fetched successfully"));
    }
    
    /**
     * Get Syllabuses by Program
     * GET /api/v1/syllabus/program/{programId}
     */
    @GetMapping("/program/{programId}")
    public ResponseEntity<ApiResponse<List<SyllabusDto>>> getSyllabusesByProgramId(@PathVariable Long programId) {
        log.info("Fetching syllabuses for program id: {}", programId);
        List<SyllabusDto> syllabuses = syllabusService.getSyllabusesByProgramId(programId);
        return ResponseEntity.ok(ApiResponse.success(syllabuses, "Syllabuses fetched successfully"));
    }
    
    /**
     * Get all Syllabuses
     * GET /api/v1/syllabus
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<SyllabusDto>>> getAllSyllabuses() {
        log.info("Fetching all syllabuses");
        List<SyllabusDto> syllabuses = syllabusService.getAllSyllabuses();
        return ResponseEntity.ok(ApiResponse.success(syllabuses, "All syllabuses fetched successfully"));
    }
    
    /**
     * Update Syllabus
     * PUT /api/v1/syllabus/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SyllabusDto>> updateSyllabus(@PathVariable Long id, @RequestBody SyllabusDto syllabusDto) {
        log.info("Updating syllabus with id: {}", id);
        String updatedBy = "SYSTEM";
        SyllabusDto updated = syllabusService.updateSyllabus(id, syllabusDto, updatedBy);
        return ResponseEntity.ok(ApiResponse.success(updated, "Syllabus updated successfully"));
    }
    
    /**
     * Approve/Reject Syllabus
     * PATCH /api/v1/syllabus/{id}/approve
     */
    @PatchMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<SyllabusDto>> approveSyllabus(
        @PathVariable Long id,
        @RequestParam String approvalStatus,
        @RequestParam(required = false) Long approvedBy,
        @RequestParam(required = false) String comments) {
        log.info("Approving/rejecting syllabus with id: {}", id);
        String updatedBy = "SYSTEM";
        SyllabusDto updated = syllabusService.updateApprovalStatus(id, approvalStatus, approvedBy, comments, updatedBy);
        return ResponseEntity.ok(ApiResponse.success(updated, "Syllabus approval status updated successfully"));
    }
    
    /**
     * Delete Syllabus (soft delete)
     * DELETE /api/v1/syllabus/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSyllabus(@PathVariable Long id) {
        log.info("Deleting syllabus with id: {}", id);
        String deletedBy = "SYSTEM";
        syllabusService.deleteSyllabus(id, deletedBy);
        return ResponseEntity.ok(ApiResponse.success(null, "Syllabus deleted successfully"));
    }
}
