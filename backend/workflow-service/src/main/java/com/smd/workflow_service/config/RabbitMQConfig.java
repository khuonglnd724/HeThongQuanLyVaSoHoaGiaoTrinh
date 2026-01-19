package com.smd.workflow_service.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String WORKFLOW_EXCHANGE = "workflow.exchange";
    public static final String APPROVAL_QUEUE = "workflow.approval.queue";
    public static final String APPROVAL_ROUTING_KEY = "workflow.approval";

    @Bean
    public TopicExchange workflowExchange() {
        return new TopicExchange(WORKFLOW_EXCHANGE);
    }

    @Bean
    public Queue approvalQueue() {
        return QueueBuilder.durable(APPROVAL_QUEUE).build();
    }

    @Bean
    public Binding approvalBinding() {
        return BindingBuilder
                .bind(approvalQueue())
                .to(workflowExchange())
                .with(APPROVAL_ROUTING_KEY);
    }

    @Bean
    public MessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(
            ConnectionFactory connectionFactory,
            MessageConverter messageConverter
    ) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(messageConverter);
        return template;
    }
}
