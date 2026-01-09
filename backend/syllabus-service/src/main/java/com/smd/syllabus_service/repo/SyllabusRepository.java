package com.smd.syllabus_service.repo;

import com.smd.syllabus_service.domain.Syllabus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SyllabusRepository extends JpaRepository<Syllabus, Long> {

    List<Syllabus> findByGroupIdOrderByVersionDesc(String groupId);

    Optional<Syllabus> findFirstByGroupIdOrderByVersionDesc(String groupId);

    Optional<Syllabus> findFirstByGroupIdAndVersion(String groupId, Integer version);
}
