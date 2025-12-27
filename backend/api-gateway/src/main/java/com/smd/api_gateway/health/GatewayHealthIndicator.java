package com.smd.api_gateway.health;

import java.time.Instant;

import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.ReactiveHealthIndicator;
import org.springframework.stereotype.Component;

@Component
public class GatewayHealthIndicator implements ReactiveHealthIndicator {

    @Override
    public reactor.core.publisher.Mono<Health> health() {
        return reactor.core.publisher.Mono.just(
                Health.up()
                        .withDetail("component", "api-gateway")
                        .withDetail("timestamp", Instant.now())
                        .build()
        );
    }
}