package com.smd.public_service.controller;

import com.smd.public_service.dto.*;
import com.smd.public_service.model.entity.Syllabus;
import com.smd.public_service.service.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

/**
 * SyllabusDetailController - Xử lý các endpoint chi tiết giáo trình
 * - Lấy chi tiết giáo trình
 * - Lấy cây môn học (relationship)
 * - So sánh phiên bản
 * - Theo dõi/subscribe
 * - Gửi phản hồi
 * - Export PDF
 */
@RestController
@RequestMapping("/api/public/syllabi")
@RequiredArgsConstructor
@Slf4j
public class SyllabusDetailController {
    
    private final SyllabusSearchService searchService;
    private final TreeViewService treeViewService;
    private final SyllabusDiffService diffService;
    private final FollowService followService;
    private final FeedbackService feedbackService;
    private final PdfExportService pdfExportService;
    
    /**
     * GET /api/public/syllabi/{id}
     * Lấy chi tiết giáo trình (read-only)
     */
    @GetMapping("/{id}")
    @Cacheable(value = "syllabi", key = "#id")
    public ResponseEntity<SyllabusDetailDto> getSyllabusDetail(@PathVariable Long id) {
        log.info("Fetching syllabus detail for id: {}", id);
        
        try {
            SyllabusDetailDto detail = convertToDetailDto(searchService.getSyllabusById(id));
            
            return ResponseEntity.ok(detail);
        } catch (Exception e) {
            log.error("Error fetching syllabus detail: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * GET /api/public/syllabi/{id}/tree
     * Lấy cây môn học (mối quan hệ giữa các môn: prerequisites và dependents)
     */
    @GetMapping("/{id}/tree")
    @Cacheable(value = "treeView", key = "#id")
    public ResponseEntity<?> getSubjectTree(@PathVariable Long id) {
        log.info("Fetching subject tree for syllabus id: {}", id);
        
        try {
            Syllabus syllabus = searchService.getSyllabusById(id);
            TreeViewService.SubjectTreeNode tree = treeViewService.buildTree(syllabus.getSubject().getId());
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", id);
            response.put("subject", tree);
            response.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching tree view: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * GET /api/public/syllabi/{id}/diff?targetVersion={version}
     * So sánh 2 phiên bản giáo trình
     */
    @GetMapping("/{id}/diff")
    @Cacheable(value = "diff", key = "#id + '-' + #targetVersion")
    public ResponseEntity<?> getDiff(
            @PathVariable Long id,
            @RequestParam(value = "targetVersion", required = false) Integer targetVersion) {
        
        log.info("Fetching diff for syllabus id: {} with target version: {}", id, targetVersion);
        
        try {
            Syllabus currentSyllabus = searchService.getSyllabusById(id);
            
            if (targetVersion == null) {
                targetVersion = currentSyllabus.getVersion() - 1;
                if (targetVersion < 1) {
                    return ResponseEntity.badRequest().body(
                            Map.of("error", "No previous version available for comparison")
                    );
                }
            }
            
            SyllabusDiffService.DiffResult diff = diffService.compareSyllabi(
                    currentSyllabus.getSubject().getId(),
                    targetVersion,
                    currentSyllabus.getVersion()
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", id);
            response.put("diff", diff);
            response.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching diff: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * POST /api/public/syllabi/{id}/follow
     * Theo dõi/subscribe giáo trình
     */
    @PostMapping("/{id}/follow")
    public ResponseEntity<FollowResponseDto> followSyllabus(
            @PathVariable Long id,
            @RequestParam(value = "userId", required = false) Long userId,
            @RequestParam(value = "email", required = false) String email) {
        
        log.info("User {} following syllabus {}", userId, id);
        
        try {
            FollowService.FollowResponse followResult = followService.followSyllabus(id, userId, email);
            
            FollowResponseDto response = new FollowResponseDto();
            response.setSyllabusId(id);
            response.setIsFollowing(followResult.isFollowing);
            response.setFollowedAt(followResult.followedAt);
            response.setNotifyOnChange(followResult.notifyOnChange);
            response.setFollowCount(followService.getFollowCount(id));
            response.setMessage("Successfully followed syllabus");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error following syllabus: {}", e.getMessage());
            FollowResponseDto response = new FollowResponseDto();
            response.setMessage("Error: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * DELETE /api/public/syllabi/{id}/follow
     * Unfollow giáo trình
     */
    @DeleteMapping("/{id}/follow")
    public ResponseEntity<Map<String, String>> unfollowSyllabus(
            @PathVariable Long id,
            @RequestParam(value = "userId", required = false) Long userId) {
        
        log.info("User {} unfollowing syllabus {}", userId, id);
        
        try {
            followService.unfollowSyllabus(id, userId);
            
            return ResponseEntity.ok(Map.of(
                    "message", "Successfully unfollowed syllabus",
                    "syllabusId", String.valueOf(id)
            ));
        } catch (Exception e) {
            log.error("Error unfollowing syllabus: {}", e.getMessage());
            return ResponseEntity.badRequest().body(
                    Map.of("error", e.getMessage())
            );
        }
    }
    
    /**
     * POST /api/public/feedback
     * Gửi phản hồi/báo cáo lỗi
     */
    @PostMapping("/feedback")
    public ResponseEntity<FeedbackResponseDto> sendFeedback(
            @RequestBody FeedbackRequestDto request) {
        
        log.info("Received feedback for syllabus {}: {}", 
                request.getSyllabusId(), request.getFeedbackType());
        
        try {
            FeedbackService.CreateFeedbackRequest feedbackRequest = new FeedbackService.CreateFeedbackRequest();
            feedbackRequest.syllabusId = request.getSyllabusId();
            feedbackRequest.userId = request.getUserId();
            feedbackRequest.userEmail = request.getUserEmail();
            feedbackRequest.feedbackType = request.getFeedbackType();
            feedbackRequest.title = request.getTitle();
            feedbackRequest.message = request.getMessage();
            
            FeedbackService.FeedbackResponse feedbackResponse = feedbackService.createFeedback(feedbackRequest);
            
            FeedbackResponseDto response = new FeedbackResponseDto();
            response.setId(feedbackResponse.id);
            response.setSyllabusId(feedbackResponse.syllabusId);
            response.setFeedbackType(feedbackResponse.feedbackType);
            response.setTitle(feedbackResponse.title);
            response.setStatus(feedbackResponse.status);
            response.setCreatedAt(feedbackResponse.createdAt);
            response.setMessageSuccess("Feedback submitted successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error submitting feedback: {}", e.getMessage());
            FeedbackResponseDto response = new FeedbackResponseDto();
            response.setMessageSuccess("Error: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * GET /api/public/syllabi/{id}/export-pdf
     * Export giáo trình thành PDF
     */
    @GetMapping("/{id}/export-pdf")
    public ResponseEntity<?> exportPdf(@PathVariable Long id) {
        log.info("Exporting syllabus {} data", id);
        
        try {
            var exportData = pdfExportService.exportSyllabusData(id);
            return ResponseEntity.ok(exportData);
        } catch (RuntimeException e) {
            log.error("Error exporting data: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error exporting data: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Helper method to convert Syllabus entity to SyllabusDetailDto
     */
    private SyllabusDetailDto convertToDetailDto(Syllabus syllabus) {
        SyllabusDetailDto dto = new SyllabusDetailDto();
        dto.setId(syllabus.getId());
        dto.setSyllabusCode(syllabus.getSyllabusCode());
        dto.setVersion(syllabus.getVersion());
        dto.setAcademicYear(syllabus.getAcademicYear());
        dto.setSemester(syllabus.getSemester());
        
        SubjectDto subjectDto = new SubjectDto();
        subjectDto.setId(syllabus.getSubject().getId());
        subjectDto.setSubjectCode(syllabus.getSubject().getSubjectCode());
        subjectDto.setSubjectName(syllabus.getSubject().getSubjectName());
        dto.setSubject(subjectDto);
        
        dto.setContent(syllabus.getContent());
        dto.setLearningObjectives(syllabus.getLearningObjectives());
        dto.setTeachingMethods(syllabus.getTeachingMethods());
        dto.setAssessmentMethods(syllabus.getAssessmentMethods());
        dto.setStatus(syllabus.getStatus());
        dto.setUpdatedAt(syllabus.getUpdatedAt() != null ? 
                syllabus.getUpdatedAt().format(DateTimeFormatter.ISO_DATE_TIME) : null);
        dto.setApprovalComments(syllabus.getApprovalComments());
        
        return dto;
    }
}
