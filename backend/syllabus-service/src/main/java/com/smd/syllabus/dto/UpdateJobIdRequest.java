package com.smd.syllabus.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class UpdateJobIdRequest {
    @JsonProperty("jobId")
    private String jobId;

    public UpdateJobIdRequest() {
    }

    public UpdateJobIdRequest(String jobId) {
        this.jobId = jobId;
    }

    public String getJobId() {
        return jobId;
    }

    public void setJobId(String jobId) {
        this.jobId = jobId;
    }
}
