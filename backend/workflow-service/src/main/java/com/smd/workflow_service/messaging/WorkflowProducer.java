package com.smd.workflow_service.messaging;

import com.smd.workflow_service.config.RabbitMQConfig;
import com.smd.workflow_service.event.WorkflowSyncEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Service
public class WorkflowProducer {

    private static final Logger log = LoggerFactory.getLogger(WorkflowProducer.class);

    private final RabbitTemplate rabbitTemplate;

    public WorkflowProducer(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void send(WorkflowSyncEvent event) {
        try {
            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.WORKFLOW_EXCHANGE,
                    RabbitMQConfig.SYNC_ROUTING_KEY,
                    event
            );
            log.info("WorkflowSyncEvent sent: {}", event);
        } catch (Exception e) {
            log.error("Failed to send WorkflowSyncEvent", e);
            throw e;
        }
    }
}
