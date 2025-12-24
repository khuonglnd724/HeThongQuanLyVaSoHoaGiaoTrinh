package com.smd.academic_service.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.HashSet;
import java.util.Set;

/**
 * Subject (Môn học)
 * Các môn học được dạy trong chương trình đào tạo
 */
@Entity
@Table(name = "subject", indexes = {
    @Index(name = "idx_subject_code", columnList = "subject_code"),
    @Index(name = "idx_subject_program_id", columnList = "program_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Subject extends BaseEntity {
    
    @Column(name = "subject_code", nullable = false, length = 50)
    private String subjectCode;  // Ví dụ: CS101, CS102
    
    @Column(name = "subject_name", nullable = false, length = 255)
    private String subjectName;  // Tên môn học
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;  // Mô tả
    
    @ManyToOne(fetch = jakarta.persistence.FetchType.LAZY)
    @JoinColumn(name = "program_id", nullable = false)
    private Program program;  // Chương trình
    
    @Column(name = "credits", nullable = false)
    private Integer credits;  // Số tín chỉ
    
    @Column(name = "semester", nullable = false)
    private Integer semester;  // Học kỳ (1, 2, 3, ...)
    
    @Column(name = "prerequisites", columnDefinition = "TEXT")
    private String prerequisites;  // Tiên quyết (dạng JSON hoặc text)
    
    @Column(name = "corequisites", columnDefinition = "TEXT")
    private String corequisites;  // Đồng thời tiên quyết
    
    @Column(name = "subject_type", length = 50)
    private String subjectType;  // Required, Elective, Optional
    
    @Column(name = "is_foundational", nullable = false)
    private Boolean isFoundational = false;  // Là môn nền tảng?
    
    @OneToMany(mappedBy = "subject", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Clo> clos = new HashSet<>();
    
    @OneToMany(mappedBy = "subject", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Syllabus> syllabuses = new HashSet<>();
}
