package com.smd.syllabus.notification;

import org.springframework.stereotype.Component;

@Component
public class NotificationBroadcaster {
    private final NotificationSseHub hub;

    public NotificationBroadcaster(NotificationSseHub hub) {
        this.hub = hub;
    }

    public void notifyUser(String userId, Object payload) {
        hub.push(userId, payload);
    }
}
