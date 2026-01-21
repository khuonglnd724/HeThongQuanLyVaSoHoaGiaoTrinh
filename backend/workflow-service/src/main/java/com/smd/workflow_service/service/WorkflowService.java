package com.smd.workflow_service.service;

import com.smd.workflow_service.domain.*;
import com.smd.workflow_service.event.WorkflowApprovalEvent;
import com.smd.workflow_service.messaging.WorkflowApprovalProducer;
import com.smd.workflow_service.repository.WorkflowHistoryRepository;
import com.smd.workflow_service.repository.WorkflowRepository;

import org.slf4j.LoggerFactory;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.statemachine.StateMachine;
import org.springframework.statemachine.config.StateMachineFactory;
import org.springframework.statemachine.support.DefaultStateMachineContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class WorkflowService {

    private final StateMachineFactory<WorkflowState, WorkflowEvent> factory;
    private final WorkflowRepository repository;
    private final WorkflowHistoryRepository historyRepository;
    private final WorkflowAuditProducer auditProducer;
    private final WorkflowApprovalProducer approvalProducer;
    private static final Logger log =
        LoggerFactory.getLogger(WorkflowService.class);

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

    public List<Workflow> findByState(WorkflowState state) {
        return repository.findByCurrentState(state);
    }

    public List<Workflow> findAll() {
        return repository.findAll();
    }

    @Transactional
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
            throw new RuntimeException("Comment is required");
        }

        validateRole(fromState, event, role);

        StateMachine<WorkflowState, WorkflowEvent> sm =
                factory.getStateMachine(workflowId.toString());

        sm.stop();
        sm.getStateMachineAccessor().doWithAllRegions(access ->
                access.resetStateMachine(
                        new DefaultStateMachineContext<>(fromState, null, null, null)
                )
        );
        sm.start();

        boolean accepted = sm.sendEvent(event);

        if (!accepted) {
            throw new RuntimeException("Invalid workflow transition");
        }

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

            try {
                auditProducer.sendAudit(
                        "Workflow " + workflowId +
                                " from " + fromState +
                                " to " + toState +
                                " by " + actionBy
                );
            } catch (Exception e) {
                log.error("Audit failed, but workflow already processed", e);
            }

            try {
                WorkflowApprovalEvent approvalEvent = new WorkflowApprovalEvent();
                approvalEvent.setWorkflowId(workflowId);
                approvalEvent.setFromState(fromState);
                approvalEvent.setToState(toState);
                approvalEvent.setActionBy(actionBy);

                approvalProducer.send(approvalEvent);
            } catch (Exception e) {
                log.error("Failed to send approval event for workflow {}", workflowId, e);
            }
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
                if (role != UserRole.ROLE_LECTURER || state != WorkflowState.DRAFT) {
                    throw new RuntimeException("Only Lecturer can submit from DRAFT");
                }
            }
            case APPROVE, REJECT -> {
                if ((role != UserRole.ROLE_HOD && role != UserRole.ROLE_RECTOR)
                    || state != WorkflowState.REVIEW) {
                    throw new RuntimeException(
                            "Only HoD or Principal can approve/reject from REVIEW"
                    );
                }
            }
            case REQUIRE_EDIT -> {
                if ((role != UserRole.ROLE_HOD && role != UserRole.ROLE_RECTOR)
                        || state != WorkflowState.REVIEW) {
                    throw new RuntimeException(
                        "Only HoD or Principal can require edit from REVIEW"
                    );
                }
            }

        }
    }
}