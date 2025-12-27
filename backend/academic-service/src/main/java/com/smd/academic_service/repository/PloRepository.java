package com.smd.academic_service.repository;

import com.smd.academic_service.model.entity.Plo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PloRepository extends JpaRepository<Plo, Long> {
    
    List<Plo> findByProgramIdAndIsActiveTrue(Long programId);
    
    Optional<Plo> findByIdAndIsActiveTrue(Long id);
    
    List<Plo> findByProgramIdOrderByDisplayOrder(Long programId);
    
    List<Plo> findByPloCodeContainingIgnoreCase(String ploCode);
    
    @Query("SELECT p FROM Plo p WHERE p.program.id = :programId AND p.isActive = true ORDER BY p.displayOrder")
    List<Plo> findActivePlosByProgramId(@Param("programId") Long programId);
    
    Long countByProgramIdAndIsActiveTrue(Long programId);
}
