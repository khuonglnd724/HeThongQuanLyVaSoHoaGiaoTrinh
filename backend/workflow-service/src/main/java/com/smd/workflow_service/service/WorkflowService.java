package com.smd.workflow_service.service;

import com.smd.workflow_service.domain.*;
import com.smd.workflow_service.event.WorkflowSyncEvent;
import com.smd.workflow_service.messaging.WorkflowProducer;
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
    private final WorkflowProducer workflowProducer;
    private static final Logger log =
        LoggerFactory.getLogger(WorkflowService.class);

    public WorkflowService(StateMachineFactory<WorkflowState, WorkflowEvent> factory,
                           WorkflowRepository repository,
                           WorkflowHistoryRepository historyRepository,
                           WorkflowAuditProducer auditProducer,
                           WorkflowProducer workflowProducer) {
        this.factory = factory;
        this.repository = repository;
        this.historyRepository = historyRepository;
        this.auditProducer = auditProducer;
        this.workflowProducer = workflowProducer;
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
                WorkflowSyncEvent syncEvent = new WorkflowSyncEvent();
                syncEvent.setWorkflowId(workflowId);
                syncEvent.setEntityId(workflow.getEntityId());
                syncEvent.setEntityType(workflow.getEntityType());
                syncEvent.setFromState(fromState);
                syncEvent.setToState(toState);
                syncEvent.setActionBy(actionBy);

                workflowProducer.send(syncEvent);
            } catch (Exception e) {
                log.error("Failed to send workflow sync event for workflow {}", workflowId, e);
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
        
        Logger log = LoggerFactory.getLogger(WorkflowService.class);
        log.info("=== VALIDATE ROLE === Event: {}, State: {}, Role: {}", event, state, role);

        switch (event) {
            case SUBMIT -> {
                if ((role != UserRole.ROLE_LECTURER && role != UserRole.ROLE_HOD)
                        || state != WorkflowState.DRAFT) {
                    throw new RuntimeException("Only Lecturer or HoD can submit from DRAFT");
                }
            }
            case APPROVE, REJECT -> {
                log.info("APPROVE/REJECT check - Role is HOD: {}, RECTOR: {}, State is REVIEW: {}", 
                    role == UserRole.ROLE_HOD, 
                    role == UserRole.ROLE_RECTOR, 
                    state == WorkflowState.REVIEW);
                
                if (state == WorkflowState.APPROVED) {
                    throw new IllegalStateException(
                        "Workflow đã được duyệt rồi. Không thể duyệt lại!"
                    );
                }
                if (state == WorkflowState.REJECTED) {
                    throw new IllegalStateException(
                        "Workflow đã bị từ chối. Không thể duyệt!"
                    );
                }
                if ((role != UserRole.ROLE_HOD && role != UserRole.ROLE_RECTOR)
                    || state != WorkflowState.REVIEW) {
                    throw new IllegalStateException(
                            "Chỉ Trưởng khoa hoặc Hiệu trưởng mới có thể duyệt/từ chối khi workflow ở trạng thái REVIEW. " +
                            "Hiện tại: role=" + role + ", state=" + state
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