package com.smd.academic_service.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for various statistics related to CLO-PLO coverage
 */
@Data
@NoArgsConstructor
public class StatisticsDto {
    
    /**
     * Statistics for a single Program
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProgramStatistics {
        private Long programId;
        private String programCode;
        private String programName;
        
        // Subject statistics
        private Integer totalSubjects;
        
        // CLO statistics
        private Integer totalClos;
        private Integer mappedClos;
        private Integer cloCoveragePercentage;
        
        // PLO statistics
        private Integer totalPlos;
        private Integer mappedPlos;
        private Integer ploCoveragePercentage;
        
        // Mapping count
        private Integer totalMappings;
        
        /**
         * Get coverage status: EXCELLENT (>=90%), GOOD (>=80%), FAIR (>=70%), POOR (<70%)
         */
        public String getCoverageStatus() {
            if (cloCoveragePercentage >= 90) return "EXCELLENT";
            if (cloCoveragePercentage >= 80) return "GOOD";
            if (cloCoveragePercentage >= 70) return "FAIR";
            return "POOR";
        }
    }
    
    /**
     * Statistics for a single Subject
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SubjectStatistics {
        private Long subjectId;
        private String subjectCode;
        private String subjectName;
        
        // CLO statistics
        private Integer totalClos;
        private Integer mappedClos;
        private Integer cloCoveragePercentage;
        
        // PLO statistics
        private Integer totalPlos;
        private Integer mappedPlos;
        private Integer ploCoveragePercentage;
        
        // Mapping count
        private Integer totalMappings;
        
        // Syllabus statistics
        private Integer totalSyllabuses;
        
        /**
         * Get coverage status: EXCELLENT (>=90%), GOOD (>=80%), FAIR (>=70%), POOR (<70%)
         */
        public String getCoverageStatus() {
            if (cloCoveragePercentage >= 90) return "EXCELLENT";
            if (cloCoveragePercentage >= 80) return "GOOD";
            if (cloCoveragePercentage >= 70) return "FAIR";
            return "POOR";
        }
    }
    
    /**
     * System-wide statistics (Department/Faculty level)
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DepartmentStatistics {
        // Program statistics
        private Integer totalPrograms;
        
        // Subject statistics
        private Integer totalSubjects;
        
        // CLO statistics
        private Integer totalClos;
        private Integer mappedClos;
        private Integer cloCoveragePercentage;
        
        // PLO statistics
        private Integer totalPlos;
        private Integer mappedPlos;
        private Integer ploCoveragePercentage;
        
        // Mapping count
        private Integer totalMappings;
        
        // Syllabus statistics
        private Integer totalSyllabuses;
        private Integer approvedSyllabuses;
        private Integer pendingSyllabuses;
        private Integer rejectedSyllabuses;
        
        /**
         * Get overall coverage status
         */
        public String getOverallCoverageStatus() {
            if (cloCoveragePercentage >= 90) return "EXCELLENT";
            if (cloCoveragePercentage >= 80) return "GOOD";
            if (cloCoveragePercentage >= 70) return "FAIR";
            return "POOR";
        }
        
        /**
         * Get approval rate percentage
         */
        public Integer getApprovalRatePercentage() {
            if (totalSyllabuses == 0) return 0;
            return (int) ((double) approvedSyllabuses / totalSyllabuses * 100);
        }
    }
    
    /**
     * Coverage trend data for charts
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CoverageTrendDto {
        private String label;      // e.g., "Program A", "2024"
        private Integer coverage;  // percentage
        private Integer count;     // number of items
        private String period;     // for trend analysis
    }
}
