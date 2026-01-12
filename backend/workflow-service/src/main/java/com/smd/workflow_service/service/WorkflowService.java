package com.smd.workflow_service.service;

import com.smd.workflow_service.domain.Workflow;
import com.smd.workflow_service.domain.WorkflowEvent;
import com.smd.workflow_service.domain.WorkflowState;
import com.smd.workflow_service.domain.WorkflowHistory;
import com.smd.workflow_service.repository.WorkflowRepository;
import com.smd.workflow_service.repository.WorkflowHistoryRepository;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.statemachine.StateMachine;
import org.springframework.statemachine.config.StateMachineFactory;
import org.springframework.statemachine.support.DefaultStateMachineContext;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class WorkflowService {

    private final StateMachineFactory<WorkflowState, WorkflowEvent> stateMachineFactory;
    private final WorkflowRepository workflowRepository;
    private final WorkflowHistoryRepository historyRepository;
    private final WorkflowAuditProducer auditProducer;

    public WorkflowService(StateMachineFactory<WorkflowState, WorkflowEvent> stateMachineFactory,
                           WorkflowRepository workflowRepository,
                           WorkflowHistoryRepository historyRepository,
                           WorkflowAuditProducer auditProducer) {
        this.stateMachineFactory = stateMachineFactory;
        this.workflowRepository = workflowRepository;
        this.historyRepository = historyRepository;
        this.auditProducer = auditProducer;
    }

    public Workflow createWorkflow(String entityId, String entityType) {
        Workflow wf = new Workflow();
        wf.setEntityId(entityId);
        wf.setEntityType(entityType);
        wf.setCurrentState(WorkflowState.DRAFT);
        return workflowRepository.save(wf);
    }

    public Workflow getWorkflow(UUID id) {
        return workflowRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Workflow not found"));
    }

    public WorkflowState sendEvent(UUID workflowId,
                                   WorkflowEvent event,
                                   String actionBy) {

        Workflow workflow = getWorkflow(workflowId);
        WorkflowState fromState = workflow.getCurrentState();

        StateMachine<WorkflowState, WorkflowEvent> sm =
                stateMachineFactory.getStateMachine(workflowId.toString());

        sm.stop();
        sm.getStateMachineAccessor()
                .doWithAllRegions(access ->
                        access.resetStateMachine(
                                new DefaultStateMachineContext<>(
                                        fromState,
                                        null,
                                        null,
                                        null
                                )
                        )
                );
        sm.start();

        sm.sendEvent(MessageBuilder.withPayload(event).build());

        WorkflowState toState = sm.getState().getId();
        workflow.setCurrentState(toState);
        workflowRepository.save(workflow);

        WorkflowHistory history = new WorkflowHistory();
        history.setWorkflowId(workflowId);
        history.setFromState(fromState);
        history.setToState(toState);
        history.setEvent(event);
        history.setActionBy(actionBy);
        historyRepository.save(history);

        if (event == WorkflowEvent.APPROVE || event == WorkflowEvent.REJECT) {
            auditProducer.sendAudit(
                    "Workflow " + workflowId +
                            " changed from " + fromState +
                            " to " + toState +
                            " by " + actionBy
            );
        }

        return toState;
    }
}
