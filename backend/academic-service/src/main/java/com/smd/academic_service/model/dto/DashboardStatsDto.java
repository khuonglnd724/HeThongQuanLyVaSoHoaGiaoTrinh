package com.smd.academic_service.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Dashboard Statistics DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStatsDto {
    private Long programId;
    private Integer totalPloCoveragePercentage;  // % CLO đã map vào PLO
    private Integer totalClos;  // Tổng CLO
    private Integer mappedClos;  // Số CLO đã map
    private Integer unmappedClos;  // Số CLO chưa map
    private Integer totalPlos;  // Tổng PLO
    private Integer fullyCoveredPlos;  // PLO được cover đầy đủ
    private Integer partiallyCoveredPlos;  // PLO được cover một phần
    private Integer uncoveredPlos;  // PLO không được cover
    private Integer totalSubjects;  // Tổng môn học
    private Integer subjectsWithClo;  // Môn có CLO
    private Integer totalSyllabuses;  // Tổng Giáo trình
    private Integer syllabusesApproved;  // Giáo trình được duyệt
    private Integer syllabusesUnderReview;  // Giáo trình đang xem xét
    private Integer syllabusesRejected;  // Giáo trình bị từ chối
}
