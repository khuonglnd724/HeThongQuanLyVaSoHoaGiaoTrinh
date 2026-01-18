package com.smd.syllabus.controller;

import com.smd.syllabus.domain.Notification;
import com.smd.syllabus.service.NotificationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService service;

    public NotificationController(NotificationService service) {
        this.service = service;
    }

    @GetMapping
    public List<Notification> list(
            @RequestParam String userId,
            @RequestParam(defaultValue = "false") boolean unreadOnly) {
        return service.list(userId, unreadOnly);
    }

    @GetMapping("/unread-count")
    public long unreadCount(@RequestParam String userId) {
        return service.unreadCount(userId);
    }

    @PostMapping("/{id}/read")
    public Notification markRead(@PathVariable UUID id) {
        return service.markRead(id);
    }

    @PostMapping("/mark-all-read")
    public int markAllRead(@RequestParam String userId) {
        return service.markAllRead(userId);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }
}
