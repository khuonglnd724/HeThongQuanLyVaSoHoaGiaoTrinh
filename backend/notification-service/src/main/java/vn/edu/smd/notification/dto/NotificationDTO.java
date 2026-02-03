package vn.edu.smd.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import vn.edu.smd.notification.entity.Notification;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDTO {
    private Long id;
    private Long userId;
    private String title;
    private String body;
    private Notification.NotificationType notificationType;
    private Long syllabusId;
    private Long workflowId;
    private Boolean isRead;
    private Map<String, Object> data;
    private LocalDateTime createdAt;
    private LocalDateTime readAt;
}
