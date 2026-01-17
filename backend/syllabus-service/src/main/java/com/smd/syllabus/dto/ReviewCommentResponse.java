package com.smd.syllabus.dto;

import com.smd.syllabus.domain.ReviewComment;

import java.time.Instant;
import java.util.UUID;

public record ReviewCommentResponse(
        UUID id,
        UUID syllabusId,
        String sectionKey,
        String content,
        Long authorId,
        Instant createdAt,
        Instant updatedAt) {
    public static ReviewCommentResponse from(ReviewComment c) {
        return new ReviewCommentResponse(
                c.getId(),
                c.getSyllabusId(),
                c.getSectionKey(),
                c.getContent(),
                c.getAuthorId(),
                c.getCreatedAt(),
                c.getUpdatedAt());
    }
}
