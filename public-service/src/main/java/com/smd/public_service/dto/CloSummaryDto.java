package com.smd.public_service.dto;

public class CloSummaryDto {

    private Long id;
    private String cloCode;
    private String cloName;
    private String description;
    private String bloomLevel;
    private Integer displayOrder;
    private String teachingMethod;
    private String evaluationMethod;

    public CloSummaryDto() {
    }

    public CloSummaryDto(Long id, String cloCode, String cloName, String description) {
        this.id = id;
        this.cloCode = cloCode;
        this.cloName = cloName;
        this.description = description;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCloCode() {
        return cloCode;
    }

    public void setCloCode(String cloCode) {
        this.cloCode = cloCode;
    }

    public String getCloName() {
        return cloName;
    }

    public void setCloName(String cloName) {
        this.cloName = cloName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getBloomLevel() {
        return bloomLevel;
    }

    public void setBloomLevel(String bloomLevel) {
        this.bloomLevel = bloomLevel;
    }

    public Integer getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }

    public String getTeachingMethod() {
        return teachingMethod;
    }

    public void setTeachingMethod(String teachingMethod) {
        this.teachingMethod = teachingMethod;
    }

    public String getEvaluationMethod() {
        return evaluationMethod;
    }

    public void setEvaluationMethod(String evaluationMethod) {
        this.evaluationMethod = evaluationMethod;
    }
}
