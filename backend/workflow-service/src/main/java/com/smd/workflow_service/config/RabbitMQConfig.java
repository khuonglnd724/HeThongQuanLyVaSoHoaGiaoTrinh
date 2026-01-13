package com.smd.workflow_service.config;

import org.springframework.amqp.core.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    @Bean
    public TopicExchange workflowExchange() {
        return new TopicExchange("workflow.exchange");
    }

    @Bean
    public Queue approvalQueue() {
        return new Queue("workflow.approval.queue");
    }

    @Bean
    public Binding approvalBinding() {
        return BindingBuilder
                .bind(approvalQueue())
                .to(workflowExchange())
                .with("workflow.approval");
    }
}
