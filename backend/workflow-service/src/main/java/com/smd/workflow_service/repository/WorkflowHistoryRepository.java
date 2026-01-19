package com.smd.workflow_service.repository;

import com.smd.workflow_service.domain.WorkflowHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface WorkflowHistoryRepository
        extends JpaRepository<WorkflowHistory, UUID> {

    List<WorkflowHistory> findByWorkflowId(UUID workflowId);
}
