package com.smd.syllabus.service;

import com.smd.syllabus.domain.SyllabusIssue;
import com.smd.syllabus.dto.CreateIssueRequest;
import com.smd.syllabus.repository.SyllabusIssueRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
public class SyllabusIssueService {

    private final SyllabusIssueRepository repository;

    public SyllabusIssueService(SyllabusIssueRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public SyllabusIssue create(CreateIssueRequest req, String reporterUserId) {
        String uid = requireUser(reporterUserId);

        if (req == null)
            throw new IllegalArgumentException("request body is required");
        if (req.getTitle() == null || req.getTitle().isBlank())
            throw new IllegalArgumentException("title is required");
        if (req.getDescription() == null || req.getDescription().isBlank())
            throw new IllegalArgumentException("description is required");

        SyllabusIssue e = new SyllabusIssue();
        e.setReporterUserId(uid);
        e.setSyllabusRootId(req.getSyllabusRootId());
        e.setSyllabusId(req.getSyllabusId());
        e.setTitle(req.getTitle());
        e.setDescription(req.getDescription());
        e.setStatus(SyllabusIssue.Status.OPEN);

        return repository.save(e);
    }

    @Transactional(readOnly = true)
    public SyllabusIssue get(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Issue not found: " + id));
    }

    @Transactional(readOnly = true)
    public Page<SyllabusIssue> search(UUID syllabusRootId, UUID syllabusId, String reporterUserId,
            SyllabusIssue.Status status, Pageable pageable) {
        if (syllabusId != null)
            return repository.findBySyllabusId(syllabusId, pageable);
        if (syllabusRootId != null)
            return repository.findBySyllabusRootId(syllabusRootId, pageable);
        if (reporterUserId != null && !reporterUserId.isBlank())
            return repository.findByReporterUserId(reporterUserId.trim(), pageable);
        if (status != null)
            return repository.findByStatus(status, pageable);

        // Fallback: list all (paged)
        return repository.findAll(pageable);
    }

    @Transactional
    public SyllabusIssue updateStatus(UUID id, SyllabusIssue.Status newStatus) {
        if (newStatus == null)
            throw new IllegalArgumentException("status is required");

        SyllabusIssue e = get(id);
        e.setStatus(newStatus);

        if (newStatus == SyllabusIssue.Status.RESOLVED || newStatus == SyllabusIssue.Status.CLOSED) {
            if (e.getResolvedAt() == null)
                e.setResolvedAt(Instant.now());
        } else {
            e.setResolvedAt(null);
        }

        return repository.save(e);
    }

    @Transactional
    public void delete(UUID id, String requesterUserId) {
        String uid = requireUser(requesterUserId);

        SyllabusIssue e = get(id);
        // Minimal rule: reporter can delete their own issue
        if (!uid.equals(e.getReporterUserId())) {
            throw new SecurityException("You can only delete your own issue");
        }
        repository.deleteById(id);
    }

    private String requireUser(String userId) {
        if (userId == null || userId.isBlank()) {
            throw new IllegalArgumentException("Missing X-User-Id header");
        }
        return userId.trim();
    }
}
