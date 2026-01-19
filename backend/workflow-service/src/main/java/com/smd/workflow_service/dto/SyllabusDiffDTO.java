package com.smd.workflow_service.dto;

import java.util.List;

public class SyllabusDiffDTO {

    private String syllabusId;
    private String title;
    private List<SyllabusSectionDiffDTO> sections;

    public SyllabusDiffDTO() {
    }

    public SyllabusDiffDTO(
            String syllabusId,
            String title,
            List<SyllabusSectionDiffDTO> sections
    ) {
        this.syllabusId = syllabusId;
        this.title = title;
        this.sections = sections;
    }

    public String getSyllabusId() {
        return syllabusId;
    }

    public void setSyllabusId(String syllabusId) {
        this.syllabusId = syllabusId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public List<SyllabusSectionDiffDTO> getSections() {
        return sections;
    }

    public void setSections(List<SyllabusSectionDiffDTO> sections) {
        this.sections = sections;
    }
}
