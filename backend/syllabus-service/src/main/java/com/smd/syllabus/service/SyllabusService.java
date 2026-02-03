package com.smd.syllabus.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smd.syllabus.domain.NotificationType;
import com.smd.syllabus.domain.Syllabus;
import com.smd.syllabus.domain.SyllabusStatus;
import com.smd.syllabus.dto.CreateSyllabusRequest;
import com.smd.syllabus.dto.SyllabusMapper;
import com.smd.syllabus.dto.SyllabusResponse;
import com.smd.syllabus.dto.UpdateSyllabusRequest;
import com.smd.syllabus.repository.SyllabusRepository;
import com.smd.syllabus.repository.SyllabusDocumentRepository;
import com.smd.syllabus.domain.SyllabusDocument;
import com.smd.syllabus.event.SyllabusKafkaEventPublisher;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import com.smd.syllabus.client.WorkflowClient;

@Service
public class SyllabusService {

    private final SyllabusRepository syllabusRepository;
    private final NotificationService notificationService;
    private final SyllabusDocumentRepository documentRepository;
    private final WorkflowClient workflowClient;
    private final ReviewCommentService reviewCommentService;
    private final SyllabusKafkaEventPublisher eventPublisher;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public SyllabusService(SyllabusRepository syllabusRepository,
            NotificationService notificationService,
            SyllabusDocumentRepository documentRepository,
            WorkflowClient workflowClient,
            ReviewCommentService reviewCommentService,
            SyllabusKafkaEventPublisher eventPublisher) {
        this.syllabusRepository = syllabusRepository;
        this.notificationService = notificationService;
        this.documentRepository = documentRepository;
        this.workflowClient = workflowClient;
        this.reviewCommentService = reviewCommentService;
        this.eventPublisher = eventPublisher;
    }

    // helper
    private String normalizeContent(Object content) {
        if (content == null)
            return null;
        if (content instanceof String s)
            return s;
        try {
            return objectMapper.writeValueAsString(content);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Invalid content payload (cannot serialize to JSON)", e);
        }
    }

    private String requireUser(String userId) {
        if (userId == null || userId.isBlank())
            throw new IllegalArgumentException("Missing X-User-Id");
        return userId.trim();
    }

    private Syllabus getOrThrow(UUID id) {
        return syllabusRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Syllabus not found: " + id));
    }

    private String safeCode(Syllabus s) {
        String code = s.getSubjectCode();
        return (code == null || code.isBlank()) ? "UNKNOWN" : code.trim();
    }

    // =========================
    // CREATE / VERSIONING
    // =========================

    @Transactional
    public SyllabusResponse createDraft(CreateSyllabusRequest req, String userId) {
        String actor = requireUser(userId);

        Syllabus s = new Syllabus();
        s.setSubjectCode(req.getSubjectCode().trim());
        s.setSubjectName(req.getSubjectName().trim());
        s.setSummary(req.getSummary());
        s.setStatus(SyllabusStatus.DRAFT);
        s.setCreatedBy(actor);
        s.setUpdatedBy(actor);

        s.setContent(normalizeContent(req.getContent()));

        Syllabus saved = syllabusRepository.save(s);

        // rootId = id cho version 1
        if (saved.getRootId() == null || !saved.getRootId().equals(saved.getId())) {
            saved.setRootId(saved.getId());
            saved = syllabusRepository.save(saved);
        }

        return SyllabusMapper.toResponse(saved);
    }

