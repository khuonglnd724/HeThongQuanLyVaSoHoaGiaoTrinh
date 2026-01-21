package com.smd.public_service.controller;

import com.smd.public_service.dto.SearchResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api/public/syllabi")
public class SyllabusSearchController {

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

        // Scaffold implementation: return empty result set for now
        SearchResponse response = new SearchResponse(0L, page, size, Collections.emptyList());
        return ResponseEntity.ok(response);
    }

        @GetMapping("/health")
        public ResponseEntity<Map<String, Object>> health() {
            Map<String, Object> health = new HashMap<>();
            health.put("status", "UP");
            health.put("service", "public-service");
            health.put("timestamp", System.currentTimeMillis());
            return ResponseEntity.ok(health);
        }

}
