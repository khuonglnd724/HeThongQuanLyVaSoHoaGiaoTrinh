package com.smd.syllabus.dto;

import com.smd.syllabus.domain.SyllabusIssue;

public class UpdateIssueStatusRequest {
    private SyllabusIssue.Status status;

    public SyllabusIssue.Status getStatus() {
        return status;
    }

    public void setStatus(SyllabusIssue.Status status) {
        this.status = status;
    }
}
