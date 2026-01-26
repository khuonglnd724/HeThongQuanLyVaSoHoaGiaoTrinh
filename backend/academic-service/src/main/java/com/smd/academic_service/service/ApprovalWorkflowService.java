package com.smd.academic_service.service;

import com.smd.academic_service.model.dto.ApprovalValidationResult;
import com.smd.academic_service.model.entity.Syllabus;
import com.smd.academic_service.repository.SyllabusRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Service quản lý workflow phê duyệt 2 cấp độ cho Giáo trình
 * - Cấp độ 1: Trưởng Khoa/Chủ tịch Hội đồng xác minh
 * - Cấp độ 2: Phòng Đào tạo phê duyệt chính thức
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ApprovalWorkflowService {
    
    private final SyllabusRepository syllabusRepository;
    private final ApprovalValidationService approvalValidationService;
    private final SyllabusVersionService syllabusVersionService;
    
    /**
     * Submit syllabus for level 1 approval (Department Head)
     */
    public void submitForLevel1Approval(Long syllabusId, String submittedBy) {
        log.info("Submitting syllabus {} for level 1 approval", syllabusId);
        
        Syllabus syllabus = syllabusRepository.findByIdAndIsActiveTrue(syllabusId)
            .orElseThrow(() -> new com.smd.academic_service.exception.ResourceNotFoundException(
                "Syllabus not found with id: " + syllabusId));
        
        // Validate before submission
        ApprovalValidationResult validationResult = approvalValidationService.validateForApproval(syllabusId);
        
        if (!validationResult.getErrors().isEmpty()) {
            throw new com.smd.academic_service.exception.BusinessException(
                "Cannot submit: " + String.join(", ", validationResult.getErrors()),
                "VALIDATION_ERRORS_EXIST"
            );
        }
        
        syllabus.setStatus("Pending L1 Review");
        syllabus.setApprovalStatus("L1_PENDING");
        syllabus.setUpdatedBy(submittedBy);
        syllabusRepository.save(syllabus);
        
        syllabusVersionService.recordChange(syllabusId, "SUBMIT_L1", 
            "Submitted for level 1 approval", submittedBy);
        
        log.info("Syllabus {} submitted for level 1 approval", syllabusId);
    }
    
    /**
     * Approve at level 1 (Department Head approval)
     */
    public void approveLevel1(Long syllabusId, Long approverId, String comments, String approverName) {
        log.info("Approving syllabus {} at level 1 by {}", syllabusId, approverName);
        
        Syllabus syllabus = syllabusRepository.findByIdAndIsActiveTrue(syllabusId)
            .orElseThrow(() -> new com.smd.academic_service.exception.ResourceNotFoundException(
                "Syllabus not found with id: " + syllabusId));
        
        if (!"L1_PENDING".equals(syllabus.getApprovalStatus())) {
            throw new com.smd.academic_service.exception.BusinessException(
                "Syllabus is not in L1_PENDING status",
                "INVALID_APPROVAL_STATE"
            );
        }
        
        syllabus.setStatus("Pending L2 Review");
        syllabus.setApprovalStatus("L2_PENDING");
        syllabus.setApprovedBy(approverId);
        syllabus.setApprovalComments(comments);
        syllabus.setUpdatedBy(approverName);
        syllabusRepository.save(syllabus);
        
        syllabusVersionService.recordChange(syllabusId, "APPROVE_L1",
            "Level 1 approval: " + comments, approverName);
        
        log.info("Syllabus {} approved at level 1", syllabusId);
    }
    
    /**
     * Reject at level 1 (Department Head rejection)
     */
    public void rejectLevel1(Long syllabusId, Long rejectorId, String reason, String rejectorName) {
        log.info("Rejecting syllabus {} at level 1 by {}", syllabusId, rejectorName);
        
        Syllabus syllabus = syllabusRepository.findByIdAndIsActiveTrue(syllabusId)
            .orElseThrow(() -> new com.smd.academic_service.exception.ResourceNotFoundException(
                "Syllabus not found with id: " + syllabusId));
        
        syllabus.setStatus("Draft");
        syllabus.setApprovalStatus("L1_REJECTED");
        syllabus.setApprovedBy(rejectorId);
        syllabus.setApprovalComments("L1 Rejection: " + reason);
        syllabus.setUpdatedBy(rejectorName);
        syllabusRepository.save(syllabus);
        
        syllabusVersionService.recordChange(syllabusId, "REJECT_L1",
            "Level 1 rejection: " + reason, rejectorName);
        
        log.info("Syllabus {} rejected at level 1", syllabusId);
    }
    
    /**
     * Approve at level 2 (Training Department official approval)
     */
    public void approveLevel2(Long syllabusId, Long approverId, String comments, String approverName) {
        log.info("Approving syllabus {} at level 2 by {}", syllabusId, approverName);
        
        Syllabus syllabus = syllabusRepository.findByIdAndIsActiveTrue(syllabusId)
            .orElseThrow(() -> new com.smd.academic_service.exception.ResourceNotFoundException(
                "Syllabus not found with id: " + syllabusId));
        
        if (!"L2_PENDING".equals(syllabus.getApprovalStatus())) {
            throw new com.smd.academic_service.exception.BusinessException(
                "Syllabus is not in L2_PENDING status",
                "INVALID_APPROVAL_STATE"
            );
        }
        
        syllabus.setStatus("Published");
        syllabus.setApprovalStatus("APPROVED");
        syllabus.setApprovedBy(approverId);
        syllabus.setApprovalComments(comments);
        syllabus.setUpdatedBy(approverName);
        syllabusRepository.save(syllabus);
        
        syllabusVersionService.recordChange(syllabusId, "APPROVE_L2",
            "Official approval (Level 2): " + comments, approverName);
        
        log.info("Syllabus {} officially approved at level 2", syllabusId);
    }
    
    /**
     * Reject at level 2 (Training Department rejection)
     */
    public void rejectLevel2(Long syllabusId, Long rejectorId, String reason, String rejectorName) {
        log.info("Rejecting syllabus {} at level 2 by {}", syllabusId, rejectorName);
        
        Syllabus syllabus = syllabusRepository.findByIdAndIsActiveTrue(syllabusId)
            .orElseThrow(() -> new com.smd.academic_service.exception.ResourceNotFoundException(
                "Syllabus not found with id: " + syllabusId));
        
        syllabus.setStatus("Draft");
        syllabus.setApprovalStatus("L2_REJECTED");
        syllabus.setApprovedBy(rejectorId);
        syllabus.setApprovalComments("L2 Rejection: " + reason);
        syllabus.setUpdatedBy(rejectorName);
        syllabusRepository.save(syllabus);
        
        syllabusVersionService.recordChange(syllabusId, "REJECT_L2",
            "Level 2 rejection: " + reason, rejectorName);
        
        log.info("Syllabus {} rejected at level 2", syllabusId);
    }
}
