package com.smd.public_service.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Subject DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubjectDto {
    
    @JsonProperty("id")
    private Long id;
    
    @JsonProperty("subjectCode")
    private String subjectCode;
    
    @JsonProperty("subjectName")
    private String subjectName;
    
    @JsonProperty("description")
    private String description;
    
    @JsonProperty("credits")
    private Integer credits;
    
    @JsonProperty("semester")
    private Integer semester;
    
    @JsonProperty("subjectType")
    private String subjectType;
    
    @JsonProperty("isFoundational")
    private Boolean isFoundational;
}
