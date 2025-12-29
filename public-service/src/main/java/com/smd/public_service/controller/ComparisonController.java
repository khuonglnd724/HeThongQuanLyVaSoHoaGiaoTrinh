package com.smd.public_service.controller;

import com.smd.public_service.dto.SyllabusDiffDto;
import com.smd.public_service.service.PdfExportService;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.http.HttpHeaders;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/public/syllabi")
public class ComparisonController {

    private static final Logger logger = LoggerFactory.getLogger(ComparisonController.class);

    private final PdfExportService pdfExportService;

    public ComparisonController(PdfExportService pdfExportService) {
        this.pdfExportService = pdfExportService;
    }

    /**
     * Compare two versions of a syllabus
     * Returns diff in structured format (field changes with OLD/NEW values)
     */
    @GetMapping("/{id}/compare")
    public ResponseEntity<List<SyllabusDiffDto>> compareSyllabusVersions(
            @PathVariable Long id,
            @RequestParam String version1,
            @RequestParam String version2
    ) {
        // TODO: Implement comparison logic
        // - Fetch both versions from academic-service
        // - Calculate diff (field-by-field)
        // - Return structured diff with changeType (ADDED, REMOVED, MODIFIED)
        return ResponseEntity.ok(List.of());
    }

    /**
     * Export syllabus to PDF format
     * 
     * @param id      ID của giáo trình
     * @param version Phiên bản giáo trình (tuỳ chọn)
     * @return PDF file ready for download
     */
    @GetMapping("/{id}/export/pdf")
    public ResponseEntity<?> exportSyllabusPdf(
            @PathVariable Long id,
            @RequestParam(required = false) String version
    ) {
        try {
            logger.info("Xuất PDF cho giáo trình ID: {}, version: {}", id, version);

            // Tạo file PDF
            byte[] pdfContent = pdfExportService.exportSyllabusToPdf(id, version);

            // Tạo tên file
            String filename = "syllabus_" + id + (version != null ? "_" + version : "") + ".pdf";

            // Trả về file PDF
            return ResponseEntity
                    .ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_PDF_VALUE)
                    .body(pdfContent);

        } catch (IllegalArgumentException e) {
            logger.error("Giáo trình không tìm thấy: {}", id);
            return ResponseEntity.notFound().build();
        } catch (IOException e) {
            logger.error("Lỗi khi xuất PDF: {}", e.getMessage());
            return ResponseEntity.status(500)
                    .body("Lỗi khi tạo PDF: " + e.getMessage());
        } catch (Exception e) {
            logger.error("Lỗi không dự đoán: {}", e.getMessage());
            return ResponseEntity.status(500)
                    .body("Lỗi server: " + e.getMessage());
        }
    }

    /**
     * Get HTML export of a syllabus
     */
    @GetMapping("/{id}/export/html")
    public ResponseEntity<?> exportSyllabusHtml(
            @PathVariable Long id,
            @RequestParam(required = false) String version
    ) {
        // TODO: Implement HTML export
        return ResponseEntity.ok("HTML export not yet implemented");
    }
}
