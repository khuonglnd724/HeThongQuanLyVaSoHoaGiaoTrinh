package com.smd.workflow_service.dto;

import com.smd.workflow_service.domain.Workflow;

public class WorkflowReviewDTO {

    private Workflow workflow;
    private SyllabusDiffDTO syllabus;

    public WorkflowReviewDTO() {
    }

    public WorkflowReviewDTO(
            Workflow workflow,
            SyllabusDiffDTO syllabus
    ) {
        this.workflow = workflow;
        this.syllabus = syllabus;
    }

    public Workflow getWorkflow() {
        return workflow;
    }

    public void setWorkflow(Workflow workflow) {
        this.workflow = workflow;
    }

    public SyllabusDiffDTO getSyllabus() {
        return syllabus;
    }

    public void setSyllabus(SyllabusDiffDTO syllabus) {
        this.syllabus = syllabus;
    }
}
