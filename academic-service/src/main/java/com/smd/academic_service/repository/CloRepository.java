package com.smd.academic_service.repository;

import com.smd.academic_service.model.entity.Clo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CloRepository extends JpaRepository<Clo, Long> {
    
    List<Clo> findBySubjectIdAndIsActiveTrue(Long subjectId);
    
    List<Clo> findBySyllabusIdAndIsActiveTrue(Long syllabusId);
    
    Optional<Clo> findByIdAndIsActiveTrue(Long id);
    
    List<Clo> findBySubjectIdOrderByDisplayOrder(Long subjectId);
    
    @Query("SELECT c FROM Clo c WHERE c.subject.id = :subjectId AND c.isActive = true ORDER BY c.displayOrder")
    List<Clo> findActiveClosBySubjectId(@Param("subjectId") Long subjectId);
    
    @Query("SELECT c FROM Clo c WHERE c.syllabus.id = :syllabusId AND c.isActive = true ORDER BY c.displayOrder")
    List<Clo> findActiveClosBySyllabusId(@Param("syllabusId") Long syllabusId);
    
    Long countBySubjectIdAndIsActiveTrue(Long subjectId);
    
    List<Clo> findByCloCodeContainingIgnoreCase(String cloCode);
}
