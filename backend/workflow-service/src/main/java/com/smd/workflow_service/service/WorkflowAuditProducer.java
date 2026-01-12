package com.smd.workflow_service.service;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class WorkflowAuditProducer {

    private final KafkaTemplate<String, String> kafkaTemplate;

    public WorkflowAuditProducer(KafkaTemplate<String, String> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void sendAudit(String message) {
        kafkaTemplate.send("workflow-audit", message);
    }
}
