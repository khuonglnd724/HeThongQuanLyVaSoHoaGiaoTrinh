package com.smd.syllabus_service.service;

import com.smd.syllabus_service.domain.Syllabus;
import com.smd.syllabus_service.domain.SyllabusComment;
import com.smd.syllabus_service.domain.SyllabusStatus;
import com.smd.syllabus_service.dto.*;
import com.smd.syllabus_service.repo.SyllabusCommentRepository;
import com.smd.syllabus_service.repo.SyllabusRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;
import java.util.stream.Collectors;

import static org.springframework.http.HttpStatus.*;

@Service
public class SyllabusService {

    private final SyllabusRepository repo;
    private final SyllabusCommentRepository commentRepo;

    public SyllabusService(SyllabusRepository repo, SyllabusCommentRepository commentRepo) {
        this.repo = repo;
        this.commentRepo = commentRepo;
    }

    // ===== Existing: list items (kept) =====
    public List<SyllabusListItemDto> list() {
        // Return latest version per groupId.
        List<Syllabus> all = repo.findAll();

        // Backward compatibility: if legacy rows exist without groupId/version/status,
        // they may break.
        // So we defensively group:
        Map<String, Syllabus> latestByGroup = new HashMap<>();
        for (Syllabus s : all) {
            String gid = (s.getGroupId() == null || s.getGroupId().isBlank())
                    ? ("LEGACY-" + s.getId())
                    : s.getGroupId();
            Integer v = (s.getVersion() == null) ? 1 : s.getVersion();

            Syllabus current = latestByGroup.get(gid);
            if (current == null) {
                latestByGroup.put(gid, s);
            } else {
                Integer cv = (current.getVersion() == null) ? 1 : current.getVersion();
                if (v > cv)
                    latestByGroup.put(gid, s);
            }
        }

        return latestByGroup.values().stream()
                .sorted(Comparator.comparing(Syllabus::getUpdatedAt, Comparator.nullsLast(Comparator.naturalOrder()))
                        .reversed())
                .map(s -> new SyllabusListItemDto(s.getId(), s.getName(), s.getCourseCode()))
                .toList();
    }

    // ===== Builder APIs =====
    public SyllabusDetailDto createDraft(SyllabusUpsertRequest req) {
        validateUpsert(req);

        Syllabus s = new Syllabus();
        s.setGroupId(UUID.randomUUID().toString());
        s.setVersion(1);
        s.setStatus(SyllabusStatus.DRAFT);

        applyUpsert(s, req);

        Syllabus saved = repo.save(s);
        return toDetail(saved);
    }

