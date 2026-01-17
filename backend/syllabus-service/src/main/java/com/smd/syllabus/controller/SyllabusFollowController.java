package com.smd.syllabus.controller;

import com.smd.syllabus.domain.SyllabusFollow;
import com.smd.syllabus.repository.SyllabusFollowRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/syllabuses")
public class SyllabusFollowController {

    private final SyllabusFollowRepository followRepository;

    public SyllabusFollowController(SyllabusFollowRepository followRepository) {
        this.followRepository = followRepository;
    }

    @PostMapping("/{rootId}/follow")
    public void follow(@RequestHeader("X-User-Id") String userId, @PathVariable UUID rootId) {
        String uid = requireUser(userId);
        if (followRepository.existsByUserIdAndSyllabusRootId(uid, rootId))
            return;

        SyllabusFollow f = new SyllabusFollow();
        f.setUserId(uid);
        f.setSyllabusRootId(rootId);
        followRepository.save(f);
    }

    @DeleteMapping("/{rootId}/follow")
    public void unfollow(@RequestHeader("X-User-Id") String userId, @PathVariable UUID rootId) {
        String uid = requireUser(userId);
        followRepository.findByUserIdAndSyllabusRootId(uid, rootId)
                .ifPresent(followRepository::delete);
    }

    @GetMapping("/{rootId}/followers")
    public List<SyllabusFollow> followers(@PathVariable UUID rootId) {
        return followRepository.findBySyllabusRootId(rootId);
    }

    @GetMapping("/{rootId}/is-following")
    public boolean isFollowing(@RequestHeader("X-User-Id") String userId, @PathVariable UUID rootId) {
        String uid = requireUser(userId);
        return followRepository.existsByUserIdAndSyllabusRootId(uid, rootId);
    }

    private String requireUser(String userId) {
        if (userId == null || userId.isBlank())
            throw new IllegalArgumentException("Missing X-User-Id header");
        return userId.trim();
    }
}
