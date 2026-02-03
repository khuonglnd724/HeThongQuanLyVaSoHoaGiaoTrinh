package vn.edu.smd.notification.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import vn.edu.smd.notification.dto.FCMTokenRequest;
import vn.edu.smd.notification.dto.NotificationDTO;
import vn.edu.smd.notification.entity.Notification;
import vn.edu.smd.notification.service.FCMService;
import vn.edu.smd.notification.service.NotificationService;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    private final FCMService fcmService;
    private final NotificationService notificationService;

    /**
     * Register FCM device token
     */
    @PostMapping("/register-device")
    public ResponseEntity<?> registerDevice(
            @RequestBody FCMTokenRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        try {
            Long userId = request.getUserId();
            
            fcmService.registerToken(
                userId,
                request.getFcmToken(),
                request.getDeviceType(),
                request.getBrowser(),
                request.getDeviceName()
            );
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "FCM token registered successfully"
            ));
            
        } catch (Exception e) {
            log.error("Failed to register FCM token", e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Failed to register token: " + e.getMessage()
            ));
        }
    }

    /**
     * Unregister FCM device token
     */
    @DeleteMapping("/unregister-device")
    public ResponseEntity<?> unregisterDevice(@RequestBody Map<String, String> request) {
        try {
            String fcmToken = request.get("fcmToken");
            fcmService.unregisterToken(fcmToken);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "FCM token unregistered successfully"
            ));
            
        } catch (Exception e) {
            log.error("Failed to unregister FCM token", e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Failed to unregister token: " + e.getMessage()
            ));
        }
    }

    /**
     * Get notifications for current user
     */
    @GetMapping
    public ResponseEntity<Page<NotificationDTO>> getNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Long userId) {
        
        Page<NotificationDTO> notifications = notificationService.getUserNotifications(userId, page, size);
        return ResponseEntity.ok(notifications);
    }

    /**
     * Get unread notification count
     */
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@RequestParam Long userId) {
        long count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(Map.of("count", count));
    }

    /**
     * Mark notification as read
     */
    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok(Map.of("success", true));
    }

    /**
     * Mark all notifications as read
     */
    @PutMapping("/read-all")
    public ResponseEntity<?> markAllAsRead(@RequestParam Long userId) {
        int count = notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "count", count
        ));
    }

    /**
     * Delete notification
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNotification(@PathVariable Long id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.ok(Map.of("success", true));
    }

    /**
     * Send notification to user (test endpoint)
     */
    @PostMapping("/send")
    public ResponseEntity<?> sendNotification(@RequestBody Map<String, Object> request) {
        try {
            Long userId = Long.valueOf(request.get("userId").toString());
            String title = request.get("title").toString();
            String body = request.get("body").toString();
            String typeStr = request.get("type").toString();
            
            // Parse notification type
            vn.edu.smd.notification.entity.Notification.NotificationType notificationType;
            try {
                notificationType = vn.edu.smd.notification.entity.Notification.NotificationType
                    .valueOf(typeStr);
            } catch (IllegalArgumentException e) {
                // Default to SYSTEM_ANNOUNCEMENT if invalid type
                notificationType = vn.edu.smd.notification.entity.Notification.NotificationType.SYSTEM_ANNOUNCEMENT;
            }
            
            @SuppressWarnings("unchecked")
            Map<String, Object> data = request.containsKey("data") 
                ? (Map<String, Object>) request.get("data") 
                : new HashMap<>();
            
            log.info("📤 Sending notification: userId={}, title={}, type={}", 
                userId, title, notificationType);
            
            // Create NotificationRequest
            vn.edu.smd.notification.dto.NotificationRequest notificationRequest = 
                vn.edu.smd.notification.dto.NotificationRequest.builder()
                    .title(title)
                    .body(body)
                    .notificationType(notificationType)
                    .data(data)
                    .priority("high")
                    .build();
            
            fcmService.sendNotificationToUser(userId, notificationRequest);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Notification sent successfully"
            ));
            
        } catch (Exception e) {
            log.error("❌ Failed to send notification", e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Failed to send notification: " + e.getMessage()
            ));
        }
    }
}
