package com.smd.syllabus_service.controller;

import com.smd.syllabus_service.api.ApiResponse;
import com.smd.syllabus_service.dto.*;
import com.smd.syllabus_service.service.SyllabusService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/syllabus")
public class SyllabusController {

    private final SyllabusService syllabusService;

    public SyllabusController(SyllabusService syllabusService) {
        this.syllabusService = syllabusService;
    }

    // ===== Existing =====
    @GetMapping
    public ApiResponse<List<SyllabusListItemDto>> listSyllabuses() {
        return ApiResponse.ok(syllabusService.list());
    }

    // ===== Builder =====
    @PostMapping
    public ApiResponse<SyllabusDetailDto> createDraft(@RequestBody SyllabusUpsertRequest req) {
        return ApiResponse.ok(syllabusService.createDraft(req));
    }

    @GetMapping("/{groupId}")
    public ApiResponse<SyllabusDetailDto> getLatest(@PathVariable String groupId) {
        return ApiResponse.ok(syllabusService.getLatest(groupId));
    }

    @PutMapping("/{groupId}")
    public ApiResponse<SyllabusDetailDto> updateDraft(@PathVariable String groupId,
            @RequestBody SyllabusUpsertRequest req) {
        return ApiResponse.ok(syllabusService.updateDraft(groupId, req));
    }

    @PostMapping("/{groupId}/submit")
    public ApiResponse<SyllabusDetailDto> submit(@PathVariable String groupId) {
        return ApiResponse.ok(syllabusService.submit(groupId));
    }

    // ===== Versions =====
    @GetMapping("/{groupId}/versions")
    public ApiResponse<List<SyllabusVersionDto>> listVersions(@PathVariable String groupId) {
        return ApiResponse.ok(syllabusService.listVersions(groupId));
    }

    @GetMapping("/{groupId}/versions/{version}")
    public ApiResponse<SyllabusDetailDto> getVersion(@PathVariable String groupId,
            @PathVariable Integer version) {
        return ApiResponse.ok(syllabusService.getVersion(groupId, version));
    }

    // ===== Comments (Collaborative Review) =====
    @GetMapping("/{groupId}/comments")
    public ApiResponse<List<SyllabusCommentDto>> listComments(@PathVariable String groupId,
            @RequestParam(name = "version") Integer version) {
        return ApiResponse.ok(syllabusService.listComments(groupId, version));
    }

    @PostMapping("/{groupId}/comments")
    public ApiResponse<SyllabusCommentDto> addComment(@PathVariable String groupId,
            @RequestBody CreateCommentRequest req) {
        return ApiResponse.ok(syllabusService.addComment(groupId, req));
    }

    @DeleteMapping("/comments/{id}")
    public ApiResponse<Void> deleteComment(@PathVariable Long id) {
        syllabusService.deleteComment(id);
        return ApiResponse.ok(null);
    }
}
