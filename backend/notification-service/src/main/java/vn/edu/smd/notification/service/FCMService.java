package vn.edu.smd.notification.service;

import com.google.firebase.messaging.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.smd.notification.dto.NotificationRequest;
import vn.edu.smd.notification.entity.FCMDeviceToken;
import vn.edu.smd.notification.entity.Notification;
import vn.edu.smd.notification.repository.FCMDeviceTokenRepository;
import vn.edu.smd.notification.repository.NotificationRepository;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class FCMService {

    private final FCMDeviceTokenRepository tokenRepository;
    private final NotificationRepository notificationRepository;
    private final FirebaseMessaging firebaseMessaging;

    /**
     * Send notification to specific user (all their devices)
     */
    @Transactional
    public void sendNotificationToUser(Long userId, NotificationRequest request) {
        log.info("📤 Sending notification to user: {}", userId);

        // Get all active tokens for user
        List<FCMDeviceToken> tokens = tokenRepository.findByUserIdAndIsActiveTrue(userId);
        
        if (tokens.isEmpty()) {
            log.warn("⚠️ No active FCM tokens found for user: {}", userId);
            return;
        }

        // Save notification to database
        Notification notification = Notification.builder()
                .userId(userId)
                .title(request.getTitle())
                .body(request.getBody())
                .notificationType(request.getNotificationType())
                .syllabusId(request.getSyllabusId())
                .workflowId(request.getWorkflowId())
                .data(request.getData())
                .priority(request.getPriority())
                .build();
        
        notification = notificationRepository.save(notification);

        // Prepare FCM message data
        Map<String, String> data = new HashMap<>();
        data.put("notificationId", notification.getId().toString());
        data.put("type", request.getNotificationType().name());
        if (request.getSyllabusId() != null) {
            data.put("syllabusId", request.getSyllabusId().toString());
        }
        if (request.getWorkflowId() != null) {
            data.put("workflowId", request.getWorkflowId().toString());
        }
        if (request.getData() != null) {
            request.getData().forEach((key, value) -> 
                data.put(key, value != null ? value.toString() : "")
            );
        }

        // Send to all user devices
        int successCount = 0;
        for (FCMDeviceToken token : tokens) {
            try {
                String messageId = sendFCMMessage(
                    token.getFcmToken(), 
                    request.getTitle(), 
                    request.getBody(),
                    data
                );
                
                log.info("✅ Notification sent successfully. MessageId: {}", messageId);
                
                // Update token last used time
                tokenRepository.updateLastUsedAt(token.getFcmToken(), LocalDateTime.now());
                
                // Mark notification as sent
                if (successCount == 0) { // Only mark once
                    notificationRepository.markAsSent(
                        notification.getId(), 
                        LocalDateTime.now(), 
                        messageId
                    );
                }
                
                successCount++;
                
            } catch (FirebaseMessagingException e) {
                log.error("❌ Failed to send notification to token: {}", token.getId(), e);
                
                // Handle invalid tokens
                if (e.getMessagingErrorCode() == MessagingErrorCode.INVALID_ARGUMENT ||
                    e.getMessagingErrorCode() == MessagingErrorCode.UNREGISTERED) {
                    log.warn("🗑️ Deactivating invalid token: {}", token.getId());
                    tokenRepository.deactivateToken(token.getFcmToken());
                }
            }
        }

        log.info("✅ Notification sent to {}/{} devices for user {}", 
                successCount, tokens.size(), userId);
    }

    /**
     * Send notification to multiple users
     */
    public void sendNotificationToUsers(List<Long> userIds, NotificationRequest request) {
        log.info("📤 Sending notification to {} users", userIds.size());
        
        for (Long userId : userIds) {
            try {
                sendNotificationToUser(userId, request);
            } catch (Exception e) {
                log.error("❌ Failed to send notification to user: {}", userId, e);
            }
        }
    }

    /**
     * Send FCM message using Firebase Admin SDK
     */
    private String sendFCMMessage(String token, String title, String body, Map<String, String> data) 
            throws FirebaseMessagingException {
        
        // Build notification
        com.google.firebase.messaging.Notification notification = 
            com.google.firebase.messaging.Notification.builder()
                .setTitle(title)
                .setBody(body)
                .build();

        // Build message
        Message message = Message.builder()
            .setToken(token)
            .setNotification(notification)
            .putAllData(data)
            .setWebpushConfig(WebpushConfig.builder()
                .setNotification(WebpushNotification.builder()
                    .setTitle(title)
                    .setBody(body)
                    .setIcon("/logo192.png")
                    .setBadge("/favicon.ico")
                    .build())
                .setFcmOptions(WebpushFcmOptions.builder()
                    .setLink("/") // Default link
                    .build())
                .build())
            .build();

        // Send message
        return firebaseMessaging.send(message);
    }

    /**
     * Register FCM token
     */
    @Transactional
    public void registerToken(Long userId, String fcmToken, FCMDeviceToken.DeviceType deviceType, 
                             String browser, String deviceName) {
        log.info("📝 Registering FCM token for user: {}", userId);

        // Check if token already exists
        FCMDeviceToken existingToken = tokenRepository.findByFcmToken(fcmToken).orElse(null);
        
        if (existingToken != null) {
            // Update existing token
            existingToken.setUserId(userId);
            existingToken.setDeviceType(deviceType);
            existingToken.setBrowser(browser);
            existingToken.setDeviceName(deviceName);
            existingToken.setIsActive(true);
            existingToken.setLastUsedAt(LocalDateTime.now());
            tokenRepository.save(existingToken);
            log.info("✅ Updated existing token: {}", existingToken.getId());
        } else {
            // Create new token
            FCMDeviceToken newToken = FCMDeviceToken.builder()
                    .userId(userId)
                    .fcmToken(fcmToken)
                    .deviceType(deviceType)
                    .browser(browser)
                    .deviceName(deviceName)
                    .isActive(true)
                    .lastUsedAt(LocalDateTime.now())
                    .build();
            
            tokenRepository.save(newToken);
            log.info("✅ Registered new token for user: {}", userId);
        }
    }

    /**
     * Unregister FCM token
     */
    @Transactional
    public void unregisterToken(String fcmToken) {
        log.info("🗑️ Unregistering FCM token");
        tokenRepository.deactivateToken(fcmToken);
    }

    /**
     * Clean up old tokens (maintenance task)
     */
    @Transactional
    public void cleanupOldTokens() {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(90);
        int count = tokenRepository.deactivateOldTokens(cutoffDate);
        log.info("🧹 Deactivated {} old tokens", count);
    }
}
