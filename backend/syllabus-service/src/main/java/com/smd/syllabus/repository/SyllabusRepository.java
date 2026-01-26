package com.smd.syllabus.repository;

import com.smd.syllabus.domain.Syllabus;
import com.smd.syllabus.domain.SyllabusStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SyllabusRepository extends JpaRepository<Syllabus, UUID> {

        List<Syllabus> findByRootIdOrderByVersionNoDesc(UUID rootId);

        Optional<Syllabus> findTopByRootIdOrderByVersionNoDesc(UUID rootId);

        Optional<Syllabus> findByRootIdAndVersionNo(UUID rootId, Integer versionNo);

        @Query("select coalesce(max(s.versionNo), 0) from Syllabus s where s.rootId = :rootId and s.deleted = false")
        int findMaxVersionNo(@Param("rootId") UUID rootId);

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

        @Query("""
                        select s
                        from Syllabus s
                        where s.deleted = false
                          and s.rootId = :rootId
                          and s.versionNo in (:versions)
                        """)
        List<Syllabus> findForCompare(@Param("rootId") UUID rootId,
                        @Param("versions") List<Integer> versions);

        // Candidate list cho deadline reminder (lọc sơ bộ theo thời gian)
        @Query("""
                        select s
                        from Syllabus s
                        where s.deleted = false
                          and s.status in (:statuses)
                          and (
                                (s.status = com.smd.syllabus.domain.SyllabusStatus.PENDING_REVIEW and s.submittedAt >= :since)
                             or (s.status = com.smd.syllabus.domain.SyllabusStatus.PENDING_APPROVAL and s.reviewedAt >= :since)
                          )
                        """)
        List<Syllabus> findPendingSince(@Param("statuses") List<SyllabusStatus> statuses,
                        @Param("since") Instant since);

        Optional<Syllabus> findByWorkflowId(UUID workflowId);

        @Query("""
                        select s
                        from Syllabus s
                        where s.deleted = false
                          and s.status = com.smd.syllabus.domain.SyllabusStatus.APPROVED
                          and s.subjectCode in (:subjectCodes)
                        order by s.updatedAt desc
                        """)
        List<Syllabus> findApprovedSyllabusesBySubjectCodes(@Param("subjectCodes") List<String> subjectCodes);

        @Query("""
                        select s
                        from Syllabus s
                        where s.deleted = false
                          and s.status in (:statuses)
                          and s.subjectCode in (:subjectCodes)
                        order by s.updatedAt desc
                        """)
        List<Syllabus> findByStatusesAndSubjectCodes(@Param("statuses") List<SyllabusStatus> statuses, @Param("subjectCodes") List<String> subjectCodes);

        @Query("""
                        select s
                        from Syllabus s
                        where s.deleted = false
                          and s.status = :status
                        order by s.updatedAt desc
                        """)
        List<Syllabus> findByStatus(@Param("status") SyllabusStatus status);

        @Query("""
                        select s
                        from Syllabus s
                        where s.deleted = false
                          and s.status = :status
                          and s.subjectCode in (:subjectCodes)
                        order by s.updatedAt desc
                        """)
        List<Syllabus> findByStatusAndSubjectCodeIn(@Param("status") SyllabusStatus status, @Param("subjectCodes") List<String> subjectCodes);
}
