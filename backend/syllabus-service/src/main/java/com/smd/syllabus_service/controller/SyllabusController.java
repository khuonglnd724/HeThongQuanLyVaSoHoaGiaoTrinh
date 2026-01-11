package com.smd.syllabus_service.controller;

import com.smd.syllabus_service.api.ApiResponse;
import com.smd.syllabus_service.dto.SyllabusListItemDto;
import com.smd.syllabus_service.service.SyllabusService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/syllabus")
public class SyllabusController {

    private final SyllabusService syllabusService;

    public SyllabusController(SyllabusService syllabusService) {
        this.syllabusService = syllabusService;
    }

    @GetMapping
    public ApiResponse<List<SyllabusListItemDto>> listSyllabuses() {
        return ApiResponse.ok(syllabusService.list());
    }
}
