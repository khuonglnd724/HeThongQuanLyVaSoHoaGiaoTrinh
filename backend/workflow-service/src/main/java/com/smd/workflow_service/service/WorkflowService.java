package com.smd.workflow_service.service;

import com.smd.workflow_service.domain.UserRole;
import com.smd.workflow_service.domain.Workflow;
import com.smd.workflow_service.domain.WorkflowEvent;
import com.smd.workflow_service.domain.WorkflowState;
import com.smd.workflow_service.event.WorkflowApprovalEvent;
import com.smd.workflow_service.messaging.WorkflowApprovalProducer;
import com.smd.workflow_service.domain.WorkflowHistory;
import com.smd.workflow_service.repository.WorkflowRepository;
import com.smd.workflow_service.repository.WorkflowHistoryRepository;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.statemachine.StateMachine;
import org.springframework.statemachine.config.StateMachineFactory;
import org.springframework.statemachine.support.DefaultStateMachineContext;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class WorkflowService {

    private final StateMachineFactory<WorkflowState, WorkflowEvent> factory;
    private final WorkflowRepository repository;
    private final WorkflowHistoryRepository historyRepository;
    private final WorkflowAuditProducer auditProducer;
    private final WorkflowApprovalProducer approvalProducer;


    public WorkflowService(StateMachineFactory<WorkflowState, WorkflowEvent> factory,
                           WorkflowRepository repository,
                           WorkflowHistoryRepository historyRepository,
                           WorkflowAuditProducer auditProducer,
                           WorkflowApprovalProducer approvalProducer) {
        this.factory = factory;
        this.repository = repository;
        this.historyRepository = historyRepository;
        this.auditProducer = auditProducer;
        this.approvalProducer = approvalProducer;
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
                                   UserRole role,
                                   String actionBy,
                                   String comment) {

        Workflow workflow = getWorkflow(workflowId);
        WorkflowState fromState = workflow.getCurrentState();

        if ((event == WorkflowEvent.APPROVE || event == WorkflowEvent.REJECT)
                && workflow.getReviewDeadline() != null
                && LocalDateTime.now().isAfter(workflow.getReviewDeadline())) {
            throw new RuntimeException("Review deadline exceeded");
        }

        if ((event == WorkflowEvent.REJECT || event == WorkflowEvent.REQUIRE_EDIT)
                && (comment == null || comment.isBlank())) {
            throw new RuntimeException(
                    "Comment is required for reject or require edit"
            );
        }

        validateRole(fromState, event, role);

        StateMachine<WorkflowState, WorkflowEvent> sm =
                factory.getStateMachine(workflowId.toString());

        sm.stop();
        sm.getStateMachineAccessor().doWithAllRegions(access ->
                access.resetStateMachine(
                        new DefaultStateMachineContext<>(
                                fromState, null, null, null
                        )
                )
        );
        sm.start();

        sm.sendEvent(MessageBuilder.withPayload(event).build());

        WorkflowState toState = sm.getState().getId();

        if (event == WorkflowEvent.SUBMIT) {
            workflow.setReviewDeadline(LocalDateTime.now().plusDays(7));
        }

        if (event == WorkflowEvent.APPROVE || event == WorkflowEvent.REJECT) {
            workflow.setReviewDeadline(null);
        }

        workflow.setCurrentState(toState);
        repository.save(workflow);

        WorkflowHistory history = new WorkflowHistory();
        history.setWorkflowId(workflowId);
        history.setFromState(fromState);
        history.setToState(toState);
        history.setEvent(event);
        history.setActionBy(actionBy);
        history.setComment(comment);
        historyRepository.save(history);

        if (event == WorkflowEvent.APPROVE || event == WorkflowEvent.REJECT) {
            auditProducer.sendAudit(
                    "Workflow " + workflowId +
                    " from " + fromState +
                    " to " + toState +
                    " by " + actionBy
            );
        }

        if (event == WorkflowEvent.APPROVE || event == WorkflowEvent.REJECT) {
            WorkflowApprovalEvent approvalEvent = new WorkflowApprovalEvent();
            approvalEvent.setWorkflowId(workflowId);
            approvalEvent.setFromState(fromState);
            approvalEvent.setToState(toState);
            approvalEvent.setActionBy(actionBy);

            approvalProducer.send(approvalEvent);
        }

        return toState;
    }

    public List<WorkflowHistory> getHistory(UUID workflowId) {
        return historyRepository.findByWorkflowId(workflowId);
    }

    private void validateRole(WorkflowState state,
                          WorkflowEvent event,
                          UserRole role) {

    switch (event) {

        case SUBMIT -> {
            if (role != UserRole.LECTURER || state != WorkflowState.DRAFT) {
                throw new RuntimeException(
                        "Only Lecturer can submit from DRAFT"
                );
            }
        }

        case APPROVE, REJECT -> {
            if ((role != UserRole.HOD && role != UserRole.PRINCIPAL)
                    || state != WorkflowState.REVIEW) {
                throw new RuntimeException(
                        "Only HoD or Principal can approve/reject from REVIEW"
                );
            }
        }

        case REQUIRE_EDIT -> {
            if (role != UserRole.LECTURER || state != WorkflowState.REJECTED) {
                throw new RuntimeException(
                        "Only Lecturer can require edit from REJECTED"
                );
            }
        }
    }
}
}
