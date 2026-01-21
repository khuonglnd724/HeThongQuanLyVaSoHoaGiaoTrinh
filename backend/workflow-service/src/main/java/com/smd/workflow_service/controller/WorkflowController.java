package com.smd.workflow_service.controller;

import com.smd.workflow_service.domain.UserRole;
import com.smd.workflow_service.domain.Workflow;
import com.smd.workflow_service.domain.WorkflowEvent;
import com.smd.workflow_service.domain.WorkflowHistory;
import com.smd.workflow_service.domain.WorkflowState;
import com.smd.workflow_service.dto.CommentRequest;
import com.smd.workflow_service.dto.SyllabusDiffDTO;
import com.smd.workflow_service.dto.WorkflowReviewDTO;
import com.smd.workflow_service.client.SyllabusClient;
import com.smd.workflow_service.service.WorkflowService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/workflows")
public class WorkflowController {

    private final WorkflowService service;
    private final SyllabusClient syllabusClient;

    public WorkflowController(
            WorkflowService service,
            SyllabusClient syllabusClient
    ) {
        this.service = service;
        this.syllabusClient = syllabusClient;
    }

    @PostMapping
    public Workflow create(@RequestParam String entityId,
                           @RequestParam String entityType) {
        return service.createWorkflow(entityId, entityType);
    }

    @GetMapping("/{id}")
    public Workflow get(@PathVariable UUID id) {
        return service.getWorkflow(id);
    }

    @PostMapping("/{id}/submit")
    public WorkflowState submit(@PathVariable UUID id,
                                @RequestParam String actionBy) {
        return service.sendEvent(
            id,
            WorkflowEvent.SUBMIT,
            UserRole.ROLE_LECTURER,
            actionBy,
            null
        );
    }

    @PostMapping("/{id}/approve")
    public WorkflowState approve(@PathVariable UUID id,
                                 @RequestParam String actionBy,
                                 @RequestParam UserRole role) {
        return service.sendEvent(
                id,
                WorkflowEvent.APPROVE,
                role,
                actionBy,
                null
        );
    }

    @PostMapping("/{id}/reject")
    public WorkflowState reject(
            @PathVariable UUID id,
            @RequestParam String actionBy,
            @RequestParam UserRole role,
            @RequestBody CommentRequest body
    ) {
        return service.sendEvent(
                id,
                WorkflowEvent.REJECT,
                role,
                actionBy,
                body.getComment()
        );
    }

    @PostMapping("/{id}/require-edit")
    public WorkflowState requireEdit(
            @PathVariable UUID id,
            @RequestParam String actionBy,
            @RequestParam UserRole role,
            @RequestBody CommentRequest body
    ) {
        return service.sendEvent(
                id,
                WorkflowEvent.REQUIRE_EDIT,
                role,
                actionBy,
                body.getComment()
        );
    }

    @GetMapping("/{id}/history")
    public List<WorkflowHistory> history(@PathVariable UUID id) {
        return service.getHistory(id);
    }

    @GetMapping
    public List<Workflow> getWorkflows(
        @RequestParam(required = false) WorkflowState state
    ) {
        if (state != null) {
            return service.findByState(state);
        }
        return service.findAll();
    }

    @GetMapping("/{id}/review")
    public WorkflowReviewDTO getWorkflowForReview(@PathVariable UUID id) {
    Workflow workflow = service.getWorkflow(id);

    SyllabusDiffDTO syllabus = syllabusClient.getDiffByWorkflow(id.toString());

    return new WorkflowReviewDTO(workflow, syllabus);
}

}
