package com.smd.public_service.repository;

import com.smd.public_service.model.entity.Subject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {
    
    Optional<Subject> findBySubjectCode(String subjectCode);
    
    List<Subject> findByProgramId(Long programId);
    
    List<Subject> findByProgramIdAndSemester(Long programId, Integer semester);
    
    Page<Subject> findByProgramId(Long programId, Pageable pageable);
    
    Page<Subject> findBySubjectType(String subjectType, Pageable pageable);
    
    @Query("SELECT s FROM Subject s WHERE " +
            "(:subjectName IS NULL OR LOWER(s.subjectName) LIKE LOWER(CONCAT('%', :subjectName, '%'))) AND " +
            "(:subjectCode IS NULL OR LOWER(s.subjectCode) LIKE LOWER(CONCAT('%', :subjectCode, '%'))) AND " +
            "(:programId IS NULL OR s.programId = :programId) AND " +
            "s.isActive = true")
    Page<Subject> searchByNameOrCode(
            @Param("subjectName") String subjectName,
            @Param("subjectCode") String subjectCode,
            @Param("programId") Long programId,
            Pageable pageable
    );
    
    // Find subjects that are prerequisites for another subject
    @Query(value = "SELECT s.* FROM subject s " +
            "INNER JOIN subject_relationship sr ON s.id = sr.related_subject_id " +
            "WHERE sr.subject_id = :subjectId AND sr.relationship_type = 'PREREQUISITE'",
            nativeQuery = true)
    List<Subject> findPrerequisites(@Param("subjectId") Long subjectId);
    
    // Find subjects that have this subject as prerequisite
    @Query(value = "SELECT s.* FROM subject s " +
            "INNER JOIN subject_relationship sr ON s.id = sr.subject_id " +
            "WHERE sr.related_subject_id = :subjectId AND sr.relationship_type = 'PREREQUISITE'",
            nativeQuery = true)
    List<Subject> findDependentSubjects(@Param("subjectId") Long subjectId);
}
