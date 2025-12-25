package com.smd.academic_service.repository;

import com.smd.academic_service.model.entity.Syllabus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SyllabusRepository extends JpaRepository<Syllabus, Long> {
    
    List<Syllabus> findBySubjectIdAndIsActiveTrue(Long subjectId);
    
    Optional<Syllabus> findByIdAndIsActiveTrue(Long id);
    
    @Query("SELECT s FROM Syllabus s WHERE s.subject.id = :subjectId AND s.isActive = true ORDER BY s.academicYear DESC, s.version DESC")
    List<Syllabus> findActiveSyllabusesBySubjectId(@Param("subjectId") Long subjectId);
    
    @Query("SELECT s FROM Syllabus s WHERE s.subject.id = :subjectId AND s.academicYear = :academicYear AND s.semester = :semester AND s.isActive = true")
    Optional<Syllabus> findSyllabusBySubjectAndAcademicYearAndSemester(
        @Param("subjectId") Long subjectId,
        @Param("academicYear") String academicYear,
        @Param("semester") Integer semester
    );
    
    @Query("SELECT s FROM Syllabus s WHERE s.status = :status AND s.isActive = true ORDER BY s.createdAt DESC")
    List<Syllabus> findSyllabusesByStatus(@Param("status") String status);
    
    @Query("SELECT s FROM Syllabus s WHERE s.approvalStatus = :approvalStatus AND s.isActive = true ORDER BY s.createdAt DESC")
    List<Syllabus> findSyllabusesByApprovalStatus(@Param("approvalStatus") String approvalStatus);
    
    @Query("SELECT s FROM Syllabus s WHERE s.subject.program.id = :programId AND s.isActive = true ORDER BY s.academicYear DESC")
    List<Syllabus> findSyllabusesByProgramId(@Param("programId") Long programId);
    
    Long countBySubjectIdAndIsActiveTrue(Long subjectId);
    
    @Query("SELECT COUNT(s) FROM Syllabus s WHERE s.approvalStatus = 'Approved' AND s.subject.program.id = :programId AND s.isActive = true")
    Long countApprovedSyllabusesByProgramId(@Param("programId") Long programId);
}
