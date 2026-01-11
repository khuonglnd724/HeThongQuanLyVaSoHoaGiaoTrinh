package com.smd.public_service.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

/**
 * DiffDto - So sánh 2 phiên bản giáo trình
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DiffDto {
    
    @JsonProperty("oldVersion")
    private SyllabusVersionDto oldVersion;
    
    @JsonProperty("newVersion")
    private SyllabusVersionDto newVersion;
    
    @JsonProperty("differences")
    private List<FieldDiffDto> differences;
    
    @JsonProperty("summary")
    private String summary;
    
    @JsonProperty("changePercentage")
    private Double changePercentage;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SyllabusVersionDto {
        @JsonProperty("id")
        private Long id;
        
        @JsonProperty("version")
        private Integer version;
        
        @JsonProperty("academicYear")
        private String academicYear;
        
        @JsonProperty("updatedAt")
        private String updatedAt;
        
        @JsonProperty("status")
        private String status;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FieldDiffDto {
        @JsonProperty("fieldName")
        private String fieldName;
        
        @JsonProperty("fieldLabel")
        private String fieldLabel;
        
        @JsonProperty("oldValue")
        private String oldValue;
        
        @JsonProperty("newValue")
        private String newValue;
        
        @JsonProperty("changeType")
        private String changeType; // ADDED, REMOVED, MODIFIED
        
        @JsonProperty("hasHighlight")
        private Boolean hasHighlight;
    }
}
