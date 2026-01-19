package com.smd.public_service.repository;

import com.smd.public_service.model.entity.SubjectRelationship;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubjectRelationshipRepository extends JpaRepository<SubjectRelationship, Long> {
    
    List<SubjectRelationship> findBySubjectId(Long subjectId);
    
    List<SubjectRelationship> findByRelatedSubjectId(Long relatedSubjectId);
    
    List<SubjectRelationship> findBySubjectIdAndRelationshipType(Long subjectId, String relationshipType);
    
    List<SubjectRelationship> findByRelatedSubjectIdAndRelationshipType(Long relatedSubjectId, String relationshipType);
    
    @Query("SELECT sr FROM SubjectRelationship sr WHERE " +
            "sr.subject.id = :subjectId AND sr.relationshipType IN ('PREREQUISITE', 'COREQUISITE')")
    List<SubjectRelationship> findAllRelatedSubjects(@Param("subjectId") Long subjectId);
}
