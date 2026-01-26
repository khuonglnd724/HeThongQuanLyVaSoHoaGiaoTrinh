package com.smd.syllabus.controller;

import com.smd.syllabus.dto.CreateCommentRequest;
import com.smd.syllabus.dto.ReviewCommentResponse;
import com.smd.syllabus.service.ReviewCommentService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/review-comments")
public class ReviewCommentController {

    private final ReviewCommentService service;

    public ReviewCommentController(ReviewCommentService service) {
        this.service = service;
    }

    @PostMapping
    public ReviewCommentResponse add(
            @RequestHeader("X-User-Id") String userId,
            @RequestBody CreateCommentRequest req) {
        // Convert header to Long because auth-service uses Long userId
        Long authorId = Long.valueOf(userId);

        return ReviewCommentResponse.from(
                service.add(
                        req.getSyllabusId(),
                        req.getSectionKey(),
                        req.getContent(),
                        authorId));
    }

    @GetMapping("/syllabus/{syllabusId}")
    public List<ReviewCommentResponse> list(@PathVariable UUID syllabusId) {
        return service.list(syllabusId)
                .stream()
                .map(ReviewCommentResponse::from)
                .toList();
    }

    @DeleteMapping("/{id}")
    public void delete(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable UUID id) {
        Long requesterId = Long.valueOf(userId);
        service.delete(id, requesterId);
    }

    @PutMapping("/{id}")
    public ReviewCommentResponse update(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable UUID id,
            @RequestBody com.smd.syllabus.dto.UpdateCommentRequest req) {
        Long requesterId = Long.valueOf(userId);
        return ReviewCommentResponse.from(service.update(id, req.getContent(), requesterId));
    }

}
