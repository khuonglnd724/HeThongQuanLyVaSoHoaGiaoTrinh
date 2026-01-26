package com.smd.syllabus.dto;

import com.smd.syllabus.domain.Syllabus;

public final class SyllabusMapper {

    private SyllabusMapper() {
    }

    public static SyllabusResponse toResponse(Syllabus s) {
        SyllabusResponse r = new SyllabusResponse();

        r.setId(s.getId());
        r.setRootId(s.getRootId());

        r.setSubjectCode(s.getSubjectCode());
        r.setSubjectName(s.getSubjectName());
        r.setSummary(s.getSummary());
        r.setContent(s.getContent() == null ? null : s.getContent().toString());

        r.setVersionNo(s.getVersionNo());
        r.setStatus(s.getStatus());

        r.setCreatedBy(s.getCreatedBy());
        r.setUpdatedBy(s.getUpdatedBy());

        r.setCreatedAt(s.getCreatedAt());
        r.setUpdatedAt(s.getUpdatedAt());

        r.setSubmittedAt(s.getSubmittedAt());
        r.setReviewedAt(s.getReviewedAt());
        r.setApprovedAt(s.getApprovedAt());
        r.setPublishedAt(s.getPublishedAt());
        r.setRejectedAt(s.getRejectedAt());

        r.setRejectionReason(s.getRejectionReason());
        r.setLastActionBy(s.getLastActionBy());

        r.setWorkflowId(s.getWorkflowId());

        return r;
    }
}
