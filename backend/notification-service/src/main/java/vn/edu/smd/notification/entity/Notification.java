package vn.edu.smd.notification.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "notifications",
        indexes = {
                @Index(name = "idx_notification_user_id", columnList = "userId"),
                @Index(name = "idx_notification_type", columnList = "notificationType"),
                @Index(name = "idx_notification_read", columnList = "isRead"),
                @Index(name = "idx_notification_sent", columnList = "isSent"),
                @Index(name = "idx_notification_syllabus_id", columnList = "syllabusId"),
                @Index(name = "idx_notification_created_at", columnList = "createdAt")
        })
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String body;

    @Column(nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private NotificationType notificationType;

    // Related entity IDs
    private Long syllabusId;
    private Long workflowId;
    private Long commentId;

    // Notification status
    @Column(nullable = false)
    @Builder.Default
    private Boolean isRead = false;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isSent = false;

    // FCM specific
    @Column(length = 255)
    private String fcmMessageId;

    // Metadata
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> data;

    @Column(length = 20)
    @Builder.Default
    private String priority = "normal"; // high, normal, low

    // Timestamps
    private LocalDateTime sentAt;
    private LocalDateTime readAt;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum NotificationType {
        APPROVAL_REQUEST,      // Yêu cầu duyệt giáo trình
        NEW_SYLLABUS,          // Giáo trình mới
        SYLLABUS_APPROVED,     // Giáo trình đã duyệt
        SYLLABUS_REJECTED,     // Giáo trình bị từ chối
        COMMENT_ADDED,         // Có comment mới
        DEADLINE_REMINDER,     // Nhắc deadline
        STATUS_UPDATE,         // Cập nhật trạng thái
        SYSTEM_ANNOUNCEMENT    // Thông báo hệ thống
    }
}
