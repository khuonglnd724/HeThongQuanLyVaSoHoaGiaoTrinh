package com.smd.public_service.controller;

import com.smd.public_service.dto.SearchResponse;
import com.smd.public_service.service.SyllabusSearchService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/public/syllabi")
@RequiredArgsConstructor
public class SyllabusSearchController {
    
    private final SyllabusSearchService searchService;

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
        Integer semesterInt = semester != null ? Integer.parseInt(semester) : null;
        SearchResponse response = searchService.search(q, code, major, semesterInt, year, version, sort, page, size, fuzzy, highlight);
        return ResponseEntity.ok(response);
    }

}
