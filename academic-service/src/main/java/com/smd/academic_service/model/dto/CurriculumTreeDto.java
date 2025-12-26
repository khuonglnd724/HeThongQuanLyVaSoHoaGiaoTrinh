package com.smd.academic_service.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

/**
 * Curriculum Tree DTO - cho Tree View hiển thị cấu trúc Program -> Subject -> Syllabus
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CurriculumTreeDto {
    private Long programId;
    private String programCode;
    private String programName;
    private List<SubjectNodeDto> subjects;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SubjectNodeDto {
        private Long subjectId;
        private String subjectCode;
        private String subjectName;
        private Integer credits;
        private Integer semester;
        private String subjectType;
        private List<SyllabusNodeDto> syllabuses;
        private List<CloNodeDto> clos;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SyllabusNodeDto {
        private Long syllabusId;
        private String syllabusCode;
        private Integer version;
        private String academicYear;
        private String status;
        private String approvalStatus;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CloNodeDto {
        private Long cloId;
        private String cloCode;
        private String cloName;
        private String bloomLevel;
        private Integer mappedPlos;  // Số PLO đã map
    }
}
