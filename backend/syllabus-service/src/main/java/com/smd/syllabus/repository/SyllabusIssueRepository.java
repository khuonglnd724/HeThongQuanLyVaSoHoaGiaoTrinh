package com.smd.syllabus.repository;

import com.smd.syllabus.domain.SyllabusIssue;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface SyllabusIssueRepository extends JpaRepository<SyllabusIssue, UUID> {

    Page<SyllabusIssue> findBySyllabusRootId(UUID syllabusRootId, Pageable pageable);

    Page<SyllabusIssue> findBySyllabusId(UUID syllabusId, Pageable pageable);

    Page<SyllabusIssue> findByReporterUserId(String reporterUserId, Pageable pageable);

    Page<SyllabusIssue> findByStatus(SyllabusIssue.Status status, Pageable pageable);
}
