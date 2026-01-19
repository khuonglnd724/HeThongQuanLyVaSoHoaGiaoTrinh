package com.smd.workflow_service.repository;

import com.smd.workflow_service.domain.Workflow;
import com.smd.workflow_service.domain.WorkflowState;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;
import java.util.List;

public interface WorkflowRepository extends JpaRepository<Workflow, UUID> {
    Optional<Workflow> findByEntityId(String entityId);
    List<Workflow> findByCurrentState(WorkflowState state);
}

