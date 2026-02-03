package vn.edu.smd.notification.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "fcm_device_tokens",
        indexes = {
                @Index(name = "idx_fcm_user_id", columnList = "userId"),
                @Index(name = "idx_fcm_token", columnList = "fcmToken"),
                @Index(name = "idx_fcm_active", columnList = "isActive")
        })
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FCMDeviceToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false, unique = true, columnDefinition = "TEXT")
    private String fcmToken;

    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private DeviceType deviceType;

    @Column(columnDefinition = "TEXT")
    private String browser;

    @Column(length = 255)
    private String deviceName;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @Column
    private LocalDateTime lastUsedAt;

    public enum DeviceType {
        WEB, ANDROID, IOS
    }
}
