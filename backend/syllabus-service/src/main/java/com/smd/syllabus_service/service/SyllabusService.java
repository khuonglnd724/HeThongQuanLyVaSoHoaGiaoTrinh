package com.smd.syllabus_service.service;

import com.smd.syllabus_service.dto.SyllabusListItemDto;
import com.smd.syllabus_service.repo.SyllabusRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SyllabusService {

    private final SyllabusRepository repo;

    public SyllabusService(SyllabusRepository repo) {
        this.repo = repo;
    }

    public List<SyllabusListItemDto> list() {
        return repo.findAll().stream()
                .map(s -> new SyllabusListItemDto(s.getId(), s.getName(), s.getCourseCode()))
                .toList();
    }
}
