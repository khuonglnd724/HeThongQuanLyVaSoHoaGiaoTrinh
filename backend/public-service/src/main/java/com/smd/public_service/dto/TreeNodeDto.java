package com.smd.public_service.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

/**
 * TreeNodeDto - Đại diện cho một node trong cây môn học
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TreeNodeDto {
    
    @JsonProperty("id")
    private Long id;
    
    @JsonProperty("code")
    private String code;
    
    @JsonProperty("name")
    private String name;
    
    @JsonProperty("semester")
    private Integer semester;
    
    @JsonProperty("credits")
    private Integer credits;
    
    @JsonProperty("prerequisites")
    private List<TreeNodeDto> prerequisites;
    
    @JsonProperty("dependents")
    private List<TreeNodeDto> dependents;
    
    @JsonProperty("relationshipType")
    private String relationshipType;
    
    @JsonProperty("description")
    private String description;
}
