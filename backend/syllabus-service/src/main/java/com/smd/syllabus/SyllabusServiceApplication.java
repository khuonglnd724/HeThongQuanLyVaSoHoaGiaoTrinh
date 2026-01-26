package com.smd.syllabus;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SyllabusServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(SyllabusServiceApplication.class, args);
    }
}
