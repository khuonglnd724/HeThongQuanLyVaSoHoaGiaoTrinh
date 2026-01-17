package com.smd.public_service.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * FeedbackRequestDto - Gửi phản hồi/báo cáo lỗi
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackRequestDto {
    
    @JsonProperty("syllabusId")
    private Long syllabusId;
    
    @JsonProperty("userId")
    private Long userId;
    
    @JsonProperty("userEmail")
    private String userEmail;
    
    @JsonProperty("feedbackType")
    private String feedbackType; // ERROR, SUGGESTION, QUESTION, OTHER
    
    @JsonProperty("title")
    private String title;
    
    @JsonProperty("message")
    private String message;
    
    @JsonProperty("attachment")
    private String attachment;
}
