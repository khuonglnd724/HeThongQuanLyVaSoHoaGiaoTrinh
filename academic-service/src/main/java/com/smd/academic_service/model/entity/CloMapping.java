package com.smd.academic_service.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * CLO-PLO Mapping (Bản đồ liên kết giữa chuẩn đầu ra môn học và chương trình)
 * Xác định mối quan hệ giữa CLO và PLO
 */
@Entity
@Table(name = "clo_mapping", indexes = {
    @Index(name = "idx_clo_mapping_clo_id", columnList = "clo_id"),
    @Index(name = "idx_clo_mapping_plo_id", columnList = "plo_id"),
    @Index(name = "idx_clo_mapping_clo_plo", columnList = "clo_id,plo_id", unique = true)
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CloMapping extends BaseEntity {
    
    @ManyToOne(fetch = jakarta.persistence.FetchType.LAZY)
    @JoinColumn(name = "clo_id", nullable = false)
    private Clo clo;  // Course Learning Outcome
    
    @ManyToOne(fetch = jakarta.persistence.FetchType.LAZY)
    @JoinColumn(name = "plo_id", nullable = false)
    private Plo plo;  // Program Learning Outcome
    
    @Column(name = "mapping_level", length = 50)
    private String mappingLevel;  // Level: Directly Supports, Partially Supports, Not Related
    
    @Column(name = "proficiency_level", length = 50)
    private String proficiencyLevel;  // Level: Introduce, Develop, Master
    
    @Column(name = "evidence_method", columnDefinition = "TEXT")
    private String evidenceMethod;  // Phương pháp chứng minh sự liên kết
    
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;  // Ghi chú
    
    @Column(name = "strength_level", nullable = false)
    private Integer strengthLevel = 1;  // 1-5: Độ mạnh của liên kết (1 yếu, 5 mạnh)
}
