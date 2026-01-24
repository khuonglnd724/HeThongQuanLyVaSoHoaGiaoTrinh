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
public class WorkflowListener {

    private static final Logger log = LoggerFactory.getLogger(WorkflowListener.class);

    private final SyllabusRepository syllabusRepository;

    public WorkflowListener(SyllabusRepository syllabusRepository) {
        this.syllabusRepository = syllabusRepository;
    }

    @Transactional
    @RabbitListener(queues = "${smd.workflow.sync-queue:workflow.sync.syllabus}")
    public void handle(WorkflowMessage message) {
        if (message == null) {
            return;
        }

        log.info("[WorkflowListener] Received: {}", message);

        String toState = message.getToState();
        if (toState == null) {
            return;
        }

        // Only handle APPROVED or REJECTED states
        boolean isApproved = "APPROVED".equalsIgnoreCase(toState);
        boolean isRejected = "REJECTED".equalsIgnoreCase(toState);
        
        if (!isApproved && !isRejected) {
            log.debug("[WorkflowListener] Ignoring state: {}", toState);
            return;
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
                log.warn("[WorkflowListener] Invalid syllabusId received: {}", message.getEntityId());
            }
        }

        if (syllabusOpt.isEmpty()) {
            log.warn("[WorkflowListener] No syllabus found for workflowId={} entityId={}",
                    message.getWorkflowId(), message.getEntityId());
            return;
        }

        Syllabus syllabus = syllabusOpt.get();
        
        if (isApproved) {
            // Determine target status based on fromState
            // REVIEW → APPROVED means HoD approved, syllabus should go to PENDING_APPROVAL
            // APPROVAL → APPROVED means AA/Rector approved, syllabus should go to APPROVED
            String fromState = message.getFromState();
            SyllabusStatus targetStatus = SyllabusStatus.APPROVED; // Default
            
            if ("REVIEW".equalsIgnoreCase(fromState)) {
                // HoD approved during REVIEW stage
                targetStatus = SyllabusStatus.PENDING_APPROVAL;
                log.info("[WorkflowListener] HoD approved (REVIEW→APPROVAL), setting syllabus {} to PENDING_APPROVAL", syllabus.getId());
            } else if ("APPROVAL".equalsIgnoreCase(fromState)) {
                // AA/Rector approved during APPROVAL stage
                targetStatus = SyllabusStatus.APPROVED;
                log.info("[WorkflowListener] AA/Rector approved (APPROVAL→APPROVED), setting syllabus {} to APPROVED", syllabus.getId());
            }
            
            if (syllabus.getStatus() == targetStatus) {
                return; // Already in sync
            }
            
            syllabus.setStatus(targetStatus);
            if (targetStatus == SyllabusStatus.APPROVED) {
                syllabus.setApprovedAt(Instant.now());
            } else if (targetStatus == SyllabusStatus.PENDING_APPROVAL) {
                syllabus.setReviewedAt(Instant.now());
            }
        } else if (isRejected) {
            if (syllabus.getStatus() == SyllabusStatus.REJECTED) {
                return; // Already in sync
            }
            syllabus.setStatus(SyllabusStatus.REJECTED);
            log.info("[WorkflowListener] Syllabus {} marked REJECTED via workflow sync", syllabus.getId());
        }
        
        syllabus.setLastActionBy(message.getActionBy());
        syllabus.setUpdatedBy(message.getActionBy());
        syllabusRepository.save(syllabus);
    }
}
