package com.smd.public_service.controller;

import com.smd.public_service.dto.SearchResponse;
import com.smd.public_service.dto.SyllabusDetailDto;
import com.smd.public_service.dto.CloMappingDto;
import com.smd.public_service.dto.SubjectRelationshipDto;
import com.smd.public_service.service.PublicSyllabusService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public/syllabi")
public class SyllabusSearchController {

    private final PublicSyllabusService publicSyllabusService;

    public SyllabusSearchController(PublicSyllabusService publicSyllabusService) {
        this.publicSyllabusService = publicSyllabusService;
    }

    /**
     * Search syllabi with full-text search and filtering
     */
    @GetMapping("/search")
    public ResponseEntity<SearchResponse> search(
            @RequestParam(value = "q", required = false) String q,
            @RequestParam(value = "code", required = false) String code,
            @RequestParam(value = "major", required = false) String major,
            @RequestParam(value = "semester", required = false) String semester,
            @RequestParam(value = "year", required = false) Integer year,
            @RequestParam(value = "version", required = false) String version,
            @RequestParam(value = "sort", defaultValue = "relevance") String sort,
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "fuzzy", defaultValue = "true") boolean fuzzy,
            @RequestParam(value = "highlight", defaultValue = "true") boolean highlight
    ) {
        SearchResponse response = publicSyllabusService.searchSyllabi(
                q, code, major, semester, year, version, sort, page, size, fuzzy, highlight
        );
        return ResponseEntity.ok(response);
    }

    /**
     * Get detailed view of a syllabus
     */
    @GetMapping("/{id}")
    public ResponseEntity<SyllabusDetailDto> getSyllabusDetail(@PathVariable Long id) {
        SyllabusDetailDto detail = publicSyllabusService.getSyllabusDetail(id);
        if (detail != null) {
            return ResponseEntity.ok(detail);
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * Get AI-generated summary of a syllabus
     */
    @GetMapping("/{id}/summary")
    public ResponseEntity<String> getAISummary(@PathVariable Long id) {
        String summary = publicSyllabusService.generateAISummary(id);
        if (summary != null) {
            return ResponseEntity.ok(summary);
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * Get CLO-PLO mapping for a syllabus
     */
    @GetMapping("/{id}/clo-mappings")
    public ResponseEntity<List<CloMappingDto>> getCloMappings(@PathVariable Long id) {
        List<CloMappingDto> mappings = publicSyllabusService.getCloMappings(id);
        return ResponseEntity.ok(mappings);
    }

    /**
     * Get subject relationship tree (prerequisites and corequisites)
     */
    @GetMapping("/subjects/{subjectId}/relationships")
    public ResponseEntity<SubjectRelationshipDto> getSubjectRelationships(@PathVariable Long subjectId) {
        SubjectRelationshipDto relationships = publicSyllabusService.getSubjectRelationshipTree(subjectId);
        if (relationships != null) {
            return ResponseEntity.ok(relationships);
        }
        return ResponseEntity.notFound().build();
    }

}
