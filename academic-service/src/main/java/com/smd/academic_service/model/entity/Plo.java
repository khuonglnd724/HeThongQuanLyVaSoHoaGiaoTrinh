package com.smd.academic_service.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * PLO - Program Learning Outcome (Chuẩn đầu ra chương trình)
 * Định nghĩa những kỹ năng/kiến thức mà sinh viên phải đạt được
 */
@Entity
@Table(name = "plo", indexes = {
    @Index(name = "idx_plo_program_id", columnList = "program_id"),
    @Index(name = "idx_plo_code", columnList = "plo_code")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Plo extends BaseEntity {
    
    @Column(name = "plo_code", nullable = false, length = 50)
    private String ploCode;  // Ví dụ: PLO1, PLO2, etc.
    
    @Column(name = "plo_name", nullable = false, length = 255)
    private String ploName;  // Ví dụ: "Kiến thức chuyên môn cơ bản"
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;  // Mô tả chi tiết
    
    @ManyToOne(fetch = jakarta.persistence.FetchType.LAZY)
    @JoinColumn(name = "program_id", nullable = false)
    private Program program;  // Chương trình đào tạo
    
    @Column(name = "display_order", nullable = false)
    private Integer displayOrder;  // Thứ tự hiển thị
    
    @Column(name = "plo_level", length = 50)
    private String ploLevel;  // Level: Foundational, Intermediate, Advanced
    
    @Column(name = "assessment_method", length = 255)
    private String assessmentMethod;  // Phương pháp đánh giá
}
