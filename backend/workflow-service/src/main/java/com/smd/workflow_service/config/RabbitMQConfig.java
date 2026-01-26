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
    public static final String SYNC_QUEUE = "workflow.sync.queue";
    public static final String SYNC_ROUTING_KEY = "workflow.sync";

    @Bean
    public TopicExchange workflowExchange() {
        return new TopicExchange(WORKFLOW_EXCHANGE);
    }

    @Bean
    public Queue syncQueue() {
        return QueueBuilder.durable(SYNC_QUEUE).build();
    }

    @Bean
    public Binding syncBinding() {
        return BindingBuilder
                .bind(syncQueue())
                .to(workflowExchange())
                .with(SYNC_ROUTING_KEY);
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
