package com.smd.workflow_service.controller;

import com.smd.workflow_service.domain.Workflow;
import com.smd.workflow_service.domain.WorkflowEvent;
import com.smd.workflow_service.domain.WorkflowState;
import com.smd.workflow_service.service.WorkflowService;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/workflows")
public class WorkflowController {

    private final WorkflowService service;

    public WorkflowController(WorkflowService service) {
        this.service = service;
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
        return service.sendEvent(id, WorkflowEvent.SUBMIT, actionBy);
    }

    @PostMapping("/{id}/approve")
    public WorkflowState approve(@PathVariable UUID id,
                                 @RequestParam String actionBy) {
        return service.sendEvent(id, WorkflowEvent.APPROVE, actionBy);
    }

    @PostMapping("/{id}/reject")
    public WorkflowState reject(@PathVariable UUID id,
                                @RequestParam String actionBy) {
        return service.sendEvent(id, WorkflowEvent.REJECT, actionBy);
    }

    @PostMapping("/{id}/require-edit")
    public WorkflowState requireEdit(@PathVariable UUID id,
                                     @RequestParam String actionBy) {
        return service.sendEvent(id, WorkflowEvent.REQUIRE_EDIT, actionBy);
    }
}
