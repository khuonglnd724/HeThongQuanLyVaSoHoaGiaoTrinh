package com.smd.academic_service.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import java.util.HashSet;
import java.util.Set;

/**
 * Program (Chương trình đào tạo)
 * Đại diện cho một chương trình Đại học/Cao đẳng
 */
@Entity
@Table(name = "program", indexes = {
    @Index(name = "idx_program_code", columnList = "program_code"),
    @Index(name = "idx_program_department_id", columnList = "department_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Program extends BaseEntity {
    
    @Column(name = "program_code", nullable = false, length = 50, unique = true)
    private String programCode;  // Ví dụ: SE001, SE002
    
    @Column(name = "program_name", nullable = false, length = 255)
    private String programName;  // Ví dụ: "Kỹ sư Phần mềm"
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;  // Mô tả chi tiết
    
    @Column(name = "department_id", nullable = false)
    private Long departmentId;  // Tham chiếu đến khoa (có thể lấy từ service khác)
    
    @Column(name = "credits_required", nullable = false)
    private Integer creditsRequired;  // Số tín chỉ yêu cầu
    
    @Column(name = "duration_years", nullable = false)
    private Integer durationYears;  // Thời gian học (năm)
    
    @Column(name = "degree_type", length = 50)
    private String degreeType;  // Bachelor, Master, PhD
    
    @Column(name = "accreditation_status", length = 50)
    private String accreditationStatus;  // Accredited, Not Accredited, Pending
    
    @OneToMany(mappedBy = "program", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Plo> plos = new HashSet<>();
    
    @OneToMany(mappedBy = "program", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Subject> subjects = new HashSet<>();
}
