package com.smd.public_service.dto;

public class CloMappingDto {

    private Long id;
    private String cloCode;
    private String cloName;
    private String ploCode;
    private String ploName;
    private String mappingLevel;
    private String proficiencyLevel;
    private Integer strengthLevel;

    public CloMappingDto() {
    }

    public CloMappingDto(Long id, String cloCode, String cloName, String ploCode, String ploName) {
        this.id = id;
        this.cloCode = cloCode;
        this.cloName = cloName;
        this.ploCode = ploCode;
        this.ploName = ploName;
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

    public String getPloCode() {
        return ploCode;
    }

    public void setPloCode(String ploCode) {
        this.ploCode = ploCode;
    }

    public String getPloName() {
        return ploName;
    }

    public void setPloName(String ploName) {
        this.ploName = ploName;
    }

    public String getMappingLevel() {
        return mappingLevel;
    }

    public void setMappingLevel(String mappingLevel) {
        this.mappingLevel = mappingLevel;
    }

    public String getProficiencyLevel() {
        return proficiencyLevel;
    }

    public void setProficiencyLevel(String proficiencyLevel) {
        this.proficiencyLevel = proficiencyLevel;
    }

    public Integer getStrengthLevel() {
        return strengthLevel;
    }

    public void setStrengthLevel(Integer strengthLevel) {
        this.strengthLevel = strengthLevel;
    }
}