    @Transactional
    public SyllabusResponse updateAsNewVersion(UUID rootId, UpdateSyllabusRequest req, String userId) {
        String actor = requireUser(userId);

        Syllabus latest = syllabusRepository.findTopByRootIdOrderByVersionNoDesc(rootId)
                .orElseThrow(() -> new EntityNotFoundException("Syllabus rootId not found: " + rootId));

        int nextVersion = syllabusRepository.findMaxVersionNo(rootId) + 1;

        Syllabus nv = new Syllabus();
        nv.setRootId(latest.getRootId());
        nv.setSubjectCode(latest.getSubjectCode());

        nv.setSubjectName(req.getSubjectName() != null && !req.getSubjectName().isBlank()
                ? req.getSubjectName().trim()
                : latest.getSubjectName());

        nv.setSummary(req.getSummary() != null ? req.getSummary() : latest.getSummary());

        nv.setVersionNo(nextVersion);
        nv.setStatus(SyllabusStatus.DRAFT);
        nv.setCreatedBy(latest.getCreatedBy());
        nv.setUpdatedBy(actor);

        Object incoming = req.getContent();
        if (incoming != null)
            nv.setContent(normalizeContent(incoming));
        else
            nv.setContent(latest.getContent());

        Syllabus saved = syllabusRepository.save(nv);

        // Copy existing documents from the latest version into the new version
        try {
            List<SyllabusDocument> docs = documentRepository.findBySyllabusIdAndDeletedFalse(latest.getId());
            if (docs != null && !docs.isEmpty()) {
                for (SyllabusDocument d : docs) {
                    SyllabusDocument copy = new SyllabusDocument();
                    copy.setSyllabusId(saved.getId());
                    copy.setFileName(d.getFileName());
                    copy.setOriginalName(d.getOriginalName());
                    copy.setFilePath(d.getFilePath());
                    copy.setMimeType(d.getMimeType());
                    copy.setFileSize(d.getFileSize());
                    copy.setFileType(d.getFileType());
                    copy.setUploadedBy(d.getUploadedBy());
                    copy.setSyllabusVersion(saved.getVersionNo());
                    copy.setStatus(d.getStatus());
                    copy.setDescription(d.getDescription());
                    documentRepository.save(copy);
                }
            }
        } catch (Exception ex) {
            // Do not fail version creation if document copy fails; log and continue
            // Logging via System.err to avoid adding logger here; keep behavior simple
            System.err.println("Failed to copy syllabus documents to new version: " + ex.getMessage());
        }

        return SyllabusMapper.toResponse(saved);
    }

    // =========================
    // READ
    // =========================

