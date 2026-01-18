package com.smd.syllabus.controller;

import com.smd.syllabus.domain.SyllabusIssue;
import com.smd.syllabus.dto.CreateIssueRequest;
import com.smd.syllabus.dto.SyllabusIssueResponse;
import com.smd.syllabus.dto.UpdateIssueStatusRequest;
import com.smd.syllabus.service.SyllabusIssueService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/issues")
public class SyllabusIssueController {

    private final SyllabusIssueService service;

    public SyllabusIssueController(SyllabusIssueService service) {
        this.service = service;
    }

    @PostMapping
    public SyllabusIssueResponse create(
            @RequestHeader("X-User-Id") String userId,
            @RequestBody CreateIssueRequest req) {
        return SyllabusIssueResponse.from(service.create(req, userId));
    }

    @GetMapping("/{id}")
    public SyllabusIssueResponse get(@PathVariable UUID id) {
        return SyllabusIssueResponse.from(service.get(id));
    }

    @GetMapping
    public Page<SyllabusIssueResponse> search(
            @RequestParam(required = false) UUID syllabusRootId,
            @RequestParam(required = false) UUID syllabusId,
            @RequestParam(required = false) String reporterUserId,
            @RequestParam(required = false) SyllabusIssue.Status status,
            Pageable pageable) {
        return service.search(syllabusRootId, syllabusId, reporterUserId, status, pageable)
                .map(SyllabusIssueResponse::from);
    }

    @PutMapping("/{id}/status")
    public SyllabusIssueResponse updateStatus(
            @PathVariable UUID id,
            @RequestBody UpdateIssueStatusRequest req) {
        return SyllabusIssueResponse.from(service.updateStatus(id, req.getStatus()));
    }

    @DeleteMapping("/{id}")
    public void delete(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable UUID id) {
        service.delete(id, userId);
    }
}
