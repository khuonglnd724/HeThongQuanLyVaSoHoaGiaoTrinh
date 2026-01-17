package com.smd.syllabus.repository;

import com.smd.syllabus.domain.Syllabus;
import com.smd.syllabus.domain.SyllabusStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SyllabusRepository extends JpaRepository<Syllabus, UUID> {

    // -------- basic versioning --------

    List<Syllabus> findByRootIdOrderByVersionNoDesc(UUID rootId);

    Optional<Syllabus> findTopByRootIdOrderByVersionNoDesc(UUID rootId);

    Optional<Syllabus> findByRootIdAndVersionNo(UUID rootId, Integer versionNo);

    // Find the maximum version number in a root group
    @Query("select coalesce(max(s.versionNo), 0) from Syllabus s where s.rootId = :rootId and s.deleted = false")
    int findMaxVersionNo(@Param("rootId") UUID rootId);

    // -------- list/search for FE Syllabus List --------
    // Search by subjectCode / subjectName, optionally filter by status.
    @Query("""
            select s
            from Syllabus s
            where s.deleted = false
              and (:q is null or :q = ''
                   or lower(s.subjectCode) like lower(concat('%', :q, '%'))
                   or lower(s.subjectName) like lower(concat('%', :q, '%')))
              and (:status is null or s.status = :status)
            order by s.updatedAt desc
            """)
    Page<Syllabus> search(@Param("q") String q,
            @Param("status") SyllabusStatus status,
            Pageable pageable);

    // -------- for compare view (pick 2 versions) --------
    @Query("""
            select s
            from Syllabus s
            where s.deleted = false
              and s.rootId = :rootId
              and s.versionNo in (:versions)
            """)
    List<Syllabus> findForCompare(@Param("rootId") UUID rootId,
            @Param("versions") List<Integer> versions);
}
