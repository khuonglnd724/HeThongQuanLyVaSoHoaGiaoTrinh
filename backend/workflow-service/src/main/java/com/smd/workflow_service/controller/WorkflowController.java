package com.smd.workflow_service.controller;

import com.smd.workflow_service.domain.WorkflowEvent;
import com.smd.workflow_service.domain.WorkflowState;
import com.smd.workflow_service.service.WorkflowService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/workflows")
public class WorkflowController {

    private final WorkflowService workflowService;

    public WorkflowController(WorkflowService workflowService) {
        this.workflowService = workflowService;
    }

    /**
     * Start workflow (Draft)
     */
    @PostMapping("/start")
    public WorkflowState startWorkflow() {
        return workflowService
                .startWorkflow()
                .getState()
                .getId();
    }

    /**
     * Submit syllabus: DRAFT -> REVIEW
     */
    @PostMapping("/submit")
    public WorkflowState submit() {
        var sm = workflowService.startWorkflow();
        return workflowService.sendEvent(sm, WorkflowEvent.SUBMIT);
    }

    /**
     * Approve syllabus: REVIEW -> APPROVED
     */
    @PostMapping("/approve")
    public WorkflowState approve() {
        var sm = workflowService.startWorkflow();
        return workflowService.sendEvent(sm, WorkflowEvent.APPROVE);
    }

    /**
     * Reject syllabus: REVIEW -> REJECTED
     */
    @PostMapping("/reject")
    public WorkflowState reject() {
        var sm = workflowService.startWorkflow();
        return workflowService.sendEvent(sm, WorkflowEvent.REJECT);
    }

    /**
     * Require edit: REJECTED -> DRAFT
     */
    @PostMapping("/require-edit")
    public WorkflowState requireEdit() {
        var sm = workflowService.startWorkflow();
        return workflowService.sendEvent(sm, WorkflowEvent.REQUIRE_EDIT);
    }
}
