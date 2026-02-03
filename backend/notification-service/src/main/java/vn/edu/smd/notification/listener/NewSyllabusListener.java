package vn.edu.smd.notification.listener;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import vn.edu.smd.notification.dto.NotificationRequest;
import vn.edu.smd.notification.entity.Notification;
import vn.edu.smd.notification.service.FCMService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Listener for new syllabus publication events
 * Sends notifications to students when a new syllabus is published for their major
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class NewSyllabusListener {

    private final FCMService fcmService;

    /**
     * Listen for syllabus publication events
     * Notifies students when a new syllabus is published for their major
     */
    @KafkaListener(topics = "syllabus.published", groupId = "notification-service")
    public void handleSyllabusPublished(Map<String, Object> event) {
        try {
            log.info("📥 Received syllabus publication event: {}", event);

            Long syllabusId = ((Number) event.get("syllabusId")).longValue();
            String syllabusName = (String) event.get("syllabusName");
            String subjectCode = (String) event.get("subjectCode");
            String majorCode = (String) event.get("majorCode");
            String majorName = (String) event.get("majorName");
            
            // Get list of student IDs who should receive notification
            @SuppressWarnings("unchecked")
            List<Long> studentIds = (List<Long>) event.get("studentIds");

            if (studentIds == null || studentIds.isEmpty()) {
                log.warn("⚠️ No students found for major: {}", majorCode);
                return;
            }

            // Build notification message
            String title = "📚 Giáo trình mới";
            String body = String.format(
                "Giáo trình \"%s\" (%s) cho ngành %s đã được xuất bản",
                syllabusName,
                subjectCode,
                majorName
            );

            // Prepare notification data
            Map<String, Object> data = new HashMap<>();
            data.put("syllabusId", syllabusId);
            data.put("syllabusName", syllabusName);
            data.put("subjectCode", subjectCode);
            data.put("majorCode", majorCode);
            data.put("majorName", majorName);
            data.put("url", "/public/syllabus/" + syllabusId);

            NotificationRequest request = NotificationRequest.builder()
                    .title(title)
                    .body(body)
                    .notificationType(Notification.NotificationType.NEW_SYLLABUS)
                    .syllabusId(syllabusId)
                    .data(data)
                    .priority("normal") // Normal priority for new syllabus notifications
                    .build();

            // Send notification to all students in the major
            fcmService.sendNotificationToUsers(studentIds, request);

            log.info("✅ New syllabus notifications sent to {} students", studentIds.size());

        } catch (Exception e) {
            log.error("❌ Failed to process syllabus publication event", e);
        }
    }

    /**
     * Listen for syllabus update events
     * Notifies students who are following the syllabus
     */
    @KafkaListener(topics = "syllabus.updated", groupId = "notification-service")
    public void handleSyllabusUpdated(Map<String, Object> event) {
        try {
            log.info("📥 Received syllabus update event: {}", event);

            Long syllabusId = ((Number) event.get("syllabusId")).longValue();
            String syllabusName = (String) event.get("syllabusName");
            String updateDescription = (String) event.getOrDefault("updateDescription", "Nội dung đã được cập nhật");
            
            // Get list of student IDs who are following this syllabus
            @SuppressWarnings("unchecked")
            List<Long> followerIds = (List<Long>) event.get("followerIds");

            if (followerIds == null || followerIds.isEmpty()) {
                log.info("ℹ️ No followers for syllabus: {}", syllabusId);
                return;
            }

            // Build notification message
            String title = "🔄 Giáo trình đã cập nhật";
            String body = String.format(
                "Giáo trình \"%s\" mà bạn đang theo dõi đã được cập nhật: %s",
                syllabusName,
                updateDescription
            );

            // Prepare notification data
            Map<String, Object> data = new HashMap<>();
            data.put("syllabusId", syllabusId);
            data.put("syllabusName", syllabusName);
            data.put("updateDescription", updateDescription);
            data.put("url", "/public/syllabus/" + syllabusId);

            NotificationRequest request = NotificationRequest.builder()
                    .title(title)
                    .body(body)
                    .notificationType(Notification.NotificationType.STATUS_UPDATE)
                    .syllabusId(syllabusId)
                    .data(data)
                    .priority("normal")
                    .build();

            // Send notification to all followers
            fcmService.sendNotificationToUsers(followerIds, request);

            log.info("✅ Syllabus update notifications sent to {} followers", followerIds.size());

        } catch (Exception e) {
            log.error("❌ Failed to process syllabus update event", e);
        }
    }
}
