package com.smd.public_service.controller;

import com.smd.public_service.dto.FollowRequestDto;
import com.smd.public_service.dto.FeedbackRequestDto;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public")
public class EngagementController {

    /**
     * Follow/Subscribe to a syllabus for change notifications
     */
    @PostMapping("/syllabi/{id}/follow")
    public ResponseEntity<String> followSyllabus(
            @PathVariable Long id,
            @RequestBody FollowRequestDto followRequest
    ) {
        // TODO: Implement follow functionality
        // - Save subscription to database
        // - Send confirmation email
        return ResponseEntity.status(HttpStatus.CREATED)
                .body("Successfully subscribed to syllabus " + id);
    }

    /**
     * Unfollow/Unsubscribe from a syllabus
     */
    @DeleteMapping("/syllabi/{id}/follow")
    public ResponseEntity<String> unfollowSyllabus(
            @PathVariable Long id,
            @RequestParam String userEmail
    ) {
        // TODO: Implement unfollow functionality
        return ResponseEntity.ok("Successfully unsubscribed from syllabus " + id);
    }

    /**
     * Submit feedback/report for a syllabus
     */
    @PostMapping("/syllabi/{id}/feedback")
    public ResponseEntity<String> submitFeedback(
            @PathVariable Long id,
            @RequestBody FeedbackRequestDto feedbackRequest
    ) {
        // TODO: Implement feedback submission
        // - Save feedback to database
        // - Send notification to admins
        return ResponseEntity.status(HttpStatus.CREATED)
                .body("Feedback submitted successfully for syllabus " + id);
    }

    /**
     * Get user's subscribed syllabi
     */
    @GetMapping("/users/{userEmail}/subscriptions")
    public ResponseEntity<?> getUserSubscriptions(@PathVariable String userEmail) {
        // TODO: Implement get subscriptions
        return ResponseEntity.ok("{}");
    }
}
