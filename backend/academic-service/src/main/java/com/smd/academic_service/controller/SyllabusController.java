package com.smd.academic_service.controller;

import com.smd.academic_service.model.dto.ApiResponse;
import com.smd.academic_service.model.dto.SyllabusDto;
import com.smd.academic_service.model.dto.ApprovalValidationResult;
import com.smd.academic_service.model.dto.SyllabusVersionDto;
import com.smd.academic_service.model.dto.SyllabusVersionComparisonDto;
import com.smd.academic_service.model.dto.ProgramDto;
import com.smd.academic_service.model.entity.Syllabus;
import com.smd.academic_service.service.SyllabusService;
import com.smd.academic_service.service.ApprovalValidationService;
import com.smd.academic_service.service.SyllabusVersionService;
import com.smd.academic_service.service.PrerequisiteValidatorService;
import com.smd.academic_service.service.ProgramService;
import com.smd.academic_service.repository.SyllabusRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/syllabus")
@RequiredArgsConstructor
@Slf4j
public class SyllabusController {
    
    private final SyllabusService syllabusService;
    private final ApprovalValidationService approvalValidationService;
    private final SyllabusVersionService syllabusVersionService;
    private final PrerequisiteValidatorService prerequisiteValidatorService;
    private final SyllabusRepository syllabusRepository;
    private final ProgramService programService;
    
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
     * Get published Syllabuses (for public/students)
     * GET /api/v1/syllabus/published
     */
    @GetMapping("/published")
    public ResponseEntity<ApiResponse<List<SyllabusDto>>> getPublishedSyllabuses() {
        log.info("Fetching published syllabuses");
        List<SyllabusDto> syllabuses = syllabusService.getPublishedSyllabuses();
        return ResponseEntity.ok(ApiResponse.success(syllabuses, "Published syllabuses fetched successfully"));
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
    
    // ==================== VALIDATION ENDPOINTS ====================
    
    /**
     * Validate syllabus for approval
     * GET /api/v1/syllabus/{id}/validate-approval
     */
    @GetMapping("/{id}/validate-approval")
    public ResponseEntity<ApiResponse<ApprovalValidationResult>> validateForApproval(@PathVariable Long id) {
        log.info("Validating syllabus for approval: {}", id);
        ApprovalValidationResult result = approvalValidationService.validateForApproval(id);
        return ResponseEntity.ok(ApiResponse.success(result, "Approval validation completed"));
    }
    
    /**
     * Validate prerequisites of subject related to syllabus
     * GET /api/v1/syllabus/{id}/validate-prerequisites
     */
    @GetMapping("/{id}/validate-prerequisites")
    public ResponseEntity<ApiResponse<Map<String, Object>>> validatePrerequisites(@PathVariable Long id) {
        log.info("Validating prerequisites for syllabus: {}", id);
        
        Syllabus syllabus = syllabusRepository.findByIdAndIsActiveTrue(id)
            .orElseThrow(() -> new RuntimeException("Syllabus not found with id: " + id));
        
        var prereqResult = prerequisiteValidatorService.validatePrerequisites(syllabus.getSubject().getId());
        
        Map<String, Object> result = Map.of(
            "syllabusCode", syllabus.getSyllabusCode(),
            "subjectCode", syllabus.getSubject().getSubjectCode(),
            "validation", prereqResult
        );
        
        return ResponseEntity.ok(ApiResponse.success(result, "Prerequisite validation completed"));
    }
    
    // ==================== VERSION MANAGEMENT ENDPOINTS ====================
    
    /**
     * Get version history for a syllabus
     * GET /api/v1/syllabus/{id}/versions
     */
    @GetMapping("/{id}/versions")
    public ResponseEntity<ApiResponse<List<SyllabusVersionDto>>> getVersionHistory(@PathVariable Long id) {
        log.info("Fetching version history for syllabus id: {}", id);
        List<SyllabusVersionDto> versions = syllabusVersionService.getVersionHistory(id);
        return ResponseEntity.ok(ApiResponse.success(versions, "Version history retrieved successfully"));
    }
    
    /**
     * Get specific version of syllabus
     * GET /api/v1/syllabus/{id}/versions/{versionNumber}
     */
    @GetMapping("/{id}/versions/{versionNumber}")
    public ResponseEntity<ApiResponse<SyllabusVersionDto>> getVersion(
        @PathVariable Long id,
        @PathVariable Integer versionNumber) {
        log.info("Fetching version {} for syllabus id: {}", versionNumber, id);
        SyllabusVersionDto version = syllabusVersionService.getVersion(id, versionNumber);
        return ResponseEntity.ok(ApiResponse.success(version, "Specific version retrieved successfully"));
    }
    
    /**
     * Get latest version of syllabus
     * GET /api/v1/syllabus/{id}/versions/latest
     */
    @GetMapping("/{id}/versions/latest")
    public ResponseEntity<ApiResponse<SyllabusVersionDto>> getLatestVersion(@PathVariable Long id) {
        log.info("Fetching latest version for syllabus id: {}", id);
        SyllabusVersionDto version = syllabusVersionService.getLatestVersion(id);
        return ResponseEntity.ok(ApiResponse.success(version, "Latest version retrieved successfully"));
    }
    
    /**
     * Compare two versions of syllabus
     * GET /api/v1/syllabus/{id}/compare?version1=1&version2=2
     */
    @GetMapping("/{id}/compare")
    public ResponseEntity<ApiResponse<SyllabusVersionComparisonDto>> compareVersions(
        @PathVariable Long id,
        @RequestParam Integer version1,
        @RequestParam Integer version2) {
        log.info("Comparing versions {} and {} for syllabus id: {}", version1, version2, id);
        SyllabusVersionComparisonDto comparison = syllabusVersionService.compareVersions(id, version1, version2);
        return ResponseEntity.ok(ApiResponse.success(comparison, "Version comparison completed"));
    }

    /**
     * Get all available Programs (for filter dropdown)
     * GET /api/v1/syllabus/programs/all
     */
    @GetMapping("/programs/all")
    public ResponseEntity<ApiResponse<List<ProgramDto>>> getAllPrograms() {
        log.info("Fetching all programs for filter dropdown");
        List<ProgramDto> programs = programService.getAllPrograms();
        return ResponseEntity.ok(ApiResponse.success(programs, "All programs fetched successfully"));
    }
}

