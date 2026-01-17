package com.smd.syllabus.service;

import com.smd.syllabus.domain.Notification;
import com.smd.syllabus.domain.NotificationType;
import com.smd.syllabus.domain.SyllabusFollow;
import com.smd.syllabus.repository.NotificationRepository;
import com.smd.syllabus.repository.SyllabusFollowRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SyllabusFollowRepository followRepository;

    public NotificationService(NotificationRepository notificationRepository,
            SyllabusFollowRepository followRepository) {
        this.notificationRepository = notificationRepository;
        this.followRepository = followRepository;
    }

    @Transactional
    public Notification create(String userId,
            NotificationType type,
            String message,
            UUID syllabusRootId,
            UUID syllabusId) {
        if (userId == null || userId.isBlank())
            throw new IllegalArgumentException("userId is required");
        if (type == null)
            throw new IllegalArgumentException("type is required");
        if (message == null || message.isBlank())
            throw new IllegalArgumentException("message is required");

        Notification n = new Notification();
        n.setUserId(userId.trim());
        n.setType(type);
        n.setMessage(message.trim());
        n.setSyllabusRootId(syllabusRootId);
        n.setSyllabusId(syllabusId);
        n.setRead(false);
        n.setReadAt(null);

        return notificationRepository.save(n);
    }

    @Transactional
    public void notifyFollowers(UUID syllabusRootId,
            UUID syllabusId,
            NotificationType type,
            String message,
            String excludeUserId) {

        if (syllabusRootId == null)
            return;

        List<SyllabusFollow> followers = followRepository.findBySyllabusRootId(syllabusRootId);
        Set<String> userIds = followers.stream()
                .map(SyllabusFollow::getUserId)
                .filter(Objects::nonNull)
                .map(String::trim)
                .collect(Collectors.toSet());

        if (excludeUserId != null && !excludeUserId.isBlank()) {
            userIds.remove(excludeUserId.trim());
        }

        for (String uid : userIds) {
            create(uid, type, message, syllabusRootId, syllabusId);
        }
    }

    @Transactional(readOnly = true)
    public List<Notification> list(String userId, boolean unreadOnly) {
        if (userId == null || userId.isBlank())
            throw new IllegalArgumentException("userId is required");
        return unreadOnly
                ? notificationRepository.findTop50ByUserIdAndReadFalseOrderByCreatedAtDesc(userId.trim())
                : notificationRepository.findTop50ByUserIdOrderByCreatedAtDesc(userId.trim());
    }

    @Transactional(readOnly = true)
    public long unreadCount(String userId) {
        if (userId == null || userId.isBlank())
            throw new IllegalArgumentException("userId is required");
        return notificationRepository.countByUserIdAndReadFalse(userId.trim());
    }

    @Transactional
    public Notification markRead(UUID id) {
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found"));
        if (!n.isRead()) {
            n.setRead(true);
            n.setReadAt(Instant.now());
            notificationRepository.save(n);
        }
        return n;
    }

    @Transactional
    public int markAllRead(String userId) {
        List<Notification> list = notificationRepository
                .findTop50ByUserIdAndReadFalseOrderByCreatedAtDesc(userId.trim());
        int cnt = 0;
        for (Notification n : list) {
            n.setRead(true);
            n.setReadAt(Instant.now());
            cnt++;
        }
        notificationRepository.saveAll(list);
        return cnt;
    }

    @Transactional
    public void delete(UUID id) {
        notificationRepository.deleteById(id);
    }
}
