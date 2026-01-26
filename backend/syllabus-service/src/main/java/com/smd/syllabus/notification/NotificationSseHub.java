package com.smd.syllabus.notification;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class NotificationSseHub {

    private final Map<String, Set<SseEmitter>> emitters = new ConcurrentHashMap<>();

    public SseEmitter connect(String userId) {
        SseEmitter emitter = new SseEmitter(0L);
        emitters.computeIfAbsent(userId, k -> ConcurrentHashMap.newKeySet()).add(emitter);

        emitter.onCompletion(() -> remove(userId, emitter));
        emitter.onTimeout(() -> remove(userId, emitter));
        emitter.onError(e -> remove(userId, emitter));

        // send hello
        try {
            emitter.send(SseEmitter.event().name("hello").data("connected"));
        } catch (IOException ignored) {}

        return emitter;
    }

    public void push(String userId, Object payload) {
        Set<SseEmitter> set = emitters.getOrDefault(userId, Collections.emptySet());
        if (set.isEmpty()) return;

        List<SseEmitter> dead = new ArrayList<>();
        for (SseEmitter e : set) {
            try {
                e.send(SseEmitter.event().name("notification").data(payload));
            } catch (IOException ex) {
                dead.add(e);
            }
        }
        for (SseEmitter d : dead) remove(userId, d);
    }

    private void remove(String userId, SseEmitter emitter) {
        Set<SseEmitter> set = emitters.get(userId);
        if (set != null) {
            set.remove(emitter);
            if (set.isEmpty()) emitters.remove(userId);
        }
    }
}
