package com.smd.syllabus.controller;

import com.smd.syllabus.domain.SyllabusStatus;
import com.smd.syllabus.dto.CreateSyllabusRequest;
import com.smd.syllabus.dto.RejectSyllabusRequest;
import com.smd.syllabus.dto.SyllabusResponse;
import com.smd.syllabus.dto.UpdateSyllabusRequest;
import com.smd.syllabus.service.SyllabusService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/syllabuses")
public class SyllabusController {

    private final SyllabusService syllabusService;

    public SyllabusController(SyllabusService syllabusService) {
        this.syllabusService = syllabusService;
    }

    /**
     * Create syllabus (Draft)
     * POST /api/syllabuses
     */
    @PostMapping
    public ResponseEntity<SyllabusResponse> createDraft(
            @RequestHeader("X-User-Id") String userId,
            @RequestBody CreateSyllabusRequest req) {
        return ResponseEntity.ok(syllabusService.createDraft(req, userId));
    }

    /**
     * Update syllabus by creating a NEW version
     * POST /api/syllabuses/{rootId}/versions
     */
    @PostMapping("/{rootId}/versions")
    public ResponseEntity<SyllabusResponse> updateAsNewVersion(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable UUID rootId,
            @RequestBody UpdateSyllabusRequest req) {
        return ResponseEntity.ok(syllabusService.updateAsNewVersion(rootId, req, userId));
    }

    /**
     * List/Search syllabuses
     * GET /api/syllabuses?q=&status=&page=&size=
     */
    @GetMapping
    public ResponseEntity<Page<SyllabusResponse>> search(
            @RequestParam(value = "q", required = false) String q,
            @RequestParam(value = "status", required = false) SyllabusStatus status,
            @RequestParam(value = "page", required = false, defaultValue = "0") int page,
            @RequestParam(value = "size", required = false, defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100));
        return ResponseEntity.ok(syllabusService.search(q, status, pageable));
    }

    /**
     * Get syllabus detail by ID
     * GET /api/syllabuses/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<SyllabusResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(syllabusService.getById(id));
    }

    /**
     * List all versions in a root group
     * GET /api/syllabuses/{rootId}/versions
     */
    @GetMapping("/{rootId}/versions")
    public ResponseEntity<List<SyllabusResponse>> listVersions(@PathVariable UUID rootId) {
        return ResponseEntity.ok(syllabusService.listVersions(rootId));
    }

    /**
     * Compare 2 versions
     * GET /api/syllabuses/{rootId}/compare?v1=1&v2=2
     */
    @GetMapping("/{rootId}/compare")
    public ResponseEntity<List<SyllabusResponse>> compare(
            @PathVariable UUID rootId,
            @RequestParam("v1") int v1,
            @RequestParam("v2") int v2) {
        return ResponseEntity.ok(syllabusService.compare(rootId, v1, v2));
    }

    // =========================
    // WORKFLOW APIs (Phase 4)
    // =========================

    /**
     * Submit a draft syllabus for review
     * POST /api/syllabuses/{id}/submit
     */
    @PostMapping("/{id}/submit")
    public ResponseEntity<SyllabusResponse> submit(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable UUID id) {
        return ResponseEntity.ok(syllabusService.submit(id, userId));
    }

    /**
     * Review approve: move from PENDING_REVIEW -> PENDING_APPROVAL
     * POST /api/syllabuses/{id}/review-approve
     */
    @PostMapping("/{id}/review-approve")
    public ResponseEntity<SyllabusResponse> reviewApprove(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable UUID id) {
        return ResponseEntity.ok(syllabusService.reviewApprove(id, userId));
    }

    /**
     * Final approve: move from PENDING_APPROVAL -> APPROVED
     * POST /api/syllabuses/{id}/approve
     */
    @PostMapping("/{id}/approve")
    public ResponseEntity<SyllabusResponse> approve(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable UUID id) {
        return ResponseEntity.ok(syllabusService.approve(id, userId));
    }

    /**
     * Publish: move from APPROVED -> PUBLISHED
     * POST /api/syllabuses/{id}/publish
     */
    @PostMapping("/{id}/publish")
    public ResponseEntity<SyllabusResponse> publish(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable UUID id) {
        return ResponseEntity.ok(syllabusService.publish(id, userId));
    }

    /**
     * Reject: move from PENDING_REVIEW or PENDING_APPROVAL -> REJECTED (with reason)
     * POST /api/syllabuses/{id}/reject
     */
    @PostMapping("/{id}/reject")
    public ResponseEntity<SyllabusResponse> reject(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable UUID id,
            @RequestBody RejectSyllabusRequest req) {
        return ResponseEntity.ok(syllabusService.reject(id, userId, req.getReason()));
    }

    /**
     * Delete syllabus (soft delete / mark as deleted)
     * DELETE /api/syllabuses/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable UUID id) {
        syllabusService.delete(id, userId);
        return ResponseEntity.ok().build();
    }
}
