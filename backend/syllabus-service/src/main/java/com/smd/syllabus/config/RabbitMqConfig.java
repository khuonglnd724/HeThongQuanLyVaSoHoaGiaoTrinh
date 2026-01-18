package com.smd.syllabus.config;

import org.springframework.amqp.core.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMqConfig {

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
}
