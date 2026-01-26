package com.smd.workflow_service.messaging;

import com.smd.workflow_service.config.RabbitMQConfig;
import com.smd.workflow_service.event.WorkflowApprovalEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Service
public class WorkflowApprovalProducer {

    private static final Logger log = LoggerFactory.getLogger(WorkflowApprovalProducer.class);

    private final RabbitTemplate rabbitTemplate;

    public WorkflowApprovalProducer(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void send(WorkflowApprovalEvent event) {
        try {
            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.WORKFLOW_EXCHANGE,
                    RabbitMQConfig.SYNC_ROUTING_KEY,
                    event
            );
            log.info("WorkflowApprovalEvent sent: {}", event);
        } catch (Exception e) {
            log.error("Failed to send WorkflowApprovalEvent", e);
            throw e;
        }
    }
}
