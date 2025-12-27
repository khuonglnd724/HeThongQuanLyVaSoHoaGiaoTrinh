package com.smd.academic_service.repository;

import com.smd.academic_service.model.entity.CloMapping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CloMappingRepository extends JpaRepository<CloMapping, Long> {
    
    List<CloMapping> findByCloIdAndIsActiveTrue(Long cloId);
    
    List<CloMapping> findByPloIdAndIsActiveTrue(Long ploId);
    
    Optional<CloMapping> findByIdAndIsActiveTrue(Long id);
    
    @Query("SELECT cm FROM CloMapping cm WHERE cm.clo.id = :cloId AND cm.isActive = true")
    List<CloMapping> findActiveMappingsByCloId(@Param("cloId") Long cloId);
    
    @Query("SELECT cm FROM CloMapping cm WHERE cm.plo.id = :ploId AND cm.isActive = true")
    List<CloMapping> findActiveMappingsByPloId(@Param("ploId") Long ploId);
    
    @Query("SELECT cm FROM CloMapping cm WHERE cm.clo.id = :cloId AND cm.plo.id = :ploId AND cm.isActive = true")
    Optional<CloMapping> findByClosAndPlosId(@Param("cloId") Long cloId, @Param("ploId") Long ploId);
    
    @Query("SELECT COUNT(cm) FROM CloMapping cm WHERE cm.plo.id = :ploId AND cm.isActive = true")
    Long countMappedClosByPloId(@Param("ploId") Long ploId);
    
    @Query("SELECT COUNT(DISTINCT cm.plo.id) FROM CloMapping cm WHERE cm.clo.id = :cloId AND cm.isActive = true")
    Long countMappedPlosByCloId(@Param("cloId") Long cloId);
    
    @Query("SELECT cm FROM CloMapping cm WHERE cm.clo.subject.program.id = :programId AND cm.isActive = true")
    List<CloMapping> findMappingsByProgramId(@Param("programId") Long programId);
}
