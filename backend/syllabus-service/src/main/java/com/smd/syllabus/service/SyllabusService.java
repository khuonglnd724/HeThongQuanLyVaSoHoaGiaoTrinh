package com.smd.syllabus.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smd.syllabus.domain.Syllabus;
import com.smd.syllabus.domain.SyllabusStatus;
import com.smd.syllabus.dto.CreateSyllabusRequest;
import com.smd.syllabus.dto.SyllabusMapper;
import com.smd.syllabus.dto.SyllabusResponse;
import com.smd.syllabus.dto.UpdateSyllabusRequest;
import com.smd.syllabus.repository.SyllabusRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

@Service
public class SyllabusService {

    private final SyllabusRepository syllabusRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public SyllabusService(SyllabusRepository syllabusRepository) {
        this.syllabusRepository = syllabusRepository;
    }

    // ===== helper: content (String hoặc JsonNode/Object) -> JSON string để lưu
    // jsonb =====
    private String normalizeContent(Object content) {
        if (content == null)
            return null;

        if (content instanceof String s) {
            return s;
        }
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

        // FIX jsonb
        s.setContent(normalizeContent(req.getContent()));

        Syllabus saved = syllabusRepository.save(s);

        // rootId = id cho version 1
        if (saved.getRootId() == null || !saved.getRootId().equals(saved.getId())) {
            saved.setRootId(saved.getId());
            saved = syllabusRepository.save(saved);
        }

        return SyllabusMapper.toResponse(saved);
    }

    /**
     * Controller của bạn đang gọi updateAsNewVersion(UUID rootId,
     * UpdateSyllabusRequest req, String userId)
     */
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
        if (incoming != null) {
            nv.setContent(normalizeContent(incoming));
        } else {
            nv.setContent(latest.getContent());
        }

        Syllabus saved = syllabusRepository.save(nv);
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
        return SyllabusMapper.toResponse(getOrThrow(id));
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
    // WORKFLOW
    // =========================

    @Transactional
    public SyllabusResponse submit(UUID id, String userId) {
        String actor = requireUser(userId);
        Syllabus s = getOrThrow(id);

        if (s.getStatus() != SyllabusStatus.DRAFT) {
            throw new IllegalStateException("Only DRAFT syllabus can be submitted");
        }

        s.setStatus(SyllabusStatus.PENDING_REVIEW);
        s.setSubmittedAt(Instant.now());
        s.setUpdatedBy(actor);
        s.setLastActionBy(actor);

        s.setRejectionReason(null);
        s.setRejectedAt(null);

        return SyllabusMapper.toResponse(syllabusRepository.save(s));
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

        return SyllabusMapper.toResponse(syllabusRepository.save(s));
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

        return SyllabusMapper.toResponse(syllabusRepository.save(s));
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

        return SyllabusMapper.toResponse(syllabusRepository.save(s));
    }

    @Transactional
    public SyllabusResponse reject(UUID id, String userId, String reason) {
        String actor = requireUser(userId);
        Syllabus s = getOrThrow(id);

        if (s.getStatus() != SyllabusStatus.PENDING_REVIEW && s.getStatus() != SyllabusStatus.PENDING_APPROVAL) {
            throw new IllegalStateException("Syllabus not in a rejectable status");
        }

        s.setStatus(SyllabusStatus.REJECTED);
        s.setRejectedAt(Instant.now());
        s.setRejectionReason(reason);
        s.setUpdatedBy(actor);
        s.setLastActionBy(actor);

        return SyllabusMapper.toResponse(syllabusRepository.save(s));
    }
}
