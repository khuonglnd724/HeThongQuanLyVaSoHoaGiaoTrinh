package com.smd.syllabus.notification;

import com.smd.syllabus.domain.Syllabus;
import com.smd.syllabus.domain.SyllabusStatus;
import com.smd.syllabus.domain.NotificationType;
import com.smd.syllabus.repository.SyllabusRepository;
import com.smd.syllabus.service.NotificationService;
import com.smd.syllabus.repository.SyllabusFollowRepository;
import com.smd.syllabus.domain.SyllabusFollow;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Component
public class DeadlineReminderScheduler {

    private final SyllabusRepository syllabusRepository;
    private final SyllabusFollowRepository followRepository;
    private final NotificationService notificationService;

    @Value("${smd.deadline.review-hours:72}")
    private long reviewHours;

    @Value("${smd.deadline.approval-hours:72}")
    private long approvalHours;

    @Value("${smd.deadline.reminder-before-hours:6}")
    private long reminderBeforeHours;

    public DeadlineReminderScheduler(SyllabusRepository syllabusRepository,
            SyllabusFollowRepository followRepository,
            NotificationService notificationService) {
        this.syllabusRepository = syllabusRepository;
        this.followRepository = followRepository;
        this.notificationService = notificationService;
    }

    @Scheduled(fixedDelayString = "${smd.deadline.scheduler-fixed-delay-ms:60000}")
    public void run() {
        Instant now = Instant.now();

        // Lọc sơ bộ: lấy pending trong khoảng (deadline + reminder window) gần nhất
        long maxWindowHours = Math.max(reviewHours, approvalHours) + reminderBeforeHours + 6;
        Instant since = now.minus(Duration.ofHours(maxWindowHours));

        List<SyllabusStatus> statuses = List.of(SyllabusStatus.PENDING_REVIEW, SyllabusStatus.PENDING_APPROVAL);
        List<Syllabus> candidates = syllabusRepository.findPendingSince(statuses, since);

        for (Syllabus s : candidates) {
            Instant base = (s.getStatus() == SyllabusStatus.PENDING_REVIEW) ? s.getSubmittedAt() : s.getReviewedAt();
            if (base == null)
                continue;

            long deadlineHours = (s.getStatus() == SyllabusStatus.PENDING_REVIEW) ? reviewHours : approvalHours;
            Instant dueAt = base.plus(Duration.ofHours(deadlineHours));

            Duration remaining = Duration.between(now, dueAt);
            if (remaining.isNegative())
                continue;

            // Trigger khi còn <= reminderBeforeHours
            if (remaining.compareTo(Duration.ofHours(reminderBeforeHours)) > 0)
                continue;

            // followers
            if (s.getRootId() == null)
                continue;
            List<SyllabusFollow> followers = followRepository.findBySyllabusRootId(s.getRootId());

            Set<String> userIds = followers.stream()
                    .map(SyllabusFollow::getUserId)
                    .filter(Objects::nonNull)
                    .map(String::trim)
                    .collect(Collectors.toSet());

            for (String uid : userIds) {
                // Dedupe: tránh spam (1 lần / 12 giờ / syllabus / user)
                Instant after = now.minus(Duration.ofHours(12));
                if (notificationService.hasRecentReminder(uid, s.getId(), after))
                    continue;

                String msg = "Deadline coming: syllabus " +
                        (s.getSubjectCode() == null ? "UNKNOWN" : s.getSubjectCode().trim()) +
                        " due in " + Math.max(0, remaining.toHours()) + " hour(s)";

                notificationService.create(uid, NotificationType.DEADLINE_REMINDER, msg, s.getRootId(), s.getId());
            }
        }
    }
}
