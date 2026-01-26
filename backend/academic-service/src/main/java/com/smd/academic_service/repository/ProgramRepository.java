package com.smd.academic_service.repository;

import com.smd.academic_service.model.entity.Program;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProgramRepository extends JpaRepository<Program, Long> {
    
    Optional<Program> findByProgramCodeAndIsActiveTrue(String programCode);
    
    Optional<Program> findByIdAndIsActiveTrue(Long id);
    
    List<Program> findByDepartmentIdAndIsActiveTrue(Long departmentId);
    
    List<Program> findByIsActiveTrueOrderByProgramCode();
    
    @Query("SELECT p FROM Program p WHERE p.isActive = true AND p.departmentId = :departmentId ORDER BY p.programCode")
    List<Program> findActiveProgramsByDepartment(@Param("departmentId") Long departmentId);
    
    List<Program> findByProgramNameContainingIgnoreCase(String programName);
    
    Optional<Program> findByProgramNameAndIsActiveTrue(String programName);
    
    Long countByDepartmentIdAndIsActiveTrue(Long departmentId);
}