    public SyllabusDetailDto getLatest(String groupId) {
        Syllabus s = repo.findFirstByGroupIdOrderByVersionDesc(groupId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Syllabus group not found"));
        return toDetail(s);
    }

    public SyllabusDetailDto updateDraft(String groupId, SyllabusUpsertRequest req) {
        validateUpsert(req);

        Syllabus latest = repo.findFirstByGroupIdOrderByVersionDesc(groupId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Syllabus group not found"));

        Syllabus next = cloneAsNextVersion(latest, SyllabusStatus.DRAFT);
        applyUpsert(next, req);

        Syllabus saved = repo.save(next);
        return toDetail(saved);
    }

    public SyllabusDetailDto submit(String groupId) {
        Syllabus latest = repo.findFirstByGroupIdOrderByVersionDesc(groupId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Syllabus group not found"));

        Syllabus next = cloneAsNextVersion(latest, SyllabusStatus.SUBMITTED);

        Syllabus saved = repo.save(next);
        return toDetail(saved);
    }

    // ===== Version Compare APIs =====
    public List<SyllabusVersionDto> listVersions(String groupId) {
        List<Syllabus> versions = repo.findByGroupIdOrderByVersionDesc(groupId);
        if (versions.isEmpty())
            throw new ResponseStatusException(NOT_FOUND, "Syllabus group not found");

        return versions.stream()
                .map(v -> new SyllabusVersionDto(v.getVersion(), v.getStatus(), v.getUpdatedAt()))
                .toList();
    }

    public SyllabusDetailDto getVersion(String groupId, Integer version) {
        Syllabus s = repo.findFirstByGroupIdAndVersion(groupId, version)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Syllabus version not found"));
        return toDetail(s);
    }

    // ===== Collaborative Review (Comments) =====
    public List<SyllabusCommentDto> listComments(String groupId, Integer version) {
        if (version == null)
            throw new ResponseStatusException(BAD_REQUEST, "version is required");

        // ensure syllabus exists
        repo.findFirstByGroupIdAndVersion(groupId, version)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Syllabus version not found"));

        return commentRepo.findByGroupIdAndSyllabusVersionOrderByCreatedAtAsc(groupId, version).stream()
                .map(c -> new SyllabusCommentDto(
                        c.getId(),
                        c.getGroupId(),
                        c.getSyllabusVersion(),
                        c.getSectionKey(),
                        c.getAuthor(),
                        c.getContent(),
                        c.getCreatedAt()))
                .toList();
    }

    public SyllabusCommentDto addComment(String groupId, CreateCommentRequest req) {
        if (req == null || req.version() == null)
            throw new ResponseStatusException(BAD_REQUEST, "version is required");
        if (req.sectionKey() == null || req.sectionKey().isBlank())
            throw new ResponseStatusException(BAD_REQUEST, "sectionKey is required");
        if (req.content() == null || req.content().isBlank())
            throw new ResponseStatusException(BAD_REQUEST, "content is required");

        // ensure syllabus exists
        repo.findFirstByGroupIdAndVersion(groupId, req.version())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Syllabus version not found"));

        SyllabusComment c = new SyllabusComment();
        c.setGroupId(groupId);
        c.setSyllabusVersion(req.version());
        c.setSectionKey(req.sectionKey().trim());
        c.setAuthor(req.author());
        c.setContent(req.content().trim());

        SyllabusComment saved = commentRepo.save(c);

        return new SyllabusCommentDto(
                saved.getId(),
                saved.getGroupId(),
                saved.getSyllabusVersion(),
                saved.getSectionKey(),
                saved.getAuthor(),
                saved.getContent(),
                saved.getCreatedAt());
    }

    public void deleteComment(Long commentId) {
        if (!commentRepo.existsById(commentId)) {
            throw new ResponseStatusException(NOT_FOUND, "Comment not found");
        }
        commentRepo.deleteById(commentId);
    }

    // ===== Helpers =====
    private void validateUpsert(SyllabusUpsertRequest req) {
        if (req == null)
            throw new ResponseStatusException(BAD_REQUEST, "body is required");
        if (req.name() == null || req.name().isBlank())
            throw new ResponseStatusException(BAD_REQUEST, "name is required");
        if (req.courseCode() == null || req.courseCode().isBlank())
            throw new ResponseStatusException(BAD_REQUEST, "courseCode is required");
    }

    private void applyUpsert(Syllabus s, SyllabusUpsertRequest req) {
        s.setName(req.name().trim());
        s.setCourseCode(req.courseCode().trim());

        s.setAcademicYear(req.academicYear());
        s.setSemester(req.semester());

        s.setOverview(req.overview());
        s.setLearningObjectives(req.learningObjectives());
        s.setTeachingMethods(req.teachingMethods());
        s.setAssessments(req.assessments());
        s.setCourseContent(req.courseContent());
        s.setReferences(req.references());

        s.setCloPloMapJson(req.cloPloMapJson());
        s.setAssessmentTableJson(req.assessmentTableJson());
    }

    private Syllabus cloneAsNextVersion(Syllabus latest, SyllabusStatus status) {
        Syllabus next = new Syllabus();
        next.setGroupId(latest.getGroupId());
        next.setVersion((latest.getVersion() == null ? 1 : latest.getVersion()) + 1);
        next.setStatus(status);

        // carry over existing content
        next.setName(latest.getName());
        next.setCourseCode(latest.getCourseCode());
        next.setAcademicYear(latest.getAcademicYear());
        next.setSemester(latest.getSemester());
        next.setOverview(latest.getOverview());
        next.setLearningObjectives(latest.getLearningObjectives());
        next.setTeachingMethods(latest.getTeachingMethods());
        next.setAssessments(latest.getAssessments());
        next.setCourseContent(latest.getCourseContent());
        next.setReferences(latest.getReferences());
        next.setCloPloMapJson(latest.getCloPloMapJson());
        next.setAssessmentTableJson(latest.getAssessmentTableJson());

        return next;
    }

    private SyllabusDetailDto toDetail(Syllabus s) {
        return new SyllabusDetailDto(
                s.getId(),
                s.getGroupId(),
                s.getVersion(),
                s.getStatus(),
                s.getName(),
                s.getCourseCode(),
                s.getAcademicYear(),
                s.getSemester(),
                s.getOverview(),
                s.getLearningObjectives(),
                s.getTeachingMethods(),
                s.getAssessments(),
                s.getCourseContent(),
                s.getReferences(),
                s.getCloPloMapJson(),
                s.getAssessmentTableJson(),
                s.getCreatedAt(),
                s.getUpdatedAt());
    }
}
