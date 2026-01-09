package com.smd.workflow_service.service;

import com.smd.workflow_service.domain.UserRole;
import com.smd.workflow_service.domain.Workflow;
import com.smd.workflow_service.domain.WorkflowEvent;
import com.smd.workflow_service.domain.WorkflowState;
import com.smd.workflow_service.repository.WorkflowRepository;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.statemachine.StateMachine;
import org.springframework.statemachine.config.StateMachineFactory;
import org.springframework.statemachine.support.DefaultStateMachineContext;
import org.springframework.stereotype.Service;
import java.util.UUID;

@Service
public class WorkflowService {

    private final StateMachineFactory<WorkflowState, WorkflowEvent> factory;
    private final WorkflowRepository repository;

    public WorkflowService(StateMachineFactory<WorkflowState, WorkflowEvent> factory,
                           WorkflowRepository repository) {
        this.factory = factory;
        this.repository = repository;
    }

    public Workflow createWorkflow(String entityId, String entityType) {
        Workflow wf = new Workflow();
        wf.setEntityId(entityId);
        wf.setEntityType(entityType);
        wf.setCurrentState(WorkflowState.DRAFT);
        return repository.save(wf);
    }

    public Workflow getWorkflow(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Workflow not found"));
    }

    public WorkflowState sendEvent(UUID workflowId,
                                   WorkflowEvent event,
                                   UserRole role) {

        Workflow workflow = getWorkflow(workflowId);

        validateRole(workflow.getCurrentState(), event, role);

        StateMachine<WorkflowState, WorkflowEvent> sm =
                factory.getStateMachine(workflowId.toString());

        sm.stop();
        sm.getStateMachineAccessor().doWithAllRegions(access ->
                access.resetStateMachine(
                        new DefaultStateMachineContext<>(
                                workflow.getCurrentState(),
                                null,
                                null,
                                null
                        )
                )
        );
        sm.start();

        sm.sendEvent(MessageBuilder.withPayload(event).build());

        workflow.setCurrentState(sm.getState().getId());
        repository.save(workflow);

        return workflow.getCurrentState();
    }

    private void validateRole(WorkflowState state,
                              WorkflowEvent event,
                              UserRole role) {

        switch (event) {
            case SUBMIT -> {
                if (role != UserRole.AA || state != WorkflowState.DRAFT)
                    throw new RuntimeException("Only AA can submit from DRAFT");
            }
            case APPROVE, REJECT -> {
                if (role != UserRole.HOD || state != WorkflowState.REVIEW)
                    throw new RuntimeException("Only HoD can approve/reject from REVIEW");
            }
            case REQUIRE_EDIT -> {
                if (role != UserRole.AA || state != WorkflowState.REJECTED)
                    throw new RuntimeException("Only AA can require edit from REJECTED");
            }
        }
    }
}
