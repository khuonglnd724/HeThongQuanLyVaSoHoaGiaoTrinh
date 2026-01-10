package com.smd.public_service.service;

import com.smd.public_service.model.entity.SyllabusFeedback;
import com.smd.public_service.repository.SyllabusFeedbackRepository;
import com.smd.public_service.repository.SyllabusRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * FeedbackService - Quản lý phản hồi/báo cáo lỗi từ sinh viên
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FeedbackService {
    
    private final SyllabusFeedbackRepository feedbackRepository;
    private final SyllabusRepository syllabusRepository;
    
    /**
     * DTO cho feedback request
     */
    public static class CreateFeedbackRequest {
        public Long syllabusId;
        public Long userId;
        public String userEmail;
        public String feedbackType;  // ERROR, SUGGESTION, QUESTION, OTHER
        public String title;
        public String message;
    }
    
    /**
     * DTO cho feedback response
     */
    public static class FeedbackResponse {
        public Long id;
        public Long syllabusId;
        public String feedbackType;
        public String title;
        public String status;
        public Long createdAt;
        public String response;
    }
    
    /**
     * Gửi phản hồi/báo cáo lỗi
     */
    @Transactional
    public FeedbackResponse createFeedback(CreateFeedbackRequest request) {
        // Kiểm tra giáo trình tồn tại
        syllabusRepository.findById(request.syllabusId)
                .orElseThrow(() -> new RuntimeException("Syllabus not found: " + request.syllabusId));
        
        // Validate feedback
        if (request.title == null || request.title.trim().isEmpty()) {
            throw new IllegalArgumentException("Title is required");
        }
        if (request.message == null || request.message.trim().isEmpty()) {
            throw new IllegalArgumentException("Message is required");
        }
        
        // Create feedback record
        SyllabusFeedback feedback = new SyllabusFeedback();
        feedback.setSyllabusId(request.syllabusId);
        feedback.setUserId(request.userId);
        feedback.setUserEmail(request.userEmail);
        feedback.setFeedbackType(request.feedbackType != null ? request.feedbackType : "OTHER");
        feedback.setTitle(request.title);
        feedback.setMessage(request.message);
        feedback.setStatus("PENDING");
        
        feedback = feedbackRepository.save(feedback);
        log.info("Feedback created for syllabus {}: {}", request.syllabusId, feedback.getId());
        
        return convertToResponse(feedback);
    }
    
    /**
     * Lấy danh sách phản hồi cho một giáo trình
     */
    public Page<FeedbackResponse> getFeedbackForSyllabus(Long syllabusId, int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size);
        Page<SyllabusFeedback> feedbackPage = feedbackRepository.findBySyllabusId(syllabusId, pageable);
        
        return feedbackPage.map(this::convertToResponse);
    }
    
    /**
     * Lấy danh sách feedback chưa được giải quyết
     */
    public List<SyllabusFeedback> getUnresolvedFeedback(Long syllabusId) {
        return feedbackRepository.findUnresolvedFeedback(syllabusId);
    }
    
    /**
     * Admin xem tất cả feedback
     */
    public Page<FeedbackResponse> getAllFeedback(int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size);
        Page<SyllabusFeedback> feedbackPage = feedbackRepository.findAll(pageable);
        
        return feedbackPage.map(this::convertToResponse);
    }
    
    /**
     * Admin lọc feedback theo status
     */
    public Page<FeedbackResponse> getFeedbackByStatus(String status, int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size);
        Page<SyllabusFeedback> feedbackPage = feedbackRepository.findByStatus(status, pageable);
        
        return feedbackPage.map(this::convertToResponse);
    }
    
    /**
     * Admin phản hồi/giải quyết feedback
     */
    @Transactional
    public FeedbackResponse resolveFeedback(Long feedbackId, String response, Long resolvedBy) {
        SyllabusFeedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new RuntimeException("Feedback not found: " + feedbackId));
        
        feedback.setResponse(response);
        feedback.setStatus("RESOLVED");
        feedback.setResolvedBy(resolvedBy);
        feedback.setResolvedAt(System.currentTimeMillis());
        
        feedback = feedbackRepository.save(feedback);
        log.info("Feedback {} resolved", feedbackId);
        
        return convertToResponse(feedback);
    }
    
    /**
     * Đóng feedback
     */
    @Transactional
    public void closeFeedback(Long feedbackId) {
        SyllabusFeedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new RuntimeException("Feedback not found: " + feedbackId));
        
        feedback.setStatus("CLOSED");
        feedbackRepository.save(feedback);
        log.info("Feedback {} closed", feedbackId);
    }
    
    private FeedbackResponse convertToResponse(SyllabusFeedback feedback) {
        FeedbackResponse response = new FeedbackResponse();
        response.id = feedback.getId();
        response.syllabusId = feedback.getSyllabusId();
        response.feedbackType = feedback.getFeedbackType();
        response.title = feedback.getTitle();
        response.status = feedback.getStatus();
        response.createdAt = feedback.getCreatedAt() != null ? 
                feedback.getCreatedAt().atZone(java.time.ZoneId.systemDefault()).toInstant().toEpochMilli() : 0L;
        response.response = feedback.getResponse();
        
        return response;
    }
}
