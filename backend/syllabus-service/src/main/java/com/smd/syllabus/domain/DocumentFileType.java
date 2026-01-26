package com.smd.syllabus.domain;

/**
 * Supported file types for teaching materials
 * PDF is the primary format
 */
public enum DocumentFileType {
    PDF,      // Primary format
    DOCX,     // Microsoft Word
    DOC,      // Microsoft Word (legacy)
    PPTX,     // Microsoft PowerPoint
    PPT,      // Microsoft PowerPoint (legacy)
    XLSX,     // Microsoft Excel
    XLS       // Microsoft Excel (legacy)
}
