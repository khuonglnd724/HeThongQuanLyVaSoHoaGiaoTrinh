package com.smd.syllabus.mq;

import com.smd.syllabus.domain.Syllabus;
import com.smd.syllabus.domain.SyllabusStatus;
import com.smd.syllabus.repository.SyllabusRepository;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class WorkflowApprovalListener {

    private static final Logger log = LoggerFactory.getLogger(WorkflowApprovalListener.class);

    private final SyllabusRepository syllabusRepository;

    public WorkflowApprovalListener(SyllabusRepository syllabusRepository) {
        this.syllabusRepository = syllabusRepository;
    }

    @Transactional
    @RabbitListener(queues = "${smd.workflow.approval-queue:workflow.approval.syllabus}")
    public void handle(WorkflowApprovalMessage message) {
        if (message == null) {
            return;
        }

        log.info("[WorkflowApprovalListener] Received: {}", message);

        if (message.getToState() == null || !"APPROVED".equalsIgnoreCase(message.getToState())) {
            return; // Only sync APPROVED for now
        }

        Optional<Syllabus> syllabusOpt = Optional.empty();

        if (message.getWorkflowId() != null) {
            syllabusOpt = syllabusRepository.findByWorkflowId(message.getWorkflowId());
        }

        if (syllabusOpt.isEmpty() && message.getEntityId() != null) {
            try {
                UUID syllabusId = UUID.fromString(message.getEntityId());
                syllabusOpt = syllabusRepository.findById(syllabusId);
            } catch (IllegalArgumentException ex) {
                log.warn("[WorkflowApprovalListener] Invalid syllabusId received: {}", message.getEntityId());
            }
        }

        if (syllabusOpt.isEmpty()) {
            log.warn("[WorkflowApprovalListener] No syllabus found for workflowId={} entityId={}",
                    message.getWorkflowId(), message.getEntityId());
            return;
        }

        Syllabus syllabus = syllabusOpt.get();
        if (syllabus.getStatus() == SyllabusStatus.APPROVED) {
            return; // Already in sync
        }

        syllabus.setStatus(SyllabusStatus.APPROVED);
        syllabus.setApprovedAt(Instant.now());
        syllabus.setLastActionBy(message.getActionBy());
        syllabus.setUpdatedBy(message.getActionBy());

        syllabusRepository.save(syllabus);
        log.info("[WorkflowApprovalListener] Syllabus {} marked APPROVED via workflow sync", syllabus.getId());
    }
}
