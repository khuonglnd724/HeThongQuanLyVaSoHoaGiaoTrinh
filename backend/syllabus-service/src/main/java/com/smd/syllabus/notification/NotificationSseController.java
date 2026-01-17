package com.smd.syllabus.notification;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/notifications")
public class NotificationSseController {

    private final NotificationSseHub hub;

    public NotificationSseController(NotificationSseHub hub) {
        this.hub = hub;
    }

    @GetMapping("/stream")
    public SseEmitter stream(@RequestParam("userId") String userId) {
        return hub.connect(userId);
    }
}
