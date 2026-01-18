package com.smd.syllabus.repository;

import com.smd.syllabus.domain.ReviewComment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ReviewCommentRepository extends JpaRepository<ReviewComment, UUID> {

    List<ReviewComment> findBySyllabusIdOrderByCreatedAtAsc(UUID syllabusId);
}
