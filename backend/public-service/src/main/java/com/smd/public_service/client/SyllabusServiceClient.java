package com.smd.public_service.client;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;
import java.util.Map;

/**
 * Client for Syllabus Service
 * Provides read-only access to syllabus data (public syllabuses)
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class SyllabusServiceClient {
    
    private final RestTemplate restTemplate;
    
    @Value("${services.syllabus-service.url:http://localhost:8085}")
    private String syllabusServiceUrl;

    /**
     * Get public syllabuses (PUBLISHED status)
     * Calls: GET /api/syllabuses/public
     * Calls: GET /api/syllabuses/public?subjectCodes=CS101,CS102 (with filter)
     */
    public List<Map<String, Object>> getPublicSyllabuses(List<String> subjectCodes) {
        UriComponentsBuilder builder = UriComponentsBuilder
            .fromHttpUrl(syllabusServiceUrl + "/api/syllabuses/public");
        
        if (subjectCodes != null && !subjectCodes.isEmpty()) {
            subjectCodes.forEach(code -> builder.queryParam("subjectCodes", code));
        }
        
        String url = builder.toUriString();
        log.info("Calling syllabus-service: GET {}", url);
        
        try {
            var response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<List<Map<String, Object>>>() {}
            );
            return response.getBody() != null ? response.getBody() : List.of();
        } catch (Exception e) {
            log.error("Error calling syllabus-service to get public syllabuses: {}", e.getMessage());
            log.warn("Returning empty list for syllabuses due to error");
            return List.of(); // Return empty list instead of throwing exception
        }
    }

    /**
     * Get syllabus detail by ID (PUBLISHED status only)
     * Calls: GET /api/syllabuses/{id}
     * For guest users - only returns if syllabus is PUBLISHED
     */
    public Map<String, Object> getSyllabusById(String id) {
        String url = syllabusServiceUrl + "/api/syllabuses/" + id;
        log.info("Calling syllabus-service: GET {}", url);
        
        try {
            var response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<Map<String, Object>>() {}
            );
            
            if (response.getBody() != null) {
                Map<String, Object> syllabus = response.getBody();
                // Check if it's PUBLISHED or in data wrapper
                Map<String, Object> data = (Map<String, Object>) syllabus.get("data");
                if (data != null) {
                    syllabus = data;
                }
                
                // Verify it's PUBLISHED before returning
                String status = (String) syllabus.get("status");
                if ("PUBLISHED".equals(status)) {
                    log.info("Successfully fetched published syllabus: {}", id);
                    return syllabus;
                } else {
                    log.warn("Syllabus {} is not PUBLISHED, status: {}", id, status);
                    return Map.of();
                }
            }
            return Map.of();
        } catch (Exception e) {
            log.error("Error calling syllabus-service to get syllabus {}: {}", id, e.getMessage());
            return Map.of(); // Return empty map instead of throwing exception
        }
    }

    /**
     * Get documents for a syllabus
     * Calls: GET /api/syllabus/documents/syllabus/{id}
     * For guest users - returns documents for public/published syllabuses
     * 
     * Note: Syllabus-service returns an array directly, not a Map
     */
    public Map<String, Object> getDocumentsForSyllabus(String syllabusId) {
        String url = syllabusServiceUrl + "/api/syllabus/documents/syllabus/" + syllabusId;
        log.info("Calling syllabus-service: GET {}", url);
        
        try {
            // First try to get as List (direct array response)
            try {
                var listResponse = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<List<Map<String, Object>>>() {}
                );
                
                if (listResponse.getBody() != null && !listResponse.getBody().isEmpty()) {
                    List<Map<String, Object>> documents = listResponse.getBody();
                    log.info("Successfully fetched {} documents for syllabus: {}", documents.size(), syllabusId);
                    return Map.of("documents", documents);
                }
            } catch (Exception e) {
                log.debug("Failed to parse as List, trying Map format: {}", e.getMessage());
            }
            
            // Fallback: try to get as Map (wrapped response)
            var mapResponse = restTemplate.exchange(
                url,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<Map<String, Object>>() {}
            );
            
            if (mapResponse.getBody() != null) {
                Map<String, Object> body = mapResponse.getBody();
                log.info("Received map response from syllabus-service");
                
                // Handle wrapped response (data field)
                Map<String, Object> data = (Map<String, Object>) body.get("data");
                if (data != null && data.containsKey("documents")) {
                    List<?> documents = (List<?>) data.get("documents");
                    log.info("Successfully fetched {} documents (wrapped format) for syllabus: {}", 
                        documents.size(), syllabusId);
                    return data;
                }
                
                // Handle direct response (documents field)
                if (body.containsKey("documents")) {
                    List<?> documents = (List<?>) body.get("documents");
                    log.info("Successfully fetched {} documents (direct format) for syllabus: {}", 
                        documents.size(), syllabusId);
                    return body;
                }
                
                // No documents found
                log.warn("No documents found in response for syllabus: {}", syllabusId);
            }
            
            return Map.of("documents", List.of());
        } catch (Exception e) {
            log.error("Error calling syllabus-service to get documents for syllabus {}: {}", syllabusId, e.getMessage(), e);
            return Map.of("documents", List.of()); // Return empty documents instead of throwing exception
        }
    }

    /**
     * Download document with metadata
     * Returns: {content: byte[], fileName: String, contentType: String}
     */
    public Map<String, Object> downloadDocumentWithMetadata(String documentId) {
        String url = syllabusServiceUrl + "/api/syllabus/documents/" + documentId + "/download";
        log.info("Calling syllabus-service to download document: {}", url);
        
        try {
            // First, get document metadata to retrieve fileName and contentType
            Map<String, Object> metadata = getDocumentMetadata(documentId);
            String fileName = (String) metadata.getOrDefault("originalName", "document.pdf");
            String contentType = (String) metadata.getOrDefault("mimeType", "application/pdf");
            
            // Download the actual file content
            var response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                null,
                byte[].class
            );
            
            if (response.getBody() != null && response.getBody().length > 0) {
                log.info("Successfully downloaded document: {} ({} bytes)", documentId, response.getBody().length);
                return Map.of(
                    "content", response.getBody(),
                    "fileName", fileName,
                    "contentType", contentType
                );
            }
            
            log.warn("Empty document response for: {}", documentId);
            return Map.of();
        } catch (Exception e) {
            log.error("Error downloading document {}: {}", documentId, e.getMessage(), e);
            throw new RuntimeException("Failed to download document: " + e.getMessage(), e);
        }
    }

    /**
     * Get document metadata (fileName, mimeType, etc.)
     * Helper method for downloadDocumentWithMetadata
     */
    private Map<String, Object> getDocumentMetadata(String documentId) {
        // Try to extract from documents list - this is a workaround
        // In a real scenario, you'd have a dedicated metadata endpoint
        log.debug("Attempting to get document metadata for: {}", documentId);
        return Map.of(
            "originalName", "document.pdf",
            "mimeType", "application/pdf"
        );
    }

    /**
     * Download document file (old method - kept for compatibility)
     * Calls: GET /api/syllabus/documents/{id}/download
     * Returns the actual file content with proper headers
     */
    @Deprecated
    public byte[] downloadDocument(String documentId) {
        String url = syllabusServiceUrl + "/api/syllabus/documents/" + documentId + "/download";
        log.info("Calling syllabus-service to download document: {}", url);
        
        try {
            var response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                null,
                byte[].class
            );
            
            if (response.getBody() != null) {
                log.info("Successfully downloaded document: {}", documentId);
                return response.getBody();
            }
            
            log.warn("Empty document response for: {}", documentId);
            return new byte[0];
        } catch (Exception e) {
            log.error("Error downloading document {}: {}", documentId, e.getMessage(), e);
            throw new RuntimeException("Failed to download document: " + e.getMessage(), e);
        }
    }
}
