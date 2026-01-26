package com.smd.public_service.client;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;

import java.util.List;
import java.util.Map;

/**
 * Client for Academic Service
 * Provides read-only access to academic data (programs, subjects)
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AcademicServiceClient {
    
    private final RestTemplate restTemplate;
    
    @Value("${services.academic-service.url:http://localhost:8083}")
    private String academicServiceUrl;

    /**
     * Get all programs
     * Calls: GET /api/v1/program
     */
    public List<Map<String, Object>> getAllPrograms() {
        String url = academicServiceUrl + "/api/v1/program";
        log.info("Calling academic-service: GET {}", url);
        
        try {
            var response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<List<Map<String, Object>>>() {}
            );
            return response.getBody() != null ? response.getBody() : List.of();
        } catch (Exception e) {
            log.error("Error calling academic-service to get programs: {}", e.getMessage());
            log.warn("Returning empty list for programs due to error");
            return List.of(); // Return empty list instead of throwing exception
        }
    }

    /**
     * Get subjects by program name
     * Calls: GET /api/v1/subject/program/search?name={programName}
     */
    public Map<String, Object> getSubjectsByProgramName(String programName) {
        String url = academicServiceUrl + "/api/v1/subject/program/search?name=" + programName;
        log.info("Calling academic-service: GET {}", url);
        
        try {
            var response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<Map<String, Object>>() {}
            );
            return response.getBody() != null ? response.getBody() : Map.of();
        } catch (Exception e) {
            log.error("Error calling academic-service to get subjects for program {}: {}", programName, e.getMessage());
            log.warn("Returning empty map for subjects due to error");
            return Map.of("data", List.of()); // Return empty result instead of throwing
        }
    }
}
