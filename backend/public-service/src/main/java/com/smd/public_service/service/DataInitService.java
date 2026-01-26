package com.smd.public_service.service;

import com.smd.public_service.model.entity.Subject;
import com.smd.public_service.model.entity.Syllabus;
import com.smd.public_service.repository.SubjectRepository;
import com.smd.public_service.repository.SyllabusRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Initialize sample data for public-service on startup
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class DataInitService implements CommandLineRunner {
    
    private final SubjectRepository subjectRepository;
    private final SyllabusRepository syllabusRepository;
    
    @Override
    @Transactional
    public void run(String... args) throws Exception {
        try {
            if (subjectRepository.count() > 0) {
                log.info("Data already exists, skipping initialization");
                return;
            }
            log.info("Initializing sample data...");
            initializeSampleData();
        } catch (Exception e) {
            log.warn("Failed to initialize data - tables may not be created yet: {}", e.getMessage());
            log.debug("Stack trace:", e);
        }
    }
    
    private void initializeSampleData() {
        // Create subjects
        Subject java = Subject.builder()
                .subjectCode("CS101")
                .subjectName("Lập trình Java")
                .programId(1L)
                .credits(3)
                .semester(1)
                .subjectType("Core")
                .description("Khóa học cơ bản về lập trình Java với OOP")
                .build();

        Subject web = Subject.builder()
                .subjectCode("CS201")
                .subjectName("Phát triển Web")
                .programId(1L)
                .credits(4)
                .semester(2)
                .subjectType("Core")
                .description("Phát triển ứng dụng web với HTML, CSS, JavaScript và React")
                .build();

        Subject db = Subject.builder()
                .subjectCode("CS202")
                .subjectName("Cơ sở dữ liệu")
                .programId(1L)
                .credits(3)
                .semester(2)
                .subjectType("Core")
                .description("Thiết kế và quản lý cơ sở dữ liệu với SQL")
                .build();

        Subject cloud = Subject.builder()
                .subjectCode("CS301")
                .subjectName("Cloud Computing")
                .programId(1L)
                .credits(3)
                .semester(3)
                .subjectType("Elective")
                .description("Giới thiệu về Cloud Computing và các dịch vụ cloud")
                .build();

        subjectRepository.save(java);
        subjectRepository.save(web);
        subjectRepository.save(db);
        subjectRepository.save(cloud);

        log.info("Created {} subjects", 4);

        // Create syllabi for each subject
        Syllabus syl1 = Syllabus.builder()
                .subject(java)
                .syllabusCode("CS101-2024-01")
                .version(1)
                .academicYear("2024-2025")
                .semester(1)
                .content("Nội dung: Lập trình Java\n- Giới thiệu Java\n- OOP\n- Collections\n- Exception Handling")
                .learningObjectives("Hiểu cơ bản về Java và lập trình hướng đối tượng")
                .teachingMethods("Lecture + Lab")
                .assessmentMethods("Exam + Assignment")
                .status("APPROVED")
                .approvedBy(1L)
                .build();

        Syllabus syl2 = Syllabus.builder()
                .subject(web)
                .syllabusCode("CS201-2024-01")
                .version(1)
                .academicYear("2024-2025")
                .semester(2)
                .content("Nội dung: Phát triển Web\n- HTML/CSS\n- JavaScript\n- React\n- RESTful API")
                .learningObjectives("Phát triển web frontend với các công nghệ hiện đại")
                .teachingMethods("Lecture + Lab")
                .assessmentMethods("Project + Exam")
                .status("APPROVED")
                .approvedBy(1L)
                .build();

        Syllabus syl3 = Syllabus.builder()
                .subject(db)
                .syllabusCode("CS202-2024-01")
                .version(1)
                .academicYear("2024-2025")
                .semester(2)
                .content("Nội dung: Cơ sở dữ liệu\n- SQL\n- Indexing\n- Transactions\n- Optimization")
                .learningObjectives("Thiết kế và quản lý cơ sở dữ liệu hiệu quả")
                .teachingMethods("Lecture + Lab")
                .assessmentMethods("Practical + Exam")
                .status("APPROVED")
                .approvedBy(1L)
                .build();

        Syllabus syl4 = Syllabus.builder()
                .subject(cloud)
                .syllabusCode("CS301-2024-01")
                .version(1)
                .academicYear("2024-2025")
                .semester(3)
                .content("Nội dung: Cloud Computing\n- AWS/Azure\n- Docker\n- Kubernetes\n- Microservices")
                .learningObjectives("Giới thiệu về Cloud Computing và các dịch vụ cloud")
                .teachingMethods("Lecture + Lab")
                .assessmentMethods("Project + Exam")
                .status("APPROVED")
                .approvedBy(1L)
                .build();

        syllabusRepository.save(syl1);
        syllabusRepository.save(syl2);
        syllabusRepository.save(syl3);
        syllabusRepository.save(syl4);

        log.info("Created {} syllabi", 4);
    }
}
