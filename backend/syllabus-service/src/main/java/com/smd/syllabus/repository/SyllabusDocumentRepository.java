package com.smd.syllabus.repository;

import com.smd.syllabus.domain.DocumentStatus;
import com.smd.syllabus.domain.SyllabusDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SyllabusDocumentRepository extends JpaRepository<SyllabusDocument, UUID> {

    /**
     * Find all documents for a syllabus (not deleted)
     */
    List<SyllabusDocument> findBySyllabusIdAndDeletedFalse(UUID syllabusId);

    /**
     * Find documents by syllabus and version
     */
    List<SyllabusDocument> findBySyllabusIdAndSyllabusVersionAndDeletedFalse(
            UUID syllabusId, Integer syllabusVersion);

    /**
     * Find documents uploaded by a specific lecturer
     */
    List<SyllabusDocument> findByUploadedByAndDeletedFalse(String uploadedBy);

    /**
     * Find documents by status
     */
    List<SyllabusDocument> findByStatusAndDeletedFalse(DocumentStatus status);

    /**
     * Find document by ID (not deleted)
     */
    Optional<SyllabusDocument> findByIdAndDeletedFalse(UUID id);

    /**
     * Count documents for a syllabus
     */
    @Query("SELECT COUNT(d) FROM SyllabusDocument d WHERE d.syllabusId = :syllabusId AND d.deleted = false")
    long countBySyllabusId(@Param("syllabusId") UUID syllabusId);

    /**
     * Calculate total file size for a syllabus
     */
    @Query("SELECT COALESCE(SUM(d.fileSize), 0) FROM SyllabusDocument d " +
           "WHERE d.syllabusId = :syllabusId AND d.deleted = false")
    long getTotalFileSizeBySyllabusId(@Param("syllabusId") UUID syllabusId);
}
