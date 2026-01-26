package com.smd.academic_service.controller;

import com.smd.academic_service.model.dto.ApiResponse;
import com.smd.academic_service.model.dto.CloDto;
import com.smd.academic_service.model.dto.LinkClosRequest;
import com.smd.academic_service.service.CloService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/clo")
@RequiredArgsConstructor
@Slf4j
public class CloController {
    
    private final CloService cloService;
    
    /**
     * Create new CLO
     * POST /api/v1/clo
     */
    @PostMapping
    public ResponseEntity<ApiResponse<CloDto>> createClo(@RequestBody CloDto cloDto) {
        log.info("Creating CLO with code: {}", cloDto.getCloCode());
        String createdBy = "SYSTEM";
        CloDto created = cloService.createClo(cloDto, createdBy);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(created, "CLO created successfully"));
    }
    
    /**
     * Get CLO by ID
     * GET /api/v1/clo/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CloDto>> getCloById(@PathVariable Long id) {
        log.info("Fetching CLO with id: {}", id);
        CloDto clo = cloService.getCloById(id);
        return ResponseEntity.ok(ApiResponse.success(clo, "CLO fetched successfully"));
    }
    
    /**
     * Get all CLOs for a subject
     * GET /api/v1/clo/subject/{subjectId}
     */
    @GetMapping("/subject/{subjectId}")
    public ResponseEntity<ApiResponse<List<CloDto>>> getClosBySubjectId(@PathVariable Long subjectId) {
        log.info("Fetching CLOs for subject id: {}", subjectId);
        List<CloDto> clos = cloService.getClosBySubjectId(subjectId);
        return ResponseEntity.ok(ApiResponse.success(clos, "CLOs fetched successfully"));
    }
    
    /**
     * Get all CLOs for a syllabus
     * GET /api/v1/clo/syllabus/{syllabusId}
     */
    @GetMapping("/syllabus/{syllabusId}")
    public ResponseEntity<ApiResponse<List<CloDto>>> getClosBySyllabusId(@PathVariable Long syllabusId) {
        log.info("Fetching CLOs for syllabus id: {}", syllabusId);
        List<CloDto> clos = cloService.getClosBySyllabusId(syllabusId);
        return ResponseEntity.ok(ApiResponse.success(clos, "CLOs fetched successfully"));
    }
    
    /**
     * Get all CLOs
     * GET /api/v1/clo
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<CloDto>>> getAllClos() {
        log.info("Fetching all CLOs");
        List<CloDto> clos = cloService.getAllClos();
        return ResponseEntity.ok(ApiResponse.success(clos, "All CLOs fetched successfully"));
    }

    /**
     * Get CLOs not yet assigned to any subject
     * GET /api/v1/clo/unassigned
     */
    @GetMapping("/unassigned")
    public ResponseEntity<ApiResponse<List<CloDto>>> getUnassignedClos() {
        log.info("Fetching unassigned CLOs");
        List<CloDto> clos = cloService.getUnassignedClos();
        return ResponseEntity.ok(ApiResponse.success(clos, "Unassigned CLOs fetched successfully"));
    }
    
    /**
     * Search CLOs by code
     * GET /api/v1/clo/search?code=CLO1
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<CloDto>>> searchClos(@RequestParam String code) {
        log.info("Searching CLOs with code: {}", code);
        List<CloDto> clos = cloService.searchClosByCode(code);
        return ResponseEntity.ok(ApiResponse.success(clos, "CLOs searched successfully"));
    }
    
    /**
     * Update CLO
     * PUT /api/v1/clo/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CloDto>> updateClo(@PathVariable Long id, @RequestBody CloDto cloDto) {
        log.info("Updating CLO with id: {}", id);
        String updatedBy = "SYSTEM";
        CloDto updated = cloService.updateClo(id, cloDto, updatedBy);
        return ResponseEntity.ok(ApiResponse.success(updated, "CLO updated successfully"));
    }
    
    /**
     * Delete CLO (soft delete)
     * DELETE /api/v1/clo/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteClo(@PathVariable Long id) {
        log.info("Deleting CLO with id: {}", id);
        String deletedBy = "SYSTEM";
        cloService.deleteClo(id, deletedBy);
        return ResponseEntity.ok(ApiResponse.success(null, "CLO deleted successfully"));
    }

    /**
     * Assign or detach a CLO to/from a subject
     * POST /api/v1/clo/{id}/assign-subject?subjectId=123 (subjectId null to detach)
     */
    @PostMapping("/{id}/assign-subject")
    public ResponseEntity<ApiResponse<CloDto>> assignCloToSubject(@PathVariable Long id, @RequestParam(required = false) Long subjectId) {
        log.info("Assigning CLO {} to subject {}", id, subjectId);
        String updatedBy = "SYSTEM";
        CloDto updated = cloService.assignCloToSubject(id, subjectId, updatedBy);
        return ResponseEntity.ok(ApiResponse.success(updated, "CLO assignment updated successfully"));
    }

    /**
     * Link CLOs to a Syllabus from syllabus_db
     * POST /api/v1/clo/syllabuses/{syllabusId}/link-clos
     * Body: { cloIds: [1, 2, 3] }
     */
    @PostMapping("/syllabuses/{syllabusId}/link-clos")
    public ResponseEntity<ApiResponse<Void>> linkClosToSyllabus(
            @PathVariable String syllabusId,
            @RequestBody LinkClosRequest request) {
        log.info("Linking CLOs to syllabus {}", syllabusId);
        String createdBy = "SYSTEM";  // Có thể lấy từ security context nếu cần
        cloService.linkClosToSyllabus(syllabusId, request.getCloIds(), createdBy);
        return ResponseEntity.ok(ApiResponse.success(null, "CLOs linked to syllabus successfully"));
    }

    /**
     * Get CLOs linked to a Syllabus
     * GET /api/v1/clo/syllabuses/{syllabusId}
     */
    @GetMapping("/syllabuses/{syllabusId}")
    public ResponseEntity<ApiResponse<List<CloDto>>> getClosBySyllabusUuid(@PathVariable String syllabusId) {
        log.info("Fetching CLOs for syllabus UUID: {}", syllabusId);
        List<CloDto> clos = cloService.getClosBySyllabusUuid(syllabusId);
        return ResponseEntity.ok(ApiResponse.success(clos, "CLOs fetched successfully"));
    }

    /**
     * Unlink all CLOs from a Syllabus
     * DELETE /api/v1/clo/syllabuses/{syllabusId}
     */
    @DeleteMapping("/syllabuses/{syllabusId}")
    public ResponseEntity<ApiResponse<Void>> unlinkAllClosFromSyllabus(@PathVariable String syllabusId) {
        log.info("Unlinking all CLOs from syllabus {}", syllabusId);
        cloService.unlinkAllClosFromSyllabus(syllabusId);
        return ResponseEntity.ok(ApiResponse.success(null, "All CLOs unlinked from syllabus successfully"));
    }
}
