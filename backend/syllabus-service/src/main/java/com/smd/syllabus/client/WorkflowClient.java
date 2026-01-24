package com.smd.syllabus.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.URI;
import java.util.Map;
import java.util.UUID;

@Component
public class WorkflowClient {
    private static final Logger log = LoggerFactory.getLogger(WorkflowClient.class);

    private final RestTemplate restTemplate;
    private final String baseUrl;

    public WorkflowClient(@Value("${smd.workflow.base-url:http://workflow-service:8084}") String baseUrl) {
        this.restTemplate = new RestTemplate();
        this.baseUrl = baseUrl;
    }

    public UUID create(UUID syllabusId) {
        try {
            URI uri = UriComponentsBuilder.fromHttpUrl(baseUrl + "/api/workflows")
                    .queryParam("entityId", syllabusId.toString())
                    .queryParam("entityType", "SYLLABUS")
                    .build(true)
                    .toUri();
            
            log.info("[WorkflowClient] Creating workflow - calling: {}", uri);
            ResponseEntity<Map> resp = restTemplate.postForEntity(uri, null, Map.class);
            
            log.debug("[WorkflowClient] Response status: {}, body: {}", resp.getStatusCode(), resp.getBody());
            
            if (resp.getBody() == null) {
                log.error("[WorkflowClient] Response body is null");
                throw new IllegalStateException("workflow-service returned empty response");
            }
            
            // Try to extract id from response (handle both camelCase and snake_case)
            Object id = resp.getBody().get("id");
            if (id == null) {
                id = resp.getBody().get("workflowId");
            }
            if (id == null) {
                log.error("[WorkflowClient] No id/workflowId found in response. Keys: {}, Body: {}", resp.getBody().keySet(), resp.getBody());
                throw new IllegalStateException("workflow-service create returned null id. Response: " + resp.getBody());
            }
            
            UUID workflowId = UUID.fromString(id.toString());
            log.info("[WorkflowClient] Workflow created successfully with id: {}", workflowId);
            return workflowId;
        } catch (Exception ex) {
            log.error("[WorkflowClient] Error creating workflow for syllabus {}", syllabusId, ex);
            throw new RuntimeException("Failed to create workflow: " + ex.getMessage(), ex);
        }
    }

    public void submit(UUID workflowId, String actionBy, String role) {
        invoke(workflowId, "submit", actionBy, role, null);
    }

    public void approve(UUID workflowId, String actionBy, String role) {
        invoke(workflowId, "approve", actionBy, role, null);
    }

    public void reject(UUID workflowId, String actionBy, String role, String comment) {
        invoke(workflowId, "reject", actionBy, role, Map.of("comment", comment == null ? "" : comment));
    }

    public void requireEdit(UUID workflowId, String actionBy, String role, String comment) {
        invoke(workflowId, "require-edit", actionBy, role, Map.of("comment", comment == null ? "" : comment));
    }

    private void invoke(UUID workflowId, String action, String actionBy, String role, Object body) {
        if (workflowId == null) return;
        URI uri = UriComponentsBuilder.fromHttpUrl(baseUrl + "/api/workflows/" + workflowId + "/" + action)
                .queryParam("actionBy", actionBy)
                .queryParam("role", role)
                .build(true)
                .toUri();
        restTemplate.exchange(uri, HttpMethod.POST, new HttpEntity<>(body), Void.class);
    }
}
