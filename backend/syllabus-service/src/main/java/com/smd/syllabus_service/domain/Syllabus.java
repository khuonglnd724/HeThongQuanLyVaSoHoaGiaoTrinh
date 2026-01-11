package com.smd.syllabus_service.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "syllabus")
public class Syllabus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "course_code", nullable = false)
    private String courseCode;

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getCourseCode() { return courseCode; }

    public void setId(Long id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setCourseCode(String courseCode) { this.courseCode = courseCode; }
}
