package com.smd.academic_service.repository;

import com.smd.academic_service.model.entity.SyllabusAudit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SyllabusAuditRepository extends JpaRepository<SyllabusAudit, Long> {
    
    /**
     * Get all audit records for a specific syllabus ordered by version
     */
    List<SyllabusAudit> findBySyllabusIdOrderByVersionNumberDesc(Long syllabusId);
    
    /**
     * Get audit record for specific version
     */
    Optional<SyllabusAudit> findBySyllabusIdAndVersionNumber(Long syllabusId, Integer versionNumber);
    
    /**
     * Get latest audit record for a syllabus
     */
    @Query("SELECT sa FROM SyllabusAudit sa WHERE sa.syllabusId = :syllabusId ORDER BY sa.versionNumber DESC LIMIT 1")
    Optional<SyllabusAudit> findLatestAuditBySyllabusId(@Param("syllabusId") Long syllabusId);
    
    /**
     * Get count of versions for a syllabus
     */
    long countBySyllabusId(Long syllabusId);
    
    /**
     * Get audit records by change type
     */
    List<SyllabusAudit> findBySyllabusIdAndChangeType(Long syllabusId, String changeType);
    
    /**
     * Get all audit records for a syllabus between versions
     */
    @Query("SELECT sa FROM SyllabusAudit sa WHERE sa.syllabusId = :syllabusId AND sa.versionNumber BETWEEN :startVersion AND :endVersion ORDER BY sa.versionNumber")
    List<SyllabusAudit> findAuditBetweenVersions(
        @Param("syllabusId") Long syllabusId,
        @Param("startVersion") Integer startVersion,
        @Param("endVersion") Integer endVersion
    );
}
