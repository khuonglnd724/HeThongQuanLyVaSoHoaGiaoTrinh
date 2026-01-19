package com.smd.workflow_service.dto;

public class SyllabusSectionDiffDTO {

    private String id;
    private String title;
    private String oldContent;
    private String newContent;

    public SyllabusSectionDiffDTO() {
    }

    public SyllabusSectionDiffDTO(
            String id,
            String title,
            String oldContent,
            String newContent
    ) {
        this.id = id;
        this.title = title;
        this.oldContent = oldContent;
        this.newContent = newContent;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getOldContent() {
        return oldContent;
    }

    public void setOldContent(String oldContent) {
        this.oldContent = oldContent;
    }

    public String getNewContent() {
        return newContent;
    }

    public void setNewContent(String newContent) {
        this.newContent = newContent;
    }
}
