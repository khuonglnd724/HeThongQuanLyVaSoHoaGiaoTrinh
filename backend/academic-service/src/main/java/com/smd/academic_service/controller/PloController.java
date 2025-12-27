package com.smd.academic_service.controller;

import com.smd.academic_service.model.dto.ApiResponse;
import com.smd.academic_service.model.dto.PloDto;
import com.smd.academic_service.service.PloService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/plo")
@RequiredArgsConstructor
@Slf4j
public class PloController {
    
    private final PloService ploService;
    
    /**
     * Create new PLO
     * POST /api/v1/plo
     */
    @PostMapping
    public ResponseEntity<ApiResponse<PloDto>> createPlo(@RequestBody PloDto ploDto) {
        log.info("Creating PLO with code: {}", ploDto.getPloCode());
        String createdBy = "SYSTEM";  // Can be replaced with authenticated user
        PloDto created = ploService.createPlo(ploDto, createdBy);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(created, "PLO created successfully"));
    }
    
    /**
     * Get PLO by ID
     * GET /api/v1/plo/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PloDto>> getPloById(@PathVariable Long id) {
        log.info("Fetching PLO with id: {}", id);
        PloDto plo = ploService.getPloById(id);
        return ResponseEntity.ok(ApiResponse.success(plo, "PLO fetched successfully"));
    }
    
    /**
     * Get all PLOs for a program
     * GET /api/v1/plo/program/{programId}
     */
    @GetMapping("/program/{programId}")
    public ResponseEntity<ApiResponse<List<PloDto>>> getPlosByProgramId(@PathVariable Long programId) {
        log.info("Fetching PLOs for program id: {}", programId);
        List<PloDto> plos = ploService.getPlosByProgramId(programId);
        return ResponseEntity.ok(ApiResponse.success(plos, "PLOs fetched successfully"));
    }
    
    /**
     * Get all PLOs
     * GET /api/v1/plo
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<PloDto>>> getAllPlos() {
        log.info("Fetching all PLOs");
        List<PloDto> plos = ploService.getAllPlos();
        return ResponseEntity.ok(ApiResponse.success(plos, "All PLOs fetched successfully"));
    }
    
    /**
     * Search PLOs by code
     * GET /api/v1/plo/search?code=PLO1
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<PloDto>>> searchPlos(@RequestParam String code) {
        log.info("Searching PLOs with code: {}", code);
        List<PloDto> plos = ploService.searchPlosByCode(code);
        return ResponseEntity.ok(ApiResponse.success(plos, "PLOs searched successfully"));
    }
    
    /**
     * Update PLO
     * PUT /api/v1/plo/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PloDto>> updatePlo(@PathVariable Long id, @RequestBody PloDto ploDto) {
        log.info("Updating PLO with id: {}", id);
        String updatedBy = "SYSTEM";  // Can be replaced with authenticated user
        PloDto updated = ploService.updatePlo(id, ploDto, updatedBy);
        return ResponseEntity.ok(ApiResponse.success(updated, "PLO updated successfully"));
    }
    
    /**
     * Delete PLO (soft delete)
     * DELETE /api/v1/plo/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePlo(@PathVariable Long id) {
        log.info("Deleting PLO with id: {}", id);
        String deletedBy = "SYSTEM";  // Can be replaced with authenticated user
        ploService.deletePlo(id, deletedBy);
        return ResponseEntity.ok(ApiResponse.success(null, "PLO deleted successfully"));
    }
}
