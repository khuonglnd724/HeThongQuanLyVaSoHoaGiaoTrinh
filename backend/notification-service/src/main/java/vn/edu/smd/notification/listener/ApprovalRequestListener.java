package vn.edu.smd.notification.listener;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import vn.edu.smd.notification.dto.NotificationRequest;
import vn.edu.smd.notification.entity.Notification;
import vn.edu.smd.notification.service.FCMService;

import java.util.HashMap;
import java.util.Map;

/**
 * Listener for syllabus approval request events
 * Sends notifications when a syllabus is submitted for approval
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ApprovalRequestListener {

    private final FCMService fcmService;

    /**
     * Listen for syllabus submission events
     * Notifies HOD/Academic Affairs/Rector when lecturer submits syllabus for approval
     */
    @KafkaListener(topics = "syllabus.submitted", groupId = "notification-service")
    public void handleSyllabusSubmitted(Map<String, Object> event) {
        try {
            log.info("📥 Received syllabus submission event: {}", event);

            Long syllabusId = ((Number) event.get("syllabusId")).longValue();
            String syllabusName = (String) event.get("syllabusName");
            String submitterName = (String) event.get("submitterName");
            String approverRole = (String) event.get("approverRole"); // HOD, ACADEMIC_AFFAIRS, RECTOR
            Long approverId = ((Number) event.get("approverId")).longValue();

            // Build notification message based on approver role
            String title = "Yêu cầu duyệt giáo trình mới";
            String body = String.format(
                "%s đã nộp giáo trình \"%s\" để bạn phê duyệt",
                submitterName,
                syllabusName
            );

            // Prepare notification data
            Map<String, Object> data = new HashMap<>();
            data.put("syllabusId", syllabusId);
            data.put("syllabusName", syllabusName);
            data.put("submitterName", submitterName);
            data.put("approverRole", approverRole);
            data.put("url", "/academic/approval?syllabusId=" + syllabusId);

            NotificationRequest request = NotificationRequest.builder()
                    .title(title)
                    .body(body)
                    .notificationType(Notification.NotificationType.APPROVAL_REQUEST)
                    .syllabusId(syllabusId)
                    .data(data)
                    .priority("high") // High priority for approval requests
                    .build();

            // Send notification to approver
            fcmService.sendNotificationToUser(approverId, request);

            log.info("✅ Approval request notification sent to user: {}", approverId);

        } catch (Exception e) {
            log.error("❌ Failed to process syllabus submission event", e);
        }
    }

    /**
     * Listen for workflow status change events
     * Notifies submitter when their syllabus is approved/rejected
     */
    @KafkaListener(topics = "workflow.status-changed", groupId = "notification-service")
    public void handleWorkflowStatusChanged(Map<String, Object> event) {
        try {
            log.info("📥 Received workflow status change event: {}", event);

            Long syllabusId = ((Number) event.get("syllabusId")).longValue();
            String syllabusName = (String) event.get("syllabusName");
            String status = (String) event.get("status"); // APPROVED, REJECTED
            String reviewerName = (String) event.get("reviewerName");
            String reviewerRole = (String) event.get("reviewerRole");
            Long lecturerId = ((Number) event.get("lecturerId")).longValue();
            String comment = (String) event.getOrDefault("comment", "");

            String title;
            String body;
            Notification.NotificationType notificationType;

            if ("APPROVED".equals(status)) {
                title = "Giáo trình đã được duyệt ✅";
                body = String.format(
                    "%s (%s) đã duyệt giáo trình \"%s\"",
                    reviewerName, reviewerRole, syllabusName
                );
                notificationType = Notification.NotificationType.SYLLABUS_APPROVED;
            } else {
                title = "Giáo trình cần chỉnh sửa ⚠️";
                body = String.format(
                    "%s (%s) yêu cầu chỉnh sửa giáo trình \"%s\"%s",
                    reviewerName, reviewerRole, syllabusName,
                    comment.isEmpty() ? "" : ": " + comment
                );
                notificationType = Notification.NotificationType.SYLLABUS_REJECTED;
            }

            Map<String, Object> data = new HashMap<>();
            data.put("syllabusId", syllabusId);
            data.put("syllabusName", syllabusName);
            data.put("status", status);
            data.put("reviewerName", reviewerName);
            data.put("comment", comment);
            data.put("url", "/lecturer/portal/syllabuses/" + syllabusId);

            NotificationRequest request = NotificationRequest.builder()
                    .title(title)
                    .body(body)
                    .notificationType(notificationType)
                    .syllabusId(syllabusId)
                    .data(data)
                    .priority("high")
                    .build();

            // Send notification to lecturer
            fcmService.sendNotificationToUser(lecturerId, request);

            log.info("✅ Status change notification sent to lecturer: {}", lecturerId);

        } catch (Exception e) {
            log.error("❌ Failed to process workflow status change event", e);
        }
    }
}
