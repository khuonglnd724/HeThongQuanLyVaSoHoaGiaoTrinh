package com.smd.public_service.controller;

import com.smd.public_service.client.AcademicServiceClient;
import com.smd.public_service.client.SyllabusServiceClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Public Data Controller - Read-only endpoints for guest users
 * This controller provides public access to data from other services
 * without requiring authentication, while respecting microservice boundaries
 */
@Slf4j
@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicDataController {
    
    private final AcademicServiceClient academicServiceClient;
    private final SyllabusServiceClient syllabusServiceClient;

    /**
     * Get all programs (for guest users to filter by major)
     * GET /api/public/programs
     * Read-only endpoint - no authentication required
     */
    @GetMapping("/programs")
    public ResponseEntity<?> getAllPrograms() {
        log.info("Fetching all programs for public access");
        try {
            var programs = academicServiceClient.getAllPrograms();
            log.info("Successfully fetched {} programs", programs.size());
            return ResponseEntity.ok(programs);
        } catch (Exception e) {
            log.error("Error fetching programs: {}", e.getMessage());
            // Return empty list instead of error to not break the UI
            return ResponseEntity.ok(List.of());
        }
    }

    /**
     * Get public syllabuses (PUBLISHED status)
     * GET /api/public/syllabuses
     * GET /api/public/syllabuses?subjectCodes=CS101,CS102
     * Read-only endpoint - no authentication required
     */
    @GetMapping("/syllabuses")
    public ResponseEntity<?> getPublicSyllabuses(
            @RequestParam(value = "subjectCodes", required = false) List<String> subjectCodes) {
        log.info("Fetching public syllabuses, subjectCodes: {}", subjectCodes);
        try {
            var syllabuses = syllabusServiceClient.getPublicSyllabuses(subjectCodes);
            log.info("Successfully fetched {} syllabuses", syllabuses.size());
            return ResponseEntity.ok(syllabuses);
        } catch (Exception e) {
            log.error("Error fetching public syllabuses: {}", e.getMessage());
            // Return empty list instead of error to not break the UI
            return ResponseEntity.ok(List.of());
        }
    }

    /**
     * Get subjects by program name (for filtering syllabuses by program)
     * GET /api/public/subjects/by-program?programName=Software+Engineering
     * Read-only endpoint - no authentication required
     */
    @GetMapping("/subjects/by-program")
    public ResponseEntity<?> getSubjectsByProgram(
            @RequestParam(value = "programName") String programName) {
        log.info("Fetching subjects for program: {}", programName);
        try {
            var subjects = academicServiceClient.getSubjectsByProgramName(programName);
            log.info("Successfully fetched subjects for program: {}", programName);
            return ResponseEntity.ok(subjects);
        } catch (Exception e) {
            log.error("Error fetching subjects for program {}: {}", programName, e.getMessage());
            // Return empty result instead of error
            return ResponseEntity.ok(Map.of("data", List.of()));
        }
    }

    /**
     * Get syllabus detail by ID (PUBLISHED status only)
     * GET /api/public/syllabuses/{id}
     * Read-only endpoint - no authentication required
     * Only returns syllabuses with PUBLISHED status
     */
    @GetMapping("/syllabuses/{id}")
    public ResponseEntity<?> getSyllabusDetail(@PathVariable String id) {
        log.info("Fetching public syllabus detail: {}", id);
        try {
            var syllabus = syllabusServiceClient.getSyllabusById(id);
            
            if (syllabus.isEmpty()) {
                log.warn("Syllabus not found or not published: {}", id);
                return ResponseEntity.ok(Map.of());
            }
            
            log.info("Successfully fetched syllabus detail: {}", id);
            return ResponseEntity.ok(syllabus);
        } catch (Exception e) {
            log.error("Error fetching syllabus detail {}: {}", id, e.getMessage());
            // Return empty map instead of error
            return ResponseEntity.ok(Map.of());
        }
    }

    /**
     * Get documents for a syllabus (PUBLIC access)
     * GET /api/public/syllabuses/{id}/documents
     * Read-only endpoint - no authentication required
     * Returns documents for published syllabuses
     */
    @GetMapping("/syllabuses/{id}/documents")
    public ResponseEntity<?> getSyllabusDocuments(@PathVariable String id) {
        log.info("Fetching documents for public syllabus: {}", id);
        try {
            var documents = syllabusServiceClient.getDocumentsForSyllabus(id);
            
            if (documents.isEmpty()) {
                log.warn("No documents found for syllabus: {}", id);
                return ResponseEntity.ok(Map.of("documents", List.of()));
            }
            
            log.info("Successfully fetched documents for syllabus: {}", id);
            return ResponseEntity.ok(documents);
        } catch (Exception e) {
            log.error("Error fetching documents for syllabus {}: {}", id, e.getMessage());
            // Return empty result instead of error
            return ResponseEntity.ok(Map.of("documents", List.of()));
        }
    }

    /**
     * Download document (PUBLIC access)
     * GET /api/public/documents/{documentId}/download
     * Proxy download request to syllabus-service
     * Returns the actual document file content with proper headers
     */
    @GetMapping("/documents/{documentId}/download")
    public ResponseEntity<?> downloadDocument(@PathVariable String documentId) {
        log.info("Downloading public document: {}", documentId);
        try {
            var document = syllabusServiceClient.downloadDocumentWithMetadata(documentId);
            
            if (document == null || document.isEmpty()) {
                log.warn("Document not found: {}", documentId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Document not found"));
            }
            
            byte[] content = (byte[]) document.get("content");
            String fileName = (String) document.get("fileName");
            String contentType = (String) document.get("contentType");
            
            if (content == null || content.length == 0) {
                log.warn("Document content is empty: {}", documentId);
                return ResponseEntity.status(HttpStatus.NO_CONTENT)
                    .body(Map.of("error", "Document is empty"));
            }
            
            // Set proper headers for binary file download
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(contentType != null ? contentType : "application/octet-stream"));
            headers.setContentLength(content.length);
            headers.setContentDispositionFormData("attachment", fileName);
            headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");
            headers.set("Pragma", "public");
            
            log.info("Successfully downloaded document: {} ({}KB)", documentId, content.length / 1024);
            return new ResponseEntity<>(content, headers, HttpStatus.OK);
            
        } catch (Exception e) {
            log.error("Error downloading document {}: {}", documentId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to download document"));
        }
    }
}
