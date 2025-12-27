package com.smd.api_gateway.filter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;

import com.smd.common.util.CorrelationIdUtils;

import reactor.core.publisher.Mono;

@Component
public class RequestLoggingFilter implements GlobalFilter, Ordered {

    private static final Logger log = LoggerFactory.getLogger(RequestLoggingFilter.class);

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String correlationId = CorrelationIdUtils.extract(exchange);

        log.info("[{}] {} {}", correlationId, request.getMethod(), request.getPath());

        long start = System.currentTimeMillis();

        return chain.filter(exchange).doFinally(signal -> {
            long took = System.currentTimeMillis() - start;
            int status = exchange.getResponse().getStatusCode() != null
                    ? exchange.getResponse().getStatusCode().value()
                    : 0;
            switch (signal) {
                case ON_ERROR -> log.error("[{}] {} {} -> {} ({} ms)", correlationId, request.getMethod(), request.getPath(), status, took);
                default -> log.info("[{}] {} {} -> {} ({} ms)", correlationId, request.getMethod(), request.getPath(), status, took);
            }
        });
    }

    @Override
    public int getOrder() {
        return Ordered.LOWEST_PRECEDENCE - 10; // run late
    }
}