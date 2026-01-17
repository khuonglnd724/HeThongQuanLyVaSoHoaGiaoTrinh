package com.smd.syllabus.domain;

public enum SyllabusStatus {

    // Drafting
    DRAFT,

    // Review flow
    PENDING_REVIEW, // Submitted by lecturer
    PENDING_APPROVAL, // Reviewed by HoD

    // Final states
    APPROVED, // Approved by Academic Affairs
    PUBLISHED, // Officially published
    REJECTED // Rejected (with reason)
}
