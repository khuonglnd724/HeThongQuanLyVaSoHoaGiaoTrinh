package com.smd.syllabus.repository;

import com.smd.syllabus.domain.SyllabusFollow;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SyllabusFollowRepository extends JpaRepository<SyllabusFollow, UUID> {
    Optional<SyllabusFollow> findByUserIdAndSyllabusRootId(String userId, UUID syllabusRootId);

    boolean existsByUserIdAndSyllabusRootId(String userId, UUID syllabusRootId);

    List<SyllabusFollow> findBySyllabusRootId(UUID syllabusRootId);

    List<SyllabusFollow> findByUserIdOrderByCreatedAtDesc(String userId);
}
