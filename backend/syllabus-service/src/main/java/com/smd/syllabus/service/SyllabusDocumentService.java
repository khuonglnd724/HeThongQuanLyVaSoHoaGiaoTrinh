package com.smd.syllabus.service;

import com.smd.syllabus.domain.DocumentFileType;
import com.smd.syllabus.domain.DocumentStatus;
import com.smd.syllabus.domain.Syllabus;
import com.smd.syllabus.domain.SyllabusDocument;
import com.smd.syllabus.dto.DocumentResponse;
import com.smd.syllabus.exception.ResourceNotFoundException;
import com.smd.syllabus.repository.SyllabusDocumentRepository;
import com.smd.syllabus.repository.SyllabusRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SyllabusDocumentService {

    private final SyllabusDocumentRepository documentRepository;
    private final SyllabusRepository syllabusRepository;

    @Value("${smd.file.upload.directory:./uploads/syllabus-documents}")
    private String uploadDirectory;

    @Value("${smd.file.max.size:52428800}") // 50MB default
    private Long maxFileSize;

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            "pdf", "docx", "doc", "pptx", "ppt", "xlsx", "xls"
    );

    public SyllabusDocumentService(SyllabusDocumentRepository documentRepository,
                                   SyllabusRepository syllabusRepository) {
        this.documentRepository = documentRepository;
        this.syllabusRepository = syllabusRepository;
    }

    /**
     * Upload a teaching material document
     */
    @Transactional
    public DocumentResponse uploadDocument(UUID syllabusId, MultipartFile file,
                                         String uploadedBy, String description) throws IOException {
        // Validate file
        validateFile(file);

        // Check if syllabus exists
        Syllabus syllabus = syllabusRepository.findById(syllabusId)
                .orElseThrow(() -> new ResourceNotFoundException("Syllabus not found with id: " + syllabusId));

        // Generate unique filename
        String originalName = file.getOriginalFilename();
        String extension = getFileExtension(originalName);
        String uniqueFileName = UUID.randomUUID().toString() + "." + extension;

        // Create upload directory if not exists
        Path uploadPath = Paths.get(uploadDirectory);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Save file to disk
        Path filePath = uploadPath.resolve(uniqueFileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // Create document entity
        SyllabusDocument document = new SyllabusDocument();
        document.setSyllabusId(syllabusId);
        document.setFileName(uniqueFileName);
        document.setOriginalName(originalName);
        document.setFileType(mapFileType(extension));
        document.setFileSize(file.getSize());
        document.setFilePath(filePath.toString());
        document.setMimeType(file.getContentType());
        document.setUploadedBy(uploadedBy);
        document.setSyllabusVersion(syllabus.getVersionNo());
        document.setStatus(DocumentStatus.DRAFT);
        document.setDescription(description);

        SyllabusDocument saved = documentRepository.save(document);
        return DocumentResponse.fromEntity(saved);
    }

    /**
     * Get all documents for a syllabus
     */
    public List<DocumentResponse> getDocumentsBySyllabus(UUID syllabusId) {
        List<SyllabusDocument> documents = documentRepository.findBySyllabusIdAndDeletedFalse(syllabusId);
        return documents.stream()
                .map(DocumentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get documents by syllabus and version
     */
    public List<DocumentResponse> getDocumentsBySyllabusVersion(UUID syllabusId, Integer version) {
        List<SyllabusDocument> documents = documentRepository
                .findBySyllabusIdAndSyllabusVersionAndDeletedFalse(syllabusId, version);
        return documents.stream()
                .map(DocumentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get documents uploaded by lecturer
     */
    public List<DocumentResponse> getDocumentsByLecturer(String lecturerUsername) {
        List<SyllabusDocument> documents = documentRepository.findByUploadedByAndDeletedFalse(lecturerUsername);
        return documents.stream()
                .map(DocumentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Download a document
     */
    public byte[] downloadDocument(UUID documentId) throws IOException {
        SyllabusDocument document = documentRepository.findByIdAndDeletedFalse(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + documentId));

        Path filePath = Paths.get(document.getFilePath());
        if (!Files.exists(filePath)) {
            throw new ResourceNotFoundException("File not found on disk: " + document.getFileName());
        }

        return Files.readAllBytes(filePath);
    }

    /**
     * Get document metadata
     */
    public DocumentResponse getDocumentInfo(UUID documentId) {
        SyllabusDocument document = documentRepository.findByIdAndDeletedFalse(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + documentId));
        return DocumentResponse.fromEntity(document);
    }

    /**
     * Delete a document (soft delete)
     */
    @Transactional
    public void deleteDocument(UUID documentId, String deletedBy) throws IOException {
        SyllabusDocument document = documentRepository.findByIdAndDeletedFalse(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + documentId));

        // Soft delete in database
        document.setDeleted(true);
        documentRepository.save(document);

        // Optionally delete physical file (or keep for audit)
        // Path filePath = Paths.get(document.getFilePath());
        // Files.deleteIfExists(filePath);
    }

    /**
     * Approve documents when syllabus is approved
     */
    @Transactional
    public void approveDocuments(UUID syllabusId) {
        List<SyllabusDocument> documents = documentRepository.findBySyllabusIdAndDeletedFalse(syllabusId);
        for (SyllabusDocument doc : documents) {
            if (doc.getStatus() == DocumentStatus.DRAFT) {
                doc.setStatus(DocumentStatus.APPROVED);
                documentRepository.save(doc);
            }
        }
    }

    /**
     * Get statistics for syllabus documents
     */
    public Map<String, Object> getDocumentStatistics(UUID syllabusId) {
        long count = documentRepository.countBySyllabusId(syllabusId);
        long totalSize = documentRepository.getTotalFileSizeBySyllabusId(syllabusId);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalDocuments", count);
        stats.put("totalSizeBytes", totalSize);
        stats.put("totalSizeMB", totalSize / (1024.0 * 1024.0));
        return stats;
    }

    // Helper methods
    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty");
        }

        if (file.getSize() > maxFileSize) {
            throw new IllegalArgumentException(
                    String.format("File size exceeds maximum limit of %d MB", maxFileSize / (1024 * 1024)));
        }

        String extension = getFileExtension(file.getOriginalFilename());
        if (!ALLOWED_EXTENSIONS.contains(extension.toLowerCase())) {
            throw new IllegalArgumentException(
                    "File type not allowed. Supported types: " + String.join(", ", ALLOWED_EXTENSIONS));
        }
    }

    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            throw new IllegalArgumentException("Invalid filename");
        }
        return filename.substring(filename.lastIndexOf('.') + 1);
    }

    private DocumentFileType mapFileType(String extension) {
        return switch (extension.toLowerCase()) {
            case "pdf" -> DocumentFileType.PDF;
            case "docx" -> DocumentFileType.DOCX;
            case "doc" -> DocumentFileType.DOC;
            case "pptx" -> DocumentFileType.PPTX;
            case "ppt" -> DocumentFileType.PPT;
            case "xlsx" -> DocumentFileType.XLSX;
            case "xls" -> DocumentFileType.XLS;
            default -> throw new IllegalArgumentException("Unsupported file type: " + extension);
        };
    }
}
