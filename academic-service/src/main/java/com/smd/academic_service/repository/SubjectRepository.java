package com.smd.academic_service.repository;

import com.smd.academic_service.model.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {
    
    List<Subject> findByProgramIdAndIsActiveTrue(Long programId);
    
    Optional<Subject> findByIdAndIsActiveTrue(Long id);
    
    @Query("SELECT s FROM Subject s WHERE s.program.id = :programId AND s.isActive = true ORDER BY s.semester, s.subjectCode")
    List<Subject> findActiveSubjectsByProgramId(@Param("programId") Long programId);
    
    @Query("SELECT s FROM Subject s WHERE s.program.id = :programId AND s.semester = :semester AND s.isActive = true")
    List<Subject> findSubjectsByProgramAndSemester(@Param("programId") Long programId, @Param("semester") Integer semester);
    
    Optional<Subject> findBySubjectCodeAndProgramId(String subjectCode, Long programId);
    
    List<Subject> findBySubjectCodeContainingIgnoreCase(String subjectCode);
    
    Long countByProgramIdAndIsActiveTrue(Long programId);
    
    @Query("SELECT COUNT(s) FROM Subject s WHERE s.program.id = :programId AND s.isFoundational = true AND s.isActive = true")
    Long countFoundationalSubjectsByProgram(@Param("programId") Long programId);
}
