package vn.edu.smd.notification.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.edu.smd.notification.entity.FCMDeviceToken;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface FCMDeviceTokenRepository extends JpaRepository<FCMDeviceToken, Long> {

    Optional<FCMDeviceToken> findByFcmToken(String fcmToken);

    List<FCMDeviceToken> findByUserIdAndIsActiveTrue(Long userId);

    List<FCMDeviceToken> findByUserId(Long userId);

    @Modifying
    @Query("UPDATE FCMDeviceToken t SET t.isActive = false WHERE t.fcmToken = :fcmToken")
    void deactivateToken(@Param("fcmToken") String fcmToken);

    @Modifying
    @Query("UPDATE FCMDeviceToken t SET t.isActive = false WHERE t.userId = :userId")
    void deactivateAllUserTokens(@Param("userId") Long userId);

    @Modifying
    @Query("UPDATE FCMDeviceToken t SET t.lastUsedAt = :lastUsedAt WHERE t.fcmToken = :fcmToken")
    void updateLastUsedAt(@Param("fcmToken") String fcmToken, @Param("lastUsedAt") LocalDateTime lastUsedAt);

    // Clean up old tokens (not used for more than 90 days)
    @Modifying
    @Query("UPDATE FCMDeviceToken t SET t.isActive = false WHERE t.lastUsedAt < :cutoffDate")
    int deactivateOldTokens(@Param("cutoffDate") LocalDateTime cutoffDate);

    boolean existsByFcmToken(String fcmToken);
}
