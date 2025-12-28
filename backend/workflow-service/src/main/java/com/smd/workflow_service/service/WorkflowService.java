package com.smd.workflow_service.service;

import com.smd.workflow_service.domain.WorkflowEvent;
import com.smd.workflow_service.domain.WorkflowState;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.statemachine.StateMachine;
import org.springframework.statemachine.config.StateMachineFactory;
import org.springframework.stereotype.Service;

@Service
public class WorkflowService {

    @Autowired
    private StateMachineFactory<WorkflowState, WorkflowEvent> stateMachineFactory;

    public StateMachine<WorkflowState, WorkflowEvent> startWorkflow() {
        StateMachine<WorkflowState, WorkflowEvent> stateMachine =
                stateMachineFactory.getStateMachine();
        stateMachine.start();
        return stateMachine;
    }

    public WorkflowState sendEvent(
            StateMachine<WorkflowState, WorkflowEvent> stateMachine,
            WorkflowEvent event) {

        stateMachine.sendEvent(
                MessageBuilder.withPayload(event).build()
        );

        return stateMachine.getState().getId();
    }
}
