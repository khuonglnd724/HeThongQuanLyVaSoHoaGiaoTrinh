package com.smd.workflow_service.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "workflow_history")
public class WorkflowHistory {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private UUID workflowId;

    @Enumerated(EnumType.STRING)
    private WorkflowState fromState;

    @Enumerated(EnumType.STRING)
    private WorkflowState toState;

    @Enumerated(EnumType.STRING)
    private WorkflowEvent event;

    @Column(nullable = false)
    private String actionBy; 

    @Column(nullable = false)
    private LocalDateTime actionAt;

    @Column(columnDefinition = "TEXT")
    private String comment;


    @PrePersist
    public void prePersist() {
        actionAt = LocalDateTime.now();
    }

    public UUID getId() { return id; }

    public UUID getWorkflowId() { return workflowId; }
    public void setWorkflowId(UUID workflowId) { this.workflowId = workflowId; }

    public WorkflowState getFromState() { return fromState; }
    public void setFromState(WorkflowState fromState) { this.fromState = fromState; }

    public WorkflowState getToState() { return toState; }
    public void setToState(WorkflowState toState) { this.toState = toState; }

    public WorkflowEvent getEvent() { return event; }
    public void setEvent(WorkflowEvent event) { this.event = event; }

    public String getActionBy() { return actionBy; }
    public void setActionBy(String actionBy) { this.actionBy = actionBy; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }


    public LocalDateTime getActionAt() { return actionAt; }
}