    @Transactional(readOnly = true)
    public Page<SyllabusResponse> search(String q, SyllabusStatus status, Pageable pageable) {
        return syllabusRepository.search(q, status, pageable).map(SyllabusMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public SyllabusResponse getById(UUID id) {
        Syllabus s = getOrThrow(id);
        SyllabusResponse response = SyllabusMapper.toResponse(s);
        

        if (s.getStatus() == SyllabusStatus.REJECTED) {
            reviewCommentService.list(id).stream()
                    .filter(c -> "REJECTION".equals(c.getSectionKey()))
                    .findFirst()
                    .ifPresent(c -> response.setRejectionReason(c.getContent()));
        }
        
        return response;
    }

    @Transactional(readOnly = true)
    public List<SyllabusResponse> listVersions(UUID rootId) {
        return syllabusRepository.findByRootIdOrderByVersionNoDesc(rootId)
                .stream()
                .map(SyllabusMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SyllabusResponse> compare(UUID rootId, int v1, int v2) {
        List<Integer> versions = Arrays.asList(v1, v2);
        List<Syllabus> found = syllabusRepository.findForCompare(rootId, versions);

        Map<Integer, Syllabus> map = new HashMap<>();
        for (Syllabus s : found)
            map.put(s.getVersionNo(), s);

        List<SyllabusResponse> out = new ArrayList<>();
        if (map.containsKey(v1))
            out.add(SyllabusMapper.toResponse(map.get(v1)));
        if (map.containsKey(v2))
            out.add(SyllabusMapper.toResponse(map.get(v2)));
        return out;
    }

    // =========================
    // WORKFLOW + NOTIFY (SSE)
    // =========================

    @Transactional
    public SyllabusResponse submit(UUID id, String userId, String userRoles) {
        String actor = requireUser(userId);
        Syllabus s = getOrThrow(id);
        // Extract first role from comma-separated list or default to ROLE_LECTURER
        String roleToUse = (userRoles != null && !userRoles.isEmpty()) 
            ? userRoles.split(",\\s*")[0].trim()
            : "ROLE_LECTURER";

        if (s.getStatus() != SyllabusStatus.DRAFT) {
            throw new IllegalStateException("Only DRAFT syllabus can be submitted");
        }

        s.setStatus(SyllabusStatus.PENDING_REVIEW);
        s.setSubmittedAt(Instant.now());
        s.setUpdatedBy(actor);
        s.setLastActionBy(actor);

        s.setRejectionReason(null);
        s.setRejectedAt(null);

        Syllabus saved = syllabusRepository.save(s);

        // Create workflow instance if missing and submit event to workflow-service
        try {
            if (saved.getWorkflowId() == null) {
                UUID workflowId = workflowClient.create(saved.getId());
                saved.setWorkflowId(workflowId);
                if (workflowId != null) {
                    saved = syllabusRepository.save(saved);
                }
            }
            if (saved.getWorkflowId() != null) {
                workflowClient.submit(saved.getWorkflowId(), actor, roleToUse);
            }
        } catch (Exception ex) {
            // Do not fail submit if workflow service is unavailable; log and continue
            System.err.println("Workflow submit failed: " + ex.getMessage());
            ex.printStackTrace();
        }

        notificationService.notifyFollowers(
                saved.getRootId(),
                saved.getId(),
                NotificationType.SYLLABUS_SUBMITTED,
                "Syllabus " + safeCode(saved) + " submitted for review",
                actor);

        // Publish Kafka event for notification-service
        // In real scenario, get approver from workflow or user management service
        // For now, use hardcoded approver info as example
        try {
            Long approverId = getNextApprover(actor, roleToUse);
            String approverRole = getApproverRole(roleToUse);
            
            eventPublisher.publishSyllabusSubmitted(
                Long.valueOf(saved.getId().toString().hashCode()), // Simple ID conversion for demo
                saved.getSubjectName(),
                Long.valueOf(actor.hashCode()),
                actor,
                approverId,
                "Approver", // In real scenario, get from user service
                approverRole
            );
        } catch (Exception e) {
            System.err.println("Failed to publish Kafka event: " + e.getMessage());
        }

        return SyllabusMapper.toResponse(saved);
    }

    // Helper method to determine next approver based on submitter role
    private Long getNextApprover(String submitter, String role) {
        // In real scenario, query from user management or workflow service
        // For demo: if LECTURER submits -> HOD approves (userId=3)
        //           if HOD approves -> ACADEMIC_AFFAIRS (userId=4)
        //           if ACADEMIC_AFFAIRS approves -> RECTOR (userId=5)
        if (role.contains("LECTURER")) {
            return 3L; // HOD
        } else if (role.contains("HOD")) {
            return 4L; // Academic Affairs
        } else if (role.contains("ACADEMIC")) {
            return 5L; // Rector
        }
        return 3L; // Default to HOD
    }

    private String getApproverRole(String submitterRole) {
        if (submitterRole.contains("LECTURER")) {
            return "HOD";
        } else if (submitterRole.contains("HOD")) {
            return "ACADEMIC_AFFAIRS";
        } else if (submitterRole.contains("ACADEMIC")) {
            return "RECTOR";
        }
        return "HOD";
    }

    @Transactional
    public SyllabusResponse reviewApprove(UUID id, String userId) {
        String actor = requireUser(userId);
        Syllabus s = getOrThrow(id);

        if (s.getStatus() != SyllabusStatus.PENDING_REVIEW) {
            throw new IllegalStateException("Syllabus not in PENDING_REVIEW");
        }

        s.setStatus(SyllabusStatus.PENDING_APPROVAL);
        s.setReviewedAt(Instant.now());
        s.setUpdatedBy(actor);
        s.setLastActionBy(actor);

        Syllabus saved = syllabusRepository.save(s);

        try {
            if (saved.getWorkflowId() != null) {
                workflowClient.approve(saved.getWorkflowId(), actor, "ROLE_HOD");
            }
        } catch (Exception ex) {
            System.err.println("Workflow approve (HoD) failed: " + ex.getMessage());
        }

        // (tuỳ bạn) có thể bỏ notify bước trung gian này nếu không cần
        notificationService.notifyFollowers(
                saved.getRootId(),
                saved.getId(),
                NotificationType.SYLLABUS_SUBMITTED,
                "Syllabus " + safeCode(saved) + " moved to approval",
                actor);

        // Publish Kafka event - HOD approved, notify next approver (Academic Affairs)
        try {
            Long nextApproverId = 4L; // Academic Affairs
            String nextApproverRole = "ACADEMIC_AFFAIRS";
            
            eventPublisher.publishWorkflowStatusChanged(
                Long.valueOf(saved.getId().toString().hashCode()),
                saved.getSubjectName(),
                "APPROVED",
                Long.valueOf(actor.hashCode()),
                actor,
                "HOD",
                Long.valueOf(saved.getCreatedBy().hashCode()),
                saved.getCreatedBy(),
                "HOD approved, forwarding to Academic Affairs",
                nextApproverId,
                nextApproverRole
            );
        } catch (Exception e) {
            System.err.println("Failed to publish workflow event: " + e.getMessage());
        }

        return SyllabusMapper.toResponse(saved);
    }

    @Transactional
    public SyllabusResponse approve(UUID id, String userId) {
        String actor = requireUser(userId);
        Syllabus s = getOrThrow(id);

        if (s.getStatus() != SyllabusStatus.PENDING_APPROVAL) {
            throw new IllegalStateException("Syllabus not in PENDING_APPROVAL");
        }

        s.setStatus(SyllabusStatus.APPROVED);
        s.setApprovedAt(Instant.now());
        s.setUpdatedBy(actor);
        s.setLastActionBy(actor);

        Syllabus saved = syllabusRepository.save(s);

        try {
            if (saved.getWorkflowId() != null) {
                workflowClient.approve(saved.getWorkflowId(), actor, "ROLE_RECTOR");
            }
        } catch (Exception ex) {
            System.err.println("Workflow approve (final) failed: " + ex.getMessage());
        }

        notificationService.notifyFollowers(
                saved.getRootId(),
                saved.getId(),
                NotificationType.SYLLABUS_APPROVED,
                "Syllabus " + safeCode(saved) + " approved",
                actor);

        return SyllabusMapper.toResponse(saved);
    }

    @Transactional
    public SyllabusResponse publish(UUID id, String userId) {
        String actor = requireUser(userId);
        Syllabus s = getOrThrow(id);

        if (s.getStatus() != SyllabusStatus.APPROVED) {
            throw new IllegalStateException("Only APPROVED syllabus can be published");
        }

        s.setStatus(SyllabusStatus.PUBLISHED);
        s.setPublishedAt(Instant.now());
        s.setUpdatedBy(actor);
        s.setLastActionBy(actor);

        Syllabus saved = syllabusRepository.save(s);

        notificationService.notifyFollowers(
                saved.getRootId(),
                saved.getId(),
                NotificationType.SYLLABUS_PUBLISHED,
                "Syllabus " + safeCode(saved) + " published",
                actor);

        return SyllabusMapper.toResponse(saved);
    }

    @Transactional
    public SyllabusResponse reject(UUID id, String userId, String reason) {
        String actor = requireUser(userId);
        Syllabus s = getOrThrow(id);

        SyllabusStatus previousStatus = s.getStatus();

        if (s.getStatus() != SyllabusStatus.PENDING_REVIEW && s.getStatus() != SyllabusStatus.PENDING_APPROVAL) {
            throw new IllegalStateException("Syllabus not in a rejectable status");
        }

        s.setStatus(SyllabusStatus.REJECTED);
        s.setRejectedAt(Instant.now());
        s.setRejectionReason(reason);  // ✅ Save rejection reason to syllabus.rejection_reason column
        s.setUpdatedBy(actor);
        s.setLastActionBy(actor);

        Syllabus saved = syllabusRepository.save(s);

        if (reason != null && !reason.isBlank()) {
            try {
                reviewCommentService.add(
                        saved.getId(),
                        "REJECTION",
                        reason.trim(),
                        Long.parseLong(userId)
                );
            } catch (Exception ex) {
                System.err.println("Failed to save rejection reason to review_comment: " + ex.getMessage());
            }
        }

        String msg = "Syllabus " + safeCode(saved) + " rejected";
        if (reason != null && !reason.isBlank())
            msg += ": " + reason.trim();

        try {
            if (saved.getWorkflowId() != null) {
                String role = (previousStatus == SyllabusStatus.PENDING_REVIEW) ? "ROLE_HOD" : "ROLE_RECTOR";
                workflowClient.reject(saved.getWorkflowId(), actor, role, reason);
            }
        } catch (Exception ex) {
            System.err.println("Workflow reject failed: " + ex.getMessage());
        }

        notificationService.notifyFollowers(
                saved.getRootId(),
                saved.getId(),
                NotificationType.SYLLABUS_REJECTED,
                msg,
                actor);

        return SyllabusMapper.toResponse(saved);
    }

    @Transactional
    public void delete(UUID id, String userId) {
        String actor = requireUser(userId);
        Syllabus s = getOrThrow(id);

        // Soft delete: mark as deleted
        s.setDeleted(true);
        s.setUpdatedBy(actor);

        syllabusRepository.save(s);

        notificationService.notifyFollowers(
                s.getRootId(),
                s.getId(),
                NotificationType.SYLLABUS_REJECTED,
                "Syllabus " + safeCode(s) + " deleted",
                actor);
    }

    /**
     * Get APPROVED syllabuses by Subject Codes (for Public Portal)
     * Used by public portal to fetch APPROVED syllabuses for a set of subjects
     */
    public List<SyllabusResponse> getApprovedSyllabusesBySubjectCodes(List<String> subjectCodes) {
        if (subjectCodes == null || subjectCodes.isEmpty()) {
            return new ArrayList<>();
        }

        return syllabusRepository.findApprovedSyllabusesBySubjectCodes(subjectCodes)
                .stream()
                .map(SyllabusMapper::toResponse)
                .toList();
    }

    /**
     * Get APPROVED and PUBLISHED syllabuses by Subject Codes (for Student Portal)
     * Students can see both APPROVED and PUBLISHED syllabuses of their program
     */
    public List<SyllabusResponse> getApprovedAndPublishedSyllabusesBySubjectCodes(List<String> subjectCodes) {
        if (subjectCodes == null || subjectCodes.isEmpty()) {
            return new ArrayList<>();
        }

        List<SyllabusStatus> statuses = List.of(SyllabusStatus.APPROVED, SyllabusStatus.PUBLISHED);
        return syllabusRepository.findByStatusesAndSubjectCodes(statuses, subjectCodes)
                .stream()
                .map(SyllabusMapper::toResponse)
                .toList();
    }

    /**
     * Get PUBLIC syllabuses (for guest/non-student users)
     * Returns syllabuses with PUBLISHED status
     * Can optionally filter by subject codes
     */
    public List<SyllabusResponse> getPublicSyllabuses(List<String> subjectCodes) {
        List<Syllabus> syllabuses;
        
        if (subjectCodes == null || subjectCodes.isEmpty()) {
            // Get all PUBLISHED syllabuses
            syllabuses = syllabusRepository.findByStatus(SyllabusStatus.PUBLISHED);
        } else {
            // Get PUBLISHED syllabuses filtered by subject codes
            syllabuses = syllabusRepository.findByStatusAndSubjectCodeIn(SyllabusStatus.PUBLISHED, subjectCodes);
        }

        return syllabuses.stream()
                .map(SyllabusMapper::toResponse)
                .toList();
    }
}