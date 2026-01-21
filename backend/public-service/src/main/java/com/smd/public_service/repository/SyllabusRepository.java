package com.smd.public_service.repository;

import com.smd.public_service.model.entity.Syllabus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SyllabusRepository extends JpaRepository<Syllabus, Long> {
    
    Optional<Syllabus> findBySyllabusCode(String syllabusCode);
    
    List<Syllabus> findBySubjectId(Long subjectId);
    
    List<Syllabus> findBySubjectIdAndVersion(Long subjectId, Integer version);
    
    Page<Syllabus> findBySubjectId(Long subjectId, Pageable pageable);
    
    Page<Syllabus> findByStatus(String status, Pageable pageable);
    
    Page<Syllabus> findByAcademicYear(String academicYear, Pageable pageable);
    
    Page<Syllabus> findByAcademicYearAndSemester(String academicYear, Integer semester, Pageable pageable);
    
    // Full-text search using PostgreSQL
    @Query(value = "SELECT * FROM syllabus WHERE " +
            "to_tsvector('vietnamese', subject.subject_name || ' ' || syllabus.learning_objectives || ' ' || syllabus.content) " +
            "@@ plainto_tsquery('vietnamese', :searchQuery) " +
            "AND syllabus.status = 'Published' " +
            "ORDER BY ts_rank(to_tsvector('vietnamese', subject.subject_name || ' ' || syllabus.learning_objectives || ' ' || syllabus.content), " +
            "plainto_tsquery('vietnamese', :searchQuery)) DESC",
            nativeQuery = true)
    Page<Syllabus> fullTextSearch(@Param("searchQuery") String searchQuery, Pageable pageable);
    
    // Search by filters
    @Query("SELECT s FROM Syllabus s WHERE " +
            "(:subjectName IS NULL OR LOWER(s.subject.subjectName) LIKE LOWER(CONCAT('%', :subjectName, '%'))) AND " +
            "(:subjectCode IS NULL OR LOWER(s.subject.subjectCode) LIKE LOWER(CONCAT('%', :subjectCode, '%'))) AND " +
            "(:major IS NULL OR s.subject.programId = :majorId) AND " +
            "(:semester IS NULL OR s.semester = :semester) AND " +
            "s.status = 'Published'")
    Page<Syllabus> searchByCriteria(
            @Param("subjectName") String subjectName,
            @Param("subjectCode") String subjectCode,
            @Param("majorId") Long majorId,
            @Param("semester") Integer semester,
            Pageable pageable
    );
    
    // Get latest version
    @Query(value = "SELECT * FROM syllabus WHERE subject_id = :subjectId " +
            "ORDER BY version DESC LIMIT 1", nativeQuery = true)
    Optional<Syllabus> findLatestVersionBySubjectId(@Param("subjectId") Long subjectId);
    
    // Simple search for H2 database (no full-text search support)
    @Query("SELECT s FROM Syllabus s WHERE " +
            "(LOWER(s.subject.subjectName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(s.subject.subjectCode) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(s.content) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
            "s.status IN ('APPROVED', 'Published')")
    Page<Syllabus> searchBySimpleQuery(@Param("query") String query, Pageable pageable);
    
    // Find by subject code
    @Query("SELECT s FROM Syllabus s WHERE " +
            "LOWER(s.subject.subjectCode) LIKE LOWER(CONCAT('%', :subjectCode, '%')) AND " +
            "s.status IN ('APPROVED', 'Published')")
    Page<Syllabus> findBySubjectCodeSimple(@Param("subjectCode") String subjectCode, Pageable pageable);
}
