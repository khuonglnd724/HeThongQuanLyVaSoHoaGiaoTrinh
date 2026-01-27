package com.smd.syllabus.controller;

import com.smd.syllabus.domain.Syllabus;
import com.smd.syllabus.domain.SyllabusFollow;
import com.smd.syllabus.repository.SyllabusFollowRepository;
import com.smd.syllabus.repository.SyllabusRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/syllabuses")
public class SyllabusFollowController {

    private final SyllabusFollowRepository followRepository;
    private final SyllabusRepository syllabusRepository;

    public SyllabusFollowController(SyllabusFollowRepository followRepository, SyllabusRepository syllabusRepository) {
        this.followRepository = followRepository;
        this.syllabusRepository = syllabusRepository;
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

    /**
     * Get list of syllabuses that the current user is following
     * GET /api/syllabuses/my-followed
     */
    @GetMapping("/my-followed")
    public List<Map<String, Object>> getMyFollowedSyllabuses(@RequestHeader("X-User-Id") String userId) {
        String uid = requireUser(userId);
        
        // Get all follow records for this user
        List<SyllabusFollow> follows = followRepository.findByUserIdOrderByCreatedAtDesc(uid);
        
        // Get the latest version of each followed syllabus
        return follows.stream()
            .map(follow -> {
                UUID rootId = follow.getSyllabusRootId();
                // Find the latest version of this syllabus
                Syllabus latestSyllabus = syllabusRepository.findTopByRootIdOrderByVersionNoDesc(rootId)
                    .orElse(null);
                
                if (latestSyllabus == null) {
                    return null;
                }
                
                Map<String, Object> result = new java.util.HashMap<>();
                result.put("id", latestSyllabus.getId().toString());
                result.put("rootId", rootId.toString());
                result.put("subjectCode", latestSyllabus.getSubjectCode() != null ? latestSyllabus.getSubjectCode() : "");
                result.put("subjectName", latestSyllabus.getSubjectName() != null ? latestSyllabus.getSubjectName() : "");
                result.put("summary", latestSyllabus.getSummary() != null ? latestSyllabus.getSummary() : "");
                result.put("status", latestSyllabus.getStatus() != null ? latestSyllabus.getStatus().name() : "");
                result.put("versionNo", latestSyllabus.getVersionNo());
                result.put("createdBy", latestSyllabus.getCreatedBy() != null ? latestSyllabus.getCreatedBy() : "");
                result.put("followedAt", follow.getCreatedAt() != null ? follow.getCreatedAt().toString() : "");
                return result;
            })
            .filter(item -> item != null)
            .collect(Collectors.toList());
    }

    private String requireUser(String userId) {
        if (userId == null || userId.isBlank())
            throw new IllegalArgumentException("Missing X-User-Id header");
        return userId.trim();
    }
}
