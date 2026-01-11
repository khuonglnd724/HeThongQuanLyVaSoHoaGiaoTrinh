package com.smd.public_service.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * FeedbackResponseDto - Kết quả gửi phản hồi
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackResponseDto {
    
    @JsonProperty("id")
    private Long id;
    
    @JsonProperty("syllabusId")
    private Long syllabusId;
    
    @JsonProperty("feedbackType")
    private String feedbackType;
    
    @JsonProperty("title")
    private String title;
    
    @JsonProperty("message")
    private String message;
    
    @JsonProperty("status")
    private String status; // SUBMITTED, ACKNOWLEDGED, RESOLVED, CLOSED
    
    @JsonProperty("createdAt")
    private Long createdAt;
    
    @JsonProperty("updatedAt")
    private Long updatedAt;
    
    @JsonProperty("response")
    private String response;
    
    @JsonProperty("message_success")
    private String messageSuccess;
}
