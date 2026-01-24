package com.smd.academic_service.repository;

import com.smd.academic_service.model.entity.CloSyllabus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CloSyllabusRepository extends JpaRepository<CloSyllabus, Long> {
    
    /**
     * Tìm tất cả CLO liên kết với một Syllabus
     */
    @Query("SELECT cs FROM CloSyllabus cs WHERE cs.syllabusId = :syllabusId")
    List<CloSyllabus> findBySyllabusId(@Param("syllabusId") String syllabusId);
    
    /**
     * Tìm tất cả Syllabus liên kết với một CLO
     */
    @Query("SELECT cs FROM CloSyllabus cs WHERE cs.cloId = :cloId")
    List<CloSyllabus> findByCloId(@Param("cloId") Long cloId);
    
    /**
     * Kiểm tra xem CLO đã được liên kết với Syllabus chưa
     */
    @Query("SELECT cs FROM CloSyllabus cs WHERE cs.cloId = :cloId AND cs.syllabusId = :syllabusId")
    Optional<CloSyllabus> findByCloIdAndSyllabusId(
        @Param("cloId") Long cloId,
        @Param("syllabusId") String syllabusId
    );
    
    /**
     * Xóa tất cả liên kết của một Syllabus
     */
    void deleteBySyllabusId(String syllabusId);
}
