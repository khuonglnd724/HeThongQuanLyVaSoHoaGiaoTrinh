package com.smd.syllabus_service.repo;

import com.smd.syllabus_service.domain.Syllabus;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SyllabusRepository extends JpaRepository<Syllabus, Long> {
}
