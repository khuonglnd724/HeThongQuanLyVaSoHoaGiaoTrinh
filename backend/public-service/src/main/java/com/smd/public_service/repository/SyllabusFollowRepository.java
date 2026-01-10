package com.smd.public_service.repository;

import com.smd.public_service.model.entity.SyllabusFollow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SyllabusFollowRepository extends JpaRepository<SyllabusFollow, Long> {
    
    Optional<SyllabusFollow> findBySyllabusIdAndUserId(Long syllabusId, Long userId);
    
    List<SyllabusFollow> findBySyllabusId(Long syllabusId);
    
    List<SyllabusFollow> findByUserId(Long userId);
    
    List<SyllabusFollow> findBySyllabusIdAndNotifyOnChangeTrue(Long syllabusId);
    
    @Query("SELECT sf FROM SyllabusFollow sf WHERE sf.syllabusId = :syllabusId AND sf.notifyOnChange = true")
    List<SyllabusFollow> findFollowersToNotify(@Param("syllabusId") Long syllabusId);
    
    boolean existsBySyllabusIdAndUserId(Long syllabusId, Long userId);
}
