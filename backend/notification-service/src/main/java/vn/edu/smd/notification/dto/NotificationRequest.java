package vn.edu.smd.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import vn.edu.smd.notification.entity.Notification;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationRequest {
    
    private String title;
    private String body;
    private Notification.NotificationType notificationType;
    
    // Related entity IDs
    private Long syllabusId;
    private Long workflowId;
    private Long commentId;
    
    // Additional data
    private Map<String, Object> data;
    
    // Priority: high, normal, low
    @Builder.Default
    private String priority = "normal";
}
