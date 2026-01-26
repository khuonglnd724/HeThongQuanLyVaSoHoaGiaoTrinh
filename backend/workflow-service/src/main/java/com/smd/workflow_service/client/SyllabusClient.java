package com.smd.workflow_service.client;

import com.smd.workflow_service.dto.SyllabusDiffDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class SyllabusClient {

    private final RestTemplate restTemplate;
    private final String syllabusServiceUrl;

    public SyllabusClient(
            RestTemplate restTemplate,
            @Value("${syllabus.service.url}") String syllabusServiceUrl
    ) {
        this.restTemplate = restTemplate;
        this.syllabusServiceUrl = syllabusServiceUrl;
    }

    public SyllabusDiffDTO getDiffByWorkflow(String workflowId) {
        try {
            return restTemplate.getForObject(
                syllabusServiceUrl + "/api/syllabus/workflows/" + workflowId + "/diff",
                SyllabusDiffDTO.class
            );
        } catch (Exception ex) {
            return null;
        }
    }
}
