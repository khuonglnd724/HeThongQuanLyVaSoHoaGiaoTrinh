package com.smd.public_service.client;

import com.smd.public_service.dto.CloMappingDto;
import com.smd.public_service.dto.CloSummaryDto;
import com.smd.public_service.dto.SyllabusDetailDto;
import com.smd.public_service.dto.SubjectRelationshipDto;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;
import java.util.List;

@Component
public class AcademicServiceClient {

    private final RestTemplate restTemplate;
    private final String academicServiceUrl = "http://localhost:8081";

    public AcademicServiceClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Get syllabus detail by syllabus ID
     */
    public SyllabusDetailDto getSyllabusDetail(Long syllabusId) {
        try {
            String url = academicServiceUrl + "/api/syllabi/{id}/detail";
            return restTemplate.getForObject(url, SyllabusDetailDto.class, syllabusId);
        } catch (Exception e) {
            // Return fallback or throw custom exception
            return null;
        }
    }

    /**
     * Search syllabi by query text (full-text search)
     */
    public List<SyllabusDetailDto> searchSyllabi(String query) {
        try {
            String url = academicServiceUrl + "/api/syllabi/search?q={q}";
            SyllabusDetailDto[] results = restTemplate.getForObject(url, SyllabusDetailDto[].class, query);
            return results != null ? Arrays.asList(results) : List.of();
        } catch (Exception e) {
            return List.of();
        }
    }

    /**
     * Get CLOs for a syllabus
     */
    public List<CloSummaryDto> getClosBySyllabus(Long syllabusId) {
        try {
            String url = academicServiceUrl + "/api/clos/syllabus/{id}";
            CloSummaryDto[] results = restTemplate.getForObject(url, CloSummaryDto[].class, syllabusId);
            return results != null ? Arrays.asList(results) : List.of();
        } catch (Exception e) {
            return List.of();
        }
    }

    /**
     * Get CLO-PLO mappings for a syllabus
     */
    public List<CloMappingDto> getCloMappingsBySyllabus(Long syllabusId) {
        try {
            String url = academicServiceUrl + "/api/clo-mappings/syllabus/{id}";
            CloMappingDto[] results = restTemplate.getForObject(url, CloMappingDto[].class, syllabusId);
            return results != null ? Arrays.asList(results) : List.of();
        } catch (Exception e) {
            return List.of();
        }
    }

    /**
     * Get subject relationship tree (prerequisites, corequisites)
     */
    public SubjectRelationshipDto getSubjectRelationship(Long subjectId) {
        try {
            String url = academicServiceUrl + "/api/subjects/{id}/relationships";
            return restTemplate.getForObject(url, SubjectRelationshipDto.class, subjectId);
        } catch (Exception e) {
            return null;
        }
    }
}
