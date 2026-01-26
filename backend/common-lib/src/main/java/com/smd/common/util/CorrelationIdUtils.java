package com.smd.common.util;

import java.util.Optional;
import java.util.UUID;

import org.springframework.http.HttpHeaders;
import org.springframework.web.server.ServerWebExchange;

/**
 * Utility helpers for correlation IDs across services.
 */
public final class CorrelationIdUtils {
    public static final String HEADER = "X-Correlation-Id";

    private CorrelationIdUtils() {
    }

    public static String ensureCorrelationId(HttpHeaders headers) {
        return Optional.ofNullable(headers.getFirst(HEADER))
                .filter(s -> !s.isBlank())
                .orElseGet(() -> UUID.randomUUID().toString());
    }

    public static String extract(ServerWebExchange exchange) {
        return ensureCorrelationId(exchange.getRequest().getHeaders());
    }
}