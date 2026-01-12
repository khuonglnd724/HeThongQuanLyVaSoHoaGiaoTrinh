package com.smd.academic_service.service;

import com.smd.academic_service.model.entity.Syllabus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * Service để quản lý thông báo real-time cho các sự kiện quan trọng trong workflow AA
 * - Khi Giáo trình được nộp lên
 * - Khi Giáo trình được phê duyệt/từ chối
 * - Khi kết thúc giai đoạn đánh giá
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {
    
    // In-memory notification store (nên thay thế bằng database hoặc message queue)
    private final Map<String, List<Notification>> notificationStore = new ConcurrentHashMap<>();
    private final Map<String, Notification> notificationDetails = new ConcurrentHashMap<>();
    
    /**
     * Send notification khi Giáo trình được nộp
     */
    @Transactional
    public void notifySyllabusSubmitted(Syllabus syllabus, String submittedBy) {
        log.info("Sending syllabus submitted notification for: {}", syllabus.getSyllabusCode());
        
        Notification notification = Notification.builder()
            .id(UUID.randomUUID().toString())
            .type("SYLLABUS_SUBMITTED")
            .title("Giáo trình được nộp")
            .message(String.format("Giáo trình %s (%s) đã được nộp bởi %s", 
                syllabus.getSyllabusCode(), 
                syllabus.getSubject().getSubjectName(), 
                submittedBy))
            .syllabusId(syllabus.getId())
            .syllabusCode(syllabus.getSyllabusCode())
            .priority("HIGH")
            .status("UNREAD")
            .createdAt(LocalDateTime.now())
            .recipientRole("DEPARTMENT_HEAD") // Gửi đến Trưởng Khoa
            .build();
        
        storeNotification(notification);
        broadcastNotification(notification);
    }
    
    /**
     * Send notification khi Giáo trình được phê duyệt cấp 1
     */
    @Transactional
    public void notifySyllabusApprovedLevel1(Syllabus syllabus, String approverName) {
        log.info("Sending level 1 approval notification for: {}", syllabus.getSyllabusCode());
        
        Notification notification = Notification.builder()
            .id(UUID.randomUUID().toString())
            .type("SYLLABUS_APPROVED_L1")
            .title("Giáo trình được phê duyệt cấp 1")
            .message(String.format("Giáo trình %s đã được phê duyệt cấp 1 bởi %s", 
                syllabus.getSyllabusCode(), approverName))
            .syllabusId(syllabus.getId())
            .syllabusCode(syllabus.getSyllabusCode())
            .priority("MEDIUM")
            .status("UNREAD")
            .createdAt(LocalDateTime.now())
            .recipientRole("TRAINING_DEPARTMENT") // Gửi đến Phòng Đào tạo
            .build();
        
        storeNotification(notification);
        broadcastNotification(notification);
    }
    
    /**
     * Send notification khi Giáo trình được phê duyệt cấp 2 (chính thức)
     */
    @Transactional
    public void notifySyllabusApprovedLevel2(Syllabus syllabus, String approverName) {
        log.info("Sending level 2 official approval notification for: {}", syllabus.getSyllabusCode());
        
        Notification notification = Notification.builder()
            .id(UUID.randomUUID().toString())
            .type("SYLLABUS_APPROVED_L2")
            .title("Giáo trình được phê duyệt chính thức")
            .message(String.format("Giáo trình %s đã được phê duyệt chính thức bởi %s. Giáo trình này đã sẵn sàng để công bố", 
                syllabus.getSyllabusCode(), approverName))
            .syllabusId(syllabus.getId())
            .syllabusCode(syllabus.getSyllabusCode())
            .priority("HIGH")
            .status("UNREAD")
            .createdAt(LocalDateTime.now())
            .recipientRole("LECTURER,DEPARTMENT_HEAD") // Gửi đến Giảng viên và Trưởng Khoa
            .build();
        
        storeNotification(notification);
        broadcastNotification(notification);
    }
    
    /**
     * Send notification khi Giáo trình bị từ chối
     */
    @Transactional
    public void notifySyllabusRejected(Syllabus syllabus, String rejectorName, String reason, String level) {
        log.info("Sending rejection notification for: {}", syllabus.getSyllabusCode());
        
        Notification notification = Notification.builder()
            .id(UUID.randomUUID().toString())
            .type("SYLLABUS_REJECTED")
            .title(String.format("Giáo trình bị từ chối (Cấp %s)", level))
            .message(String.format("Giáo trình %s bị từ chối bởi %s. Lý do: %s", 
                syllabus.getSyllabusCode(), rejectorName, reason))
            .syllabusId(syllabus.getId())
            .syllabusCode(syllabus.getSyllabusCode())
            .priority("HIGH")
            .status("UNREAD")
            .createdAt(LocalDateTime.now())
            .recipientRole("LECTURER") // Gửi đến Giảng viên
            .build();
        
        storeNotification(notification);
        broadcastNotification(notification);
    }
    
    /**
     * Send notification cho kết thúc đợt đánh giá
     */
    @Transactional
    public void notifyReviewPeriodEnded(String academicYear, String semester) {
        log.info("Sending review period end notification for {}-{}", academicYear, semester);
        
        Notification notification = Notification.builder()
            .id(UUID.randomUUID().toString())
            .type("REVIEW_PERIOD_ENDED")
            .title("Kết thúc đợt đánh giá hợp tác")
            .message(String.format("Đợt đánh giá hợp tác cho năm học %s kì %s đã kết thúc", 
                academicYear, semester))
            .priority("MEDIUM")
            .status("UNREAD")
            .createdAt(LocalDateTime.now())
            .recipientRole("DEPARTMENT_HEAD,TRAINING_DEPARTMENT")
            .build();
        
        storeNotification(notification);
        broadcastNotification(notification);
    }
    
    /**
     * Lấy danh sách thông báo cho một người dùng
     */
    public List<Notification> getUserNotifications(String userId, String role) {
        log.debug("Fetching notifications for user: {} with role: {}", userId, role);
        
        return notificationStore.getOrDefault(userId, new ArrayList<>()).stream()
            .filter(n -> n.getRecipientRole() == null || 
                        n.getRecipientRole().contains(role))
            .sorted(Comparator.comparing(Notification::getCreatedAt).reversed())
            .collect(Collectors.toList());
    }
    
    /**
     * Lấy danh sách thông báo chưa đọc
     */
    public List<Notification> getUnreadNotifications(String userId, String role) {
        log.debug("Fetching unread notifications for user: {}", userId);
        
        return getUserNotifications(userId, role).stream()
            .filter(n -> "UNREAD".equals(n.getStatus()))
            .collect(Collectors.toList());
    }
    
    /**
     * Đánh dấu thông báo là đã đọc
     */
    @Transactional
    public void markAsRead(String notificationId, String userId) {
        log.debug("Marking notification {} as read for user: {}", notificationId, userId);
        
        Notification notification = notificationDetails.get(notificationId);
        if (notification != null) {
            notification.setStatus("READ");
            notification.setReadAt(LocalDateTime.now());
        }
    }
    
    /**
     * Xóa thông báo
     */
    @Transactional
    public void deleteNotification(String notificationId, String userId) {
        log.debug("Deleting notification: {}", notificationId);
        
        notificationStore.values().forEach(list -> list.removeIf(n -> n.getId().equals(notificationId)));
        notificationDetails.remove(notificationId);
    }
    
    /**
     * Helper method để lưu thông báo
     */
    private void storeNotification(Notification notification) {
        String key = notification.getRecipientRole();
        notificationStore.computeIfAbsent(key, k -> new ArrayList<>()).add(notification);
        notificationDetails.put(notification.getId(), notification);
    }
    
    /**
     * Helper method để broadcast thông báo (có thể thay thế bằng WebSocket/Server-Sent Events)
     */
    private void broadcastNotification(Notification notification) {
        // TODO: Implement WebSocket broadcast hoặc Server-Sent Events
        log.info("Broadcasting notification: {} to role: {}", notification.getType(), notification.getRecipientRole());
    }
    
    /**
     * Entity for Notification
     */
    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @lombok.Builder
    public static class Notification {
        private String id;
        private String type;              // SYLLABUS_SUBMITTED, SYLLABUS_APPROVED_L1, SYLLABUS_APPROVED_L2, SYLLABUS_REJECTED, REVIEW_PERIOD_ENDED
        private String title;
        private String message;
        private Long syllabusId;
        private String syllabusCode;
        private String priority;          // HIGH, MEDIUM, LOW
        private String status;            // UNREAD, READ, ARCHIVED
        private String recipientRole;     // LECTURER, DEPARTMENT_HEAD, TRAINING_DEPARTMENT
        private LocalDateTime createdAt;
        private LocalDateTime readAt;
    }
}
