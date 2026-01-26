package com.smd.public_service.service;

import com.smd.public_service.model.entity.SyllabusFollow;
import com.smd.public_service.repository.SyllabusFollowRepository;
import com.smd.public_service.repository.SyllabusRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * FollowService - Quản lý theo dõi/subscribe giáo trình
 * Sinh viên có thể nhận email/thông báo khi giáo trình thay đổi
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FollowService {
    
    private final SyllabusFollowRepository followRepository;
    private final SyllabusRepository syllabusRepository;
    
    /**
     * DTO cho follow response
     */
    public static class FollowResponse {
        public boolean isFollowing;
        public long followedAt;
        public boolean notifyOnChange;
    }
    
    /**
     * Follow (theo dõi) một giáo trình
     */
    @Transactional
    public FollowResponse followSyllabus(Long syllabusId, Long userId, String email) {
        // Kiểm tra giáo trình tồn tại
        syllabusRepository.findById(syllabusId)
                .orElseThrow(() -> new RuntimeException("Syllabus not found: " + syllabusId));
        
        // Kiểm tra đã follow chưa
        Optional<SyllabusFollow> existing = followRepository.findBySyllabusIdAndUserId(syllabusId, userId);
        
        SyllabusFollow follow;
        if (existing.isPresent()) {
            follow = existing.get();
            log.info("User {} already following syllabus {}", userId, syllabusId);
        } else {
            follow = new SyllabusFollow();
            follow.setSyllabusId(syllabusId);
            follow.setUserId(userId);
            follow.setEmail(email);
            follow.setNotifyOnChange(true);
            follow.setFollowedAt(System.currentTimeMillis());
            followRepository.save(follow);
            log.info("User {} started following syllabus {}", userId, syllabusId);
        }
        
        return convertToResponse(follow);
    }
    
    /**
     * Unfollow (hủy theo dõi) một giáo trình
     */
    @Transactional
    public void unfollowSyllabus(Long syllabusId, Long userId) {
        Optional<SyllabusFollow> follow = followRepository.findBySyllabusIdAndUserId(syllabusId, userId);
        
        if (follow.isPresent()) {
            followRepository.delete(follow.get());
            log.info("User {} unfollowed syllabus {}", userId, syllabusId);
        } else {
            log.warn("User {} was not following syllabus {}", userId, syllabusId);
        }
    }
    
    /**
     * Kiểm tra user có đang follow giáo trình này không
     */
    public boolean isFollowing(Long syllabusId, Long userId) {
        return followRepository.existsBySyllabusIdAndUserId(syllabusId, userId);
    }
    
    /**
     * Lấy danh sách người follow một giáo trình (để gửi thông báo)
     */
    public List<SyllabusFollow> getFollowersToNotify(Long syllabusId) {
        return followRepository.findFollowersToNotify(syllabusId);
    }
    
    /**
     * Lấy danh sách giáo trình mà user đang follow
     */
    public List<SyllabusFollow> getUserFollows(Long userId) {
        return followRepository.findByUserId(userId);
    }
    
    /**
     * Toggle notification setting
     */
    @Transactional
    public FollowResponse toggleNotification(Long syllabusId, Long userId) {
        SyllabusFollow follow = followRepository.findBySyllabusIdAndUserId(syllabusId, userId)
                .orElseThrow(() -> new RuntimeException("Follow record not found"));
        
        follow.setNotifyOnChange(!follow.getNotifyOnChange());
        follow = followRepository.save(follow);
        
        return convertToResponse(follow);
    }
    
    private FollowResponse convertToResponse(SyllabusFollow follow) {
        FollowResponse response = new FollowResponse();
        response.isFollowing = true;
        response.followedAt = follow.getFollowedAt();
        response.notifyOnChange = follow.getNotifyOnChange();
        
        return response;
    }
    
    /**
     * Get count of followers for a syllabus
     */
    public Long getFollowCount(Long syllabusId) {
        return followRepository.countBySyllabusId(syllabusId);
    }
}
