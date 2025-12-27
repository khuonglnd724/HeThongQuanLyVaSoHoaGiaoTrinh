package com.smd.public_service.controller;

import com.smd.public_service.dto.SyllabusDiffDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public/syllabi")
public class ComparisonController {

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
     * Get PDF export of a syllabus
     */
    @GetMapping("/{id}/export/pdf")
    public ResponseEntity<?> exportSyllabusPdf(
            @PathVariable Long id,
            @RequestParam(required = false) String version
    ) {
        // TODO: Implement PDF export
        // - Fetch syllabus detail
        // - Generate PDF using library (e.g., iText, PDFBox)
        // - Return PDF file for download
        return ResponseEntity.ok("PDF export not yet implemented");
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
