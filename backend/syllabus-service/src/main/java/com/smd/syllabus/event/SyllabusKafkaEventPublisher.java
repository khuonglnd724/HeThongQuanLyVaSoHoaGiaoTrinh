package com.smd.syllabus.event;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

/**
 * Service for publishing syllabus-related events to Kafka
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SyllabusKafkaEventPublisher {

    private final KafkaTemplate<String, Map<String, Object>> kafkaTemplate;

    /**
     * Publish event when syllabus is submitted for approval
     */
    public void publishSyllabusSubmitted(
            Long syllabusId,
            String syllabusName,
            Long submitterId,
            String submitterName,
            Long approverId,
            String approverName,
            String approverRole
    ) {
        try {
            Map<String, Object> event = new HashMap<>();
            event.put("syllabusId", syllabusId);
            event.put("syllabusName", syllabusName);
            event.put("submitterId", submitterId);
            event.put("submitterName", submitterName);
            event.put("approverId", approverId);
            event.put("approverName", approverName);
            event.put("approverRole", approverRole);
            event.put("timestamp", System.currentTimeMillis());

            kafkaTemplate.send("syllabus.submitted", syllabusId.toString(), event);
            log.info("📤 Published syllabus.submitted event for syllabus: {} to approver: {}", 
                syllabusId, approverId);
        } catch (Exception e) {
            log.error("❌ Failed to publish syllabus.submitted event", e);
        }
    }

    /**
     * Publish event when workflow status changes (approved/rejected)
     */
    public void publishWorkflowStatusChanged(
            Long syllabusId,
            String syllabusName,
            String status,
            Long reviewerId,
            String reviewerName,
            String reviewerRole,
            Long lecturerId,
            String lecturerName,
            String comment,
            Long nextApproverId,
            String nextApproverRole
    ) {
        try {
            Map<String, Object> event = new HashMap<>();
            event.put("syllabusId", syllabusId);
            event.put("syllabusName", syllabusName);
            event.put("status", status);
            event.put("reviewerId", reviewerId);
            event.put("reviewerName", reviewerName);
            event.put("reviewerRole", reviewerRole);
            event.put("lecturerId", lecturerId);
            event.put("lecturerName", lecturerName);
            event.put("comment", comment != null ? comment : "");
            event.put("timestamp", System.currentTimeMillis());

            // If approved and there's next approver, send notification
            if ("APPROVED".equals(status) && nextApproverId != null) {
                event.put("nextApproverId", nextApproverId);
                event.put("nextApproverRole", nextApproverRole);
                
                // Publish approval notification to next approver
                Map<String, Object> nextApprovalEvent = new HashMap<>();
                nextApprovalEvent.put("syllabusId", syllabusId);
                nextApprovalEvent.put("syllabusName", syllabusName);
                nextApprovalEvent.put("submitterName", reviewerName + " (" + reviewerRole + ")");
                nextApprovalEvent.put("approverId", nextApproverId);
                nextApprovalEvent.put("approverRole", nextApproverRole);
                nextApprovalEvent.put("timestamp", System.currentTimeMillis());
                
                kafkaTemplate.send("syllabus.submitted", syllabusId.toString(), nextApprovalEvent);
                log.info("📤 Published syllabus.submitted event to next approver: {} ({})", 
                    nextApproverId, nextApproverRole);
            }

            kafkaTemplate.send("workflow.status-changed", syllabusId.toString(), event);
            log.info("📤 Published workflow.status-changed event for syllabus: {} - status: {}", 
                syllabusId, status);
        } catch (Exception e) {
            log.error("❌ Failed to publish workflow.status-changed event", e);
        }
    }

    /**
     * Publish event when syllabus is published
     */
    public void publishSyllabusPublished(
            Long syllabusId,
            String syllabusName,
            Long programId,
            String programName,
            String majorCode
    ) {
        try {
            Map<String, Object> event = new HashMap<>();
            event.put("syllabusId", syllabusId);
            event.put("syllabusName", syllabusName);
            event.put("programId", programId);
            event.put("programName", programName);
            event.put("majorCode", majorCode);
            event.put("timestamp", System.currentTimeMillis());

            kafkaTemplate.send("syllabus.published", syllabusId.toString(), event);
            log.info("📤 Published syllabus.published event for syllabus: {}", syllabusId);
        } catch (Exception e) {
            log.error("❌ Failed to publish syllabus.published event", e);
        }
    }

    /**
     * Publish event when syllabus is updated
     */
    public void publishSyllabusUpdated(
            Long syllabusId,
            String syllabusName,
            Long editorId,
            String editorName,
            String changeDescription
    ) {
        try {
            Map<String, Object> event = new HashMap<>();
            event.put("syllabusId", syllabusId);
            event.put("syllabusName", syllabusName);
            event.put("editorId", editorId);
            event.put("editorName", editorName);
            event.put("changeDescription", changeDescription);
            event.put("timestamp", System.currentTimeMillis());

            kafkaTemplate.send("syllabus.updated", syllabusId.toString(), event);
            log.info("📤 Published syllabus.updated event for syllabus: {}", syllabusId);
        } catch (Exception e) {
            log.error("❌ Failed to publish syllabus.updated event", e);
        }
    }
}
