package com.smd.academic_service.controller;

import com.smd.academic_service.model.dto.ApiResponse;
import com.smd.academic_service.model.dto.CurriculumTreeDto;
import com.smd.academic_service.model.dto.DashboardStatsDto;
import com.smd.academic_service.model.dto.ProgramDto;
import com.smd.academic_service.service.CurriculumService;
import com.smd.academic_service.service.DashboardService;
import com.smd.academic_service.service.ProgramService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/program")
@RequiredArgsConstructor
@Slf4j
public class ProgramController {
    
    private final ProgramService programService;
    private final CurriculumService curriculumService;
    private final DashboardService dashboardService;
    
    /**
     * Create new Program
     * POST /api/v1/program
     */
    @PostMapping
    public ResponseEntity<ApiResponse<ProgramDto>> createProgram(@RequestBody ProgramDto programDto) {
        log.info("Creating program with code: {}", programDto.getProgramCode());
        String createdBy = "SYSTEM";
        ProgramDto created = programService.createProgram(programDto, createdBy);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(created, "Program created successfully"));
    }
    
    /**
     * Get Program by ID
     * GET /api/v1/program/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProgramDto>> getProgramById(@PathVariable Long id) {
        log.info("Fetching program with id: {}", id);
        ProgramDto program = programService.getProgramById(id);
        return ResponseEntity.ok(ApiResponse.success(program, "Program fetched successfully"));
    }
    
    /**
     * Get Program by Code
     * GET /api/v1/program/code/{code}
     */
    @GetMapping("/code/{code}")
    public ResponseEntity<ApiResponse<ProgramDto>> getProgramByCode(@PathVariable String code) {
        log.info("Fetching program with code: {}", code);
        ProgramDto program = programService.getProgramByCode(code);
        return ResponseEntity.ok(ApiResponse.success(program, "Program fetched successfully"));
    }
    
    /**
     * Get Programs by Department
     * GET /api/v1/program/department/{departmentId}
     */
    @GetMapping("/department/{departmentId}")
    public ResponseEntity<ApiResponse<List<ProgramDto>>> getProgramsByDepartmentId(@PathVariable Long departmentId) {
        log.info("Fetching programs for department id: {}", departmentId);
        List<ProgramDto> programs = programService.getProgramsByDepartmentId(departmentId);
        return ResponseEntity.ok(ApiResponse.success(programs, "Programs fetched successfully"));
    }
    
    /**
     * Get all Programs
     * GET /api/v1/program
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<ProgramDto>>> getAllPrograms() {
        log.info("Fetching all programs");
        List<ProgramDto> programs = programService.getAllPrograms();
        return ResponseEntity.ok(ApiResponse.success(programs, "All programs fetched successfully"));
    }
    
    /**
     * Search Programs by Name
     * GET /api/v1/program/search?name=Software
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<ProgramDto>>> searchPrograms(@RequestParam String name) {
        log.info("Searching programs with name: {}", name);
        List<ProgramDto> programs = programService.searchProgramsByName(name);
        return ResponseEntity.ok(ApiResponse.success(programs, "Programs searched successfully"));
    }
    
    /**
     * Update Program
     * PUT /api/v1/program/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProgramDto>> updateProgram(@PathVariable Long id, @RequestBody ProgramDto programDto) {
        log.info("Updating program with id: {}", id);
        String updatedBy = "SYSTEM";
        ProgramDto updated = programService.updateProgram(id, programDto, updatedBy);
        return ResponseEntity.ok(ApiResponse.success(updated, "Program updated successfully"));
    }
    
    /**
     * Delete Program (soft delete)
     * DELETE /api/v1/program/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProgram(@PathVariable Long id) {
        log.info("Deleting program with id: {}", id);
        String deletedBy = "SYSTEM";
        programService.deleteProgram(id, deletedBy);
        return ResponseEntity.ok(ApiResponse.success(null, "Program deleted successfully"));
    }
    
    /**
     * Get Curriculum Tree (Program -> Subject -> Syllabus -> CLO)
     * GET /api/v1/program/{programId}/curriculum
     */
    @GetMapping("/{programId}/curriculum")
    public ResponseEntity<ApiResponse<CurriculumTreeDto>> getCurriculumTree(@PathVariable Long programId) {
        log.info("Fetching curriculum tree for program id: {}", programId);
        CurriculumTreeDto tree = curriculumService.getCurriculumTree(programId);
        return ResponseEntity.ok(ApiResponse.success(tree, "Curriculum tree fetched successfully"));
    }
    
    /**
     * Get Dashboard Stats
     * GET /api/v1/program/{programId}/dashboard
     */
    @GetMapping("/{programId}/dashboard")
    public ResponseEntity<ApiResponse<DashboardStatsDto>> getDashboardStats(@PathVariable Long programId) {
        log.info("Fetching dashboard stats for program id: {}", programId);
        DashboardStatsDto stats = dashboardService.getDashboardStats(programId);
        return ResponseEntity.ok(ApiResponse.success(stats, "Dashboard stats fetched successfully"));
    }
}
