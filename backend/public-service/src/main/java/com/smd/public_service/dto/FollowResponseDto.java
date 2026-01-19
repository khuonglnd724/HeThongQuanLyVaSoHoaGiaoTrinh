package com.smd.public_service.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * FollowResponseDto - Kết quả theo dõi giáo trình
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FollowResponseDto {
    
    @JsonProperty("syllabusId")
    private Long syllabusId;
    
    @JsonProperty("isFollowing")
    private Boolean isFollowing;
    
    @JsonProperty("followCount")
    private Long followCount;
    
    @JsonProperty("followedAt")
    private Long followedAt;
    
    @JsonProperty("notifyOnChange")
    private Boolean notifyOnChange;
    
    @JsonProperty("message")
    private String message;
}
