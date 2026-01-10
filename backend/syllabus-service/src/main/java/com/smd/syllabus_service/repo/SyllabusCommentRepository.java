package com.smd.syllabus_service.repo;

import com.smd.syllabus_service.domain.SyllabusComment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SyllabusCommentRepository extends JpaRepository<SyllabusComment, Long> {

    List<SyllabusComment> findByGroupIdAndSyllabusVersionOrderByCreatedAtAsc(String groupId, Integer syllabusVersion);
}
