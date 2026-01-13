package com.smd.workflow_service.messaging;

import com.smd.workflow_service.event.WorkflowApprovalEvent;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Service
public class WorkflowApprovalProducer {

    private final RabbitTemplate rabbitTemplate;

    public WorkflowApprovalProducer(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void send(WorkflowApprovalEvent event) {
        rabbitTemplate.convertAndSend(
                "workflow.exchange",   
                "workflow.approval",   
                event                  
        );
    }
}
