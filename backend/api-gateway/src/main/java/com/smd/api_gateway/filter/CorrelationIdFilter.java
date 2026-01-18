package com.smd.api_gateway.filter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;

import com.smd.common.util.CorrelationIdUtils;

import reactor.core.publisher.Mono;

@Component
public class CorrelationIdFilter implements GlobalFilter, Ordered {

    private static final Logger log = LoggerFactory.getLogger(CorrelationIdFilter.class);

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        HttpHeaders headers = exchange.getRequest().getHeaders();
        String correlationId = CorrelationIdUtils.ensureCorrelationId(headers);

        ServerWebExchange mutated = exchange.mutate()
            .request(builder -> builder.header(CorrelationIdUtils.HEADER, correlationId))
            .build();

        log.debug("CorrelationId assigned: {} for path {}", correlationId, exchange.getRequest().getPath());
        // Add the correlation id to the response headers before the response is committed
        mutated.getResponse().getHeaders().add(CorrelationIdUtils.HEADER, correlationId);
        return chain.filter(mutated);
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE; // run first
    }
}