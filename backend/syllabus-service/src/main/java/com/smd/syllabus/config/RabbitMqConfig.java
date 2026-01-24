package com.smd.syllabus.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMqConfig {

    public static final String WORKFLOW_EXCHANGE = "workflow.exchange";

    @Bean
    public TopicExchange workflowExchange() {
        return new TopicExchange(WORKFLOW_EXCHANGE, true, false);
    }

    @Bean
    public TopicExchange syllabusExchange(@Value("${smd.mq.exchange}") String exchange) {
        return new TopicExchange(exchange, true, false);
    }

    @Bean
    public Queue syllabusEventQueue() {
        // A default queue for demo; in real microservices, other services bind their own queues.
        return QueueBuilder.durable("smd.syllabus.events").build();
    }

    @Bean
    public Binding syllabusEventBinding(TopicExchange syllabusExchange, Queue syllabusEventQueue,
                                       @Value("${smd.mq.routingKey}") String routingKey) {
        return BindingBuilder.bind(syllabusEventQueue).to(syllabusExchange).with(routingKey);
    }

    @Bean
    public Queue workflowSyncQueue(@Value("${smd.workflow.sync-queue:workflow.sync.syllabus}") String queueName) {
        return QueueBuilder.durable(queueName).build();
    }

    @Bean
    public Binding workflowSyncBinding(Queue workflowSyncQueue, TopicExchange workflowExchange,
                                       @Value("${smd.workflow.sync-routing-key:workflow.sync}") String routingKey) {
        return BindingBuilder.bind(workflowSyncQueue)
                .to(workflowExchange)
                .with(routingKey);
    }

    @Bean
    public MessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory,
                                         MessageConverter messageConverter) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(messageConverter);
        return template;
    }
}
