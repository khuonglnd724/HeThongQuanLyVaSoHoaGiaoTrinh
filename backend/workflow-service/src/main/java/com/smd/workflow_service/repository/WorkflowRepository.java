package com.smd.workflow_service.repository;

import com.smd.workflow_service.domain.Workflow;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface WorkflowRepository extends JpaRepository<Workflow, UUID> {

    Optional<Workflow> findByEntityId(String entityId);
}
