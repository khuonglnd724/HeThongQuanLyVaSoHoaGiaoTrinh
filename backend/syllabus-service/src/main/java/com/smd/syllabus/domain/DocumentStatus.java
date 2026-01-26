package com.smd.syllabus.domain;

/**
 * Document approval status
 * Mirrors the syllabus approval workflow
 */
public enum DocumentStatus {
    DRAFT,      // Initial upload, not yet submitted
    APPROVED    // Document approved with syllabus
}
