package com.smd.syllabus.mq;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class SyllabusEventPublisher {

    private final RabbitTemplate rabbitTemplate;
    private final String exchange;
    private final String routingKey;

    public SyllabusEventPublisher(RabbitTemplate rabbitTemplate,
            @Value("${smd.mq.exchange}") String exchange,
            @Value("${smd.mq.routingKey}") String routingKey) {
        this.rabbitTemplate = rabbitTemplate;
        this.exchange = exchange;
        this.routingKey = routingKey;
    }

    public void publish(SyllabusEvent e) {
        if (e.getAt() == null)
            e.setAt(Instant.now());
        rabbitTemplate.convertAndSend(exchange, routingKey, e);
    }
}
