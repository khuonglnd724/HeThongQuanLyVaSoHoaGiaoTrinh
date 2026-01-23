package com.smd.syllabus.controller;

import com.smd.syllabus.dto.DocumentResponse;
import com.smd.syllabus.service.SyllabusDocumentService;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Controller for managing syllabus teaching materials
 * Handles upload, download, and management of documents
 */
@RestController
@RequestMapping("/api/syllabus/documents")
public class SyllabusDocumentController {

    private final SyllabusDocumentService documentService;
    private static final Logger LOGGER = LoggerFactory.getLogger(SyllabusDocumentController.class);

    public SyllabusDocumentController(SyllabusDocumentService documentService) {
        this.documentService = documentService;
    }

    /**
     * Upload a teaching material document
     * POST /api/syllabus/documents/upload
     */
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("syllabusId") UUID syllabusId,
            @RequestParam(value = "description", required = false) String description,
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            Authentication authentication) {
        try {
            String username = authentication != null ? authentication.getName() : userId;
            if (username == null || username.isBlank()) {
            LOGGER.warn("Upload attempt without authentication header: syllabusId={} userHeader={} authPresent={}",
                syllabusId, userId, authentication != null);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Unauthorized"));
            }
            LOGGER.info("Upload request: syllabusId={}, user={}, filename={}, size={}, contentType={}",
                    syllabusId, username, file.getOriginalFilename(), file.getSize(), file.getContentType());

            DocumentResponse response = documentService.uploadDocument(syllabusId, file, username, description);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            LOGGER.warn("Validation error during upload: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (IOException e) {
            LOGGER.error("IOException while uploading file for syllabusId={}", syllabusId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to upload file: " + e.getMessage()));
        }
    }

    /**
     * Get all documents for a syllabus
     * GET /api/syllabus/documents/syllabus/{syllabusId}
     */
    @GetMapping("/syllabus/{syllabusId}")
    public ResponseEntity<List<DocumentResponse>> getDocumentsBySyllabus(
            @PathVariable UUID syllabusId) {
        List<DocumentResponse> documents = documentService.getDocumentsBySyllabus(syllabusId);
        return ResponseEntity.ok(documents);
    }

    /**
     * Get documents by syllabus and version
     * GET /api/syllabus/documents/syllabus/{syllabusId}/version/{version}
     */
    @GetMapping("/syllabus/{syllabusId}/version/{version}")
    public ResponseEntity<List<DocumentResponse>> getDocumentsBySyllabusVersion(
            @PathVariable UUID syllabusId,
            @PathVariable Integer version) {
        List<DocumentResponse> documents = documentService.getDocumentsBySyllabusVersion(syllabusId, version);
        return ResponseEntity.ok(documents);
    }

    /**
     * Get documents uploaded by current lecturer
     * GET /api/syllabus/documents/my-documents
     */
    @GetMapping("/my-documents")
    public ResponseEntity<List<DocumentResponse>> getMyDocuments(Authentication authentication) {
        String username = authentication.getName();
        List<DocumentResponse> documents = documentService.getDocumentsByLecturer(username);
        return ResponseEntity.ok(documents);
    }

    /**
     * Download a document
     * GET /api/syllabus/documents/{documentId}/download
     */
    @GetMapping("/{documentId}/download")
    public ResponseEntity<Resource> downloadDocument(@PathVariable UUID documentId) {
        try {
            DocumentResponse docInfo = documentService.getDocumentInfo(documentId);
            byte[] data = documentService.downloadDocument(documentId);

            ByteArrayResource resource = new ByteArrayResource(data);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, 
                            "attachment; filename=\"" + docInfo.getOriginalName() + "\"")
                    .contentType(MediaType.parseMediaType(docInfo.getMimeType() != null 
                            ? docInfo.getMimeType() 
                            : "application/octet-stream"))
                    .contentLength(data.length)
                    .body(resource);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get document metadata
     * GET /api/syllabus/documents/{documentId}
     */
    @GetMapping("/{documentId}")
    public ResponseEntity<DocumentResponse> getDocumentInfo(@PathVariable UUID documentId) {
        DocumentResponse document = documentService.getDocumentInfo(documentId);
        return ResponseEntity.ok(document);
    }

    /**
     * Delete a document (soft delete)
     * DELETE /api/syllabus/documents/{documentId}
     */
    @DeleteMapping("/{documentId}")
    public ResponseEntity<?> deleteDocument(
            @PathVariable UUID documentId,
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            Authentication authentication) {
        try {
            String username = authentication != null ? authentication.getName() : userId;
            if (username == null || username.isBlank()) {
                LOGGER.warn("Delete attempt without authentication header: documentId={} userHeader={} authPresent= {}",
                        documentId, userId, authentication != null);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Unauthorized"));
            }
            documentService.deleteDocument(documentId, username);
            return ResponseEntity.ok(Map.of("message", "Document deleted successfully"));
        } catch (IOException e) {
            LOGGER.error("IOException while deleting documentId={}", documentId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to delete document: " + e.getMessage()));
        }
    }

    /**
     * Get document statistics for a syllabus
     * GET /api/syllabus/documents/syllabus/{syllabusId}/statistics
     */
    @GetMapping("/syllabus/{syllabusId}/statistics")
    public ResponseEntity<Map<String, Object>> getDocumentStatistics(@PathVariable UUID syllabusId) {
        Map<String, Object> stats = documentService.getDocumentStatistics(syllabusId);
        return ResponseEntity.ok(stats);
    }

    /**
     * Approve documents (called when syllabus is approved)
     * POST /api/syllabus/documents/syllabus/{syllabusId}/approve
     */
    @PostMapping("/syllabus/{syllabusId}/approve")
    public ResponseEntity<?> approveDocuments(@PathVariable UUID syllabusId) {
        documentService.approveDocuments(syllabusId);
        return ResponseEntity.ok(Map.of("message", "Documents approved successfully"));
    }
}
