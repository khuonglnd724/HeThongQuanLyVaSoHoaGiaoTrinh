package com.smd.syllabus.service;

import com.smd.syllabus.domain.ReviewComment;
import com.smd.syllabus.repository.ReviewCommentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class ReviewCommentService {

    private final ReviewCommentRepository repository;

    public ReviewCommentService(ReviewCommentRepository repository) {
        this.repository = repository;
    }

    /**
     * Add inline review comment
     */
    @Transactional
    public ReviewComment add(UUID syllabusId, String sectionKey, String content, Long authorId) {

        // ---- manual validation (no jakarta.validation) ----
        if (syllabusId == null) {
            throw new IllegalArgumentException("syllabusId is required");
        }
        if (sectionKey == null || sectionKey.isBlank()) {
            throw new IllegalArgumentException("sectionKey is required");
        }
        if (content == null || content.isBlank()) {
            throw new IllegalArgumentException("content is required");
        }
        if (authorId == null) {
            throw new IllegalArgumentException("authorId is required");
        }

        ReviewComment c = new ReviewComment();
        c.setSyllabusId(syllabusId);
        c.setSectionKey(sectionKey.trim());
        c.setContent(content.trim());
        c.setAuthorId(authorId);

        return repository.save(c);
    }

    /**
     * List comments of a syllabus (ordered by createdAt ASC)
     */
    @Transactional(readOnly = true)
    public List<ReviewComment> list(UUID syllabusId) {
        if (syllabusId == null) {
            throw new IllegalArgumentException("syllabusId is required");
        }
        return repository.findBySyllabusIdOrderByCreatedAtAsc(syllabusId);
    }

    /**
     * Delete own comment only
     */
    @Transactional
    public void delete(UUID commentId, Long requesterId) {
        if (commentId == null) {
            throw new IllegalArgumentException("commentId is required");
        }
        if (requesterId == null) {
            throw new IllegalArgumentException("requesterId is required");
        }

        ReviewComment c = repository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("Comment not found"));

        if (!requesterId.equals(c.getAuthorId())) {
            throw new SecurityException("You can only delete your own comment");
        }

        repository.delete(c);
    }

    @Transactional
    public ReviewComment update(java.util.UUID commentId, String newContent, Long requesterId) {
        if (commentId == null)
            throw new IllegalArgumentException("commentId is required");
        if (requesterId == null)
            throw new IllegalArgumentException("requesterId is required");
        if (newContent == null || newContent.isBlank())
            throw new IllegalArgumentException("content is required");

        ReviewComment c = repository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("Comment not found"));

        if (!requesterId.equals(c.getAuthorId())) {
            throw new SecurityException("You can only edit your own comment");
        }

        c.setContent(newContent.trim());
        return repository.save(c);
    }

}
