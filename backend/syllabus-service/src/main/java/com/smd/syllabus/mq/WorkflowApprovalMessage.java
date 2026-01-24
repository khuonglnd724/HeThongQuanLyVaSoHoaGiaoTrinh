package com.smd.syllabus.mq;

import java.util.UUID;

/**
 * Payload published by workflow-service when a workflow is approved/rejected.
 * Kept minimal to avoid coupling to workflow-service classes.
 */
public class WorkflowApprovalMessage {

    private UUID workflowId;
    private String entityId;
    private String entityType;
    private String fromState;
    private String toState;
    private String actionBy;

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

    public String getFromState() {
        return fromState;
    }

    public void setFromState(String fromState) {
        this.fromState = fromState;
    }

    public String getToState() {
        return toState;
    }

    public void setToState(String toState) {
        this.toState = toState;
    }

    public String getActionBy() {
        return actionBy;
    }

    public void setActionBy(String actionBy) {
        this.actionBy = actionBy;
    }

    @Override
    public String toString() {
        return "WorkflowApprovalMessage{" +
                "workflowId=" + workflowId +
                ", entityId='" + entityId + '\'' +
                ", entityType='" + entityType + '\'' +
                ", fromState='" + fromState + '\'' +
                ", toState='" + toState + '\'' +
                ", actionBy='" + actionBy + '\'' +
                '}';
    }
}
