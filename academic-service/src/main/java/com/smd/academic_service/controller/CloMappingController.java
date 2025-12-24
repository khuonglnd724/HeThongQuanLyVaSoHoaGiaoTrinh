package com.smd.academic_service.controller;

import com.smd.academic_service.model.dto.ApiResponse;
import com.smd.academic_service.model.dto.CloMappingDto;
import com.smd.academic_service.service.CloMappingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/mapping")
@RequiredArgsConstructor
@Slf4j
public class CloMappingController {
    
    private final CloMappingService cloMappingService;
    
    /**
     * Create new CLO-PLO mapping
     * POST /api/v1/mapping
     */
    @PostMapping
    public ResponseEntity<ApiResponse<CloMappingDto>> createMapping(@RequestBody CloMappingDto mappingDto) {
        log.info("Creating mapping between CLO {} and PLO {}", mappingDto.getCloId(), mappingDto.getPloId());
        String createdBy = "SYSTEM";
        CloMappingDto created = cloMappingService.createMapping(mappingDto, createdBy);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(created, "Mapping created successfully"));
    }
    
    /**
     * Get mapping by ID
     * GET /api/v1/mapping/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CloMappingDto>> getMappingById(@PathVariable Long id) {
        log.info("Fetching mapping with id: {}", id);
        CloMappingDto mapping = cloMappingService.getMappingById(id);
        return ResponseEntity.ok(ApiResponse.success(mapping, "Mapping fetched successfully"));
    }
    
    /**
     * Get all mappings for a CLO
     * GET /api/v1/mapping/clo/{cloId}
     */
    @GetMapping("/clo/{cloId}")
    public ResponseEntity<ApiResponse<List<CloMappingDto>>> getMappingsByCloId(@PathVariable Long cloId) {
        log.info("Fetching mappings for CLO id: {}", cloId);
        List<CloMappingDto> mappings = cloMappingService.getMappingsByCloId(cloId);
        return ResponseEntity.ok(ApiResponse.success(mappings, "Mappings fetched successfully"));
    }
    
    /**
     * Get all mappings for a PLO
     * GET /api/v1/mapping/plo/{ploId}
     */
    @GetMapping("/plo/{ploId}")
    public ResponseEntity<ApiResponse<List<CloMappingDto>>> getMappingsByPloId(@PathVariable Long ploId) {
        log.info("Fetching mappings for PLO id: {}", ploId);
        List<CloMappingDto> mappings = cloMappingService.getMappingsByPloId(ploId);
        return ResponseEntity.ok(ApiResponse.success(mappings, "Mappings fetched successfully"));
    }
    
    /**
     * Get all mappings for a program
     * GET /api/v1/mapping/program/{programId}
     */
    @GetMapping("/program/{programId}")
    public ResponseEntity<ApiResponse<List<CloMappingDto>>> getMappingsByProgramId(@PathVariable Long programId) {
        log.info("Fetching mappings for program id: {}", programId);
        List<CloMappingDto> mappings = cloMappingService.getMappingsByProgramId(programId);
        return ResponseEntity.ok(ApiResponse.success(mappings, "Mappings fetched successfully"));
    }
    
    /**
     * Get all mappings
     * GET /api/v1/mapping
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<CloMappingDto>>> getAllMappings() {
        log.info("Fetching all mappings");
        List<CloMappingDto> mappings = cloMappingService.getAllMappings();
        return ResponseEntity.ok(ApiResponse.success(mappings, "All mappings fetched successfully"));
    }
    
    /**
     * Update mapping
     * PUT /api/v1/mapping/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CloMappingDto>> updateMapping(@PathVariable Long id, @RequestBody CloMappingDto mappingDto) {
        log.info("Updating mapping with id: {}", id);
        String updatedBy = "SYSTEM";
        CloMappingDto updated = cloMappingService.updateMapping(id, mappingDto, updatedBy);
        return ResponseEntity.ok(ApiResponse.success(updated, "Mapping updated successfully"));
    }
    
    /**
     * Delete mapping (soft delete)
     * DELETE /api/v1/mapping/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteMapping(@PathVariable Long id) {
        log.info("Deleting mapping with id: {}", id);
        String deletedBy = "SYSTEM";
        cloMappingService.deleteMapping(id, deletedBy);
        return ResponseEntity.ok(ApiResponse.success(null, "Mapping deleted successfully"));
    }
}
