package com.smd.syllabus.repository;

import com.smd.syllabus.domain.Notification;
import com.smd.syllabus.domain.NotificationType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    List<Notification> findTop50ByUserIdOrderByCreatedAtDesc(String userId);

    List<Notification> findTop50ByUserIdAndReadFalseOrderByCreatedAtDesc(String userId);

    long countByUserIdAndReadFalse(String userId);

    boolean existsByUserIdAndTypeAndSyllabusIdAndCreatedAtAfter(
            String userId,
            NotificationType type,
            UUID syllabusId,
            Instant createdAtAfter);
}
