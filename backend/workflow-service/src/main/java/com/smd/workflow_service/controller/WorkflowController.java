package com.smd.workflow_service.controller;

import com.smd.workflow_service.domain.WorkflowEvent;
import com.smd.workflow_service.domain.WorkflowState;
import org.springframework.statemachine.StateMachine;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/workflows")
public class WorkflowController {

    private final StateMachine<WorkflowState, WorkflowEvent> stateMachine;

    public WorkflowController(StateMachine<WorkflowState, WorkflowEvent> stateMachine) {
        this.stateMachine = stateMachine;
    }

    @PostMapping("/submit")
    public String submit() {
        stateMachine.start();
        stateMachine.sendEvent(WorkflowEvent.SUBMIT);
        return "Submitted. Current state: " + stateMachine.getState().getId();
    }

    @PostMapping("/approve")
    public String approve() {
        stateMachine.sendEvent(WorkflowEvent.APPROVE);
        return "Approved. Current state: " + stateMachine.getState().getId();
    }

    @PostMapping("/reject")
    public String reject() {
        stateMachine.sendEvent(WorkflowEvent.REJECT);
        return "Rejected. Current state: " + stateMachine.getState().getId();
    }

    @PostMapping("/require-edit")
    public String requireEdit() {
        stateMachine.sendEvent(WorkflowEvent.REQUIRE_EDIT);
        return "Require edit. Current state: " + stateMachine.getState().getId();
    }
}
