package com.smd.academic_service.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

/**
 * CLO - Course Learning Outcome (Chuẩn đầu ra môn học)
 * Định nghĩa những gì sinh viên học được sau môn học cụ thể
 */
@Entity
@Table(name = "clo", indexes = {
    @Index(name = "idx_clo_subject_id", columnList = "subject_id"),
    @Index(name = "idx_clo_syllabus_id", columnList = "syllabus_id"),
    @Index(name = "idx_clo_code", columnList = "clo_code")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Clo extends BaseEntity {
    
    @Column(name = "clo_code", nullable = false, length = 50)
    private String cloCode;  // Ví dụ: CLO1, CLO2, etc.
    
    @Column(name = "clo_name", nullable = false, length = 255)
    private String cloName;  // Ví dụ: "Hiểu khái niệm cơ bản"
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;  // Mô tả chi tiết
    
    @ManyToOne(fetch = jakarta.persistence.FetchType.LAZY, optional = true)
    @JoinColumn(name = "subject_id")
    private Subject subject;  // Môn học (có thể null để CLO tái sử dụng)
    
    @ManyToOne(fetch = jakarta.persistence.FetchType.LAZY)
    @JoinColumn(name = "syllabus_id")
    private Syllabus syllabus;  // Giáo trình (có thể null nếu CLO chung cho môn)
    
    @Column(name = "bloom_level", length = 50)
    private String bloomLevel;  // Bloom taxonomy level: Remember, Understand, Apply, Analyze, Evaluate, Create
    
    @Column(name = "display_order", nullable = false)
    private Integer displayOrder;  // Thứ tự hiển thị
    
    @Column(name = "teaching_method", length = 255)
    private String teachingMethod;  // Phương pháp giảng dạy
    
    @Column(name = "evaluation_method", length = 255)
    private String evaluationMethod;  // Phương pháp đánh giá
}
