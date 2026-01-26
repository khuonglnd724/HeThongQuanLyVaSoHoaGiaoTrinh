package com.smd.workflow_service.event;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.smd.workflow_service.domain.WorkflowState;

import java.util.UUID;

public class WorkflowSyncEvent {

    private UUID workflowId;
    private String entityId;
    private String entityType;
    private WorkflowState fromState;
    private WorkflowState toState;
    private String actionBy;
    private String comment; // Rejection reason or other comment

    public WorkflowSyncEvent() {
    }

    @JsonCreator
    public WorkflowSyncEvent(
            @JsonProperty("workflowId") UUID workflowId,
            @JsonProperty("entityId") String entityId,
            @JsonProperty("entityType") String entityType,
            @JsonProperty("fromState") WorkflowState fromState,
            @JsonProperty("toState") WorkflowState toState,
            @JsonProperty("actionBy") String actionBy,
            @JsonProperty("comment") String comment) {
        this.workflowId = workflowId;
        this.entityId = entityId;
        this.entityType = entityType;
        this.fromState = fromState;
        this.toState = toState;
        this.actionBy = actionBy;
        this.comment = comment;
    }

    public UUID getWorkflowId() {
        return workflowId;
    }

    public void setWorkflowId(UUID workflowId) {
        this.workflowId = workflowId;
    }

    public String getEntityId() {
        return entityId;
    }

    public void setEntityId(String entityId) {
        this.entityId = entityId;
    }

    public String getEntityType() {
        return entityType;
    }

    public void setEntityType(String entityType) {
        this.entityType = entityType;
    }

    public WorkflowState getFromState() {
        return fromState;
    }

    public void setFromState(WorkflowState fromState) {
        this.fromState = fromState;
    }

    public WorkflowState getToState() {
        return toState;
    }

    public void setToState(WorkflowState toState) {
        this.toState = toState;
    }

    public String getActionBy() {
        return actionBy;
    }

    public void setActionBy(String actionBy) {
        this.actionBy = actionBy;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    @Override
    public String toString() {
        return "WorkflowSyncEvent{" +
                "workflowId=" + workflowId +
                ", entityId='" + entityId + '\'' +
                ", entityType='" + entityType + '\'' +
                ", fromState=" + fromState +
                ", toState=" + toState +
                ", actionBy='" + actionBy + '\'' +
                ", comment='" + comment + '\'' +
                '}';
    }
}
