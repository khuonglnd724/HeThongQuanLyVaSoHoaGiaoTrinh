package com.smd.public_service.repository;

import com.smd.public_service.model.entity.SyllabusFeedback;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SyllabusFeedbackRepository extends JpaRepository<SyllabusFeedback, Long> {
    
    List<SyllabusFeedback> findBySyllabusId(Long syllabusId);
    
    Page<SyllabusFeedback> findBySyllabusId(Long syllabusId, Pageable pageable);
    
    Page<SyllabusFeedback> findByStatus(String status, Pageable pageable);
    
    List<SyllabusFeedback> findByStatusAndUserId(String status, Long userId);
    
    @Query("SELECT sf FROM SyllabusFeedback sf WHERE sf.syllabusId = :syllabusId AND sf.status IN ('PENDING', 'REVIEWED')")
    List<SyllabusFeedback> findUnresolvedFeedback(@Param("syllabusId") Long syllabusId);
}
