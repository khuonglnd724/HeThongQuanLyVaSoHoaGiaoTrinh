package com.smd.public_service.service;

import com.smd.public_service.dto.*;
import com.smd.public_service.client.AcademicServiceClient;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class PublicSyllabusService {

    private final AcademicServiceClient academicServiceClient;

    public PublicSyllabusService(AcademicServiceClient academicServiceClient) {
        this.academicServiceClient = academicServiceClient;
    }

    /**
     * Search syllabi with multiple filters
     * Supports: query (full-text), code, major, semester, year, version
     */
    public SearchResponse searchSyllabi(
            String q,
            String code,
            String major,
            String semester,
            Integer year,
            String version,
            String sort,
            int page,
            int size,
            boolean fuzzy,
            boolean highlight
    ) {
        // Placeholder: In production, this would call academic-service or use Elasticsearch
        List<SyllabusSummary> results = new ArrayList<>();

        // Simulate search results
        if (q != null && !q.isEmpty()) {
            SyllabusSummary summary = new SyllabusSummary();
            summary.setId(1L);
            summary.setTitle("Toán cao cấp I");
            summary.setCode("MATH101");
            summary.setMajor("Công nghệ Thông tin");
            summary.setSemester("1");
            summary.setVersion("2024.1");
            summary.setUpdatedAt("2024-12-01");
            summary.setSnippet("Giới thiệu về hàm số, giới hạn, đạo hàm...");
            summary.setScore(0.95);
            summary.setDetailUrl("/api/public/syllabi/1");
            results.add(summary);
        }

        SearchResponse response = new SearchResponse(
                results.size(),
                page,
                size,
                results
        );
        return response;
    }

    /**
     * Get detailed view of a syllabus including CLOs and mappings
     */
    public SyllabusDetailDto getSyllabusDetail(Long syllabusId) {
        // Call academic-service to get syllabus detail
        SyllabusDetailDto detail = academicServiceClient.getSyllabusDetail(syllabusId);

        if (detail != null) {
            // Fetch CLOs
            List<CloSummaryDto> clos = academicServiceClient.getClosBySyllabus(syllabusId);
            detail.setClos(clos);

            // Fetch CLO-PLO mappings
            List<CloMappingDto> mappings = academicServiceClient.getCloMappingsBySyllabus(syllabusId);
            detail.setCloMappings(mappings);
        }

        return detail;
    }

    /**
     * Get subject relationship tree (prerequisites and corequisites)
     */
    public SubjectRelationshipDto getSubjectRelationshipTree(Long subjectId) {
        return academicServiceClient.getSubjectRelationship(subjectId);
    }

    /**
     * Generate AI summary for a syllabus
     * Placeholder for integration with AI service
     */
    public String generateAISummary(Long syllabusId) {
        // This would call the AI service
        SyllabusDetailDto detail = getSyllabusDetail(syllabusId);
        if (detail != null) {
            return "AI Summary: " + detail.getContent();
        }
        return null;
    }

    /**
     * Get CLO-PLO mapping for a syllabus
     */
    public List<CloMappingDto> getCloMappings(Long syllabusId) {
        return academicServiceClient.getCloMappingsBySyllabus(syllabusId);
    }
}
