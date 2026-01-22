package com.smd.api_gateway.filter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;

import reactor.core.publisher.Mono;

/**
 * Global CORS Filter for API Gateway
 * Handles CORS preflight requests and sets appropriate headers
 */
@Component
public class GlobalCorsFilter implements GlobalFilter, Ordered {

    private static final Logger log = LoggerFactory.getLogger(GlobalCorsFilter.class);

    private static final String ALLOWED_ORIGINS = "http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:5174,http://localhost:9000,http://localhost:80,http://localhost,http://127.0.0.1:3000,http://127.0.0.1:3001,http://127.0.0.1:3002,http://127.0.0.1:5174,http://127.0.0.1:9000,http://127.0.0.1,http://127.0.0.1:80,http://localhost:8080";
    private static final String ALLOWED_METHODS = "GET,HEAD,OPTIONS,POST,PUT,DELETE,PATCH";
    private static final String ALLOWED_HEADERS = "Origin,Accept,X-Requested-With,Content-Type,Access-Control-Request-Method,Access-Control-Request-Headers,Authorization";
    private static final String EXPOSED_HEADERS = "Access-Control-Allow-Origin,Access-Control-Allow-Credentials,Authorization,Content-Type";

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String origin = exchange.getRequest().getHeaders().getOrigin();
        
        if (isAllowedOrigin(origin)) {
            if (exchange.getRequest().getMethod() == HttpMethod.OPTIONS) {
                return handleCorsPreFlight(exchange);
            }
            
            // Add CORS headers to response
            exchange.getResponse().getHeaders().set("Access-Control-Allow-Origin", origin);
            exchange.getResponse().getHeaders().set("Access-Control-Allow-Credentials", "true");
            exchange.getResponse().getHeaders().set("Access-Control-Expose-Headers", EXPOSED_HEADERS);
        }
        
        return chain.filter(exchange);
    }

    private Mono<Void> handleCorsPreFlight(ServerWebExchange exchange) {
        log.debug("[CORS] Handling preflight request from origin: {}", exchange.getRequest().getHeaders().getOrigin());
        
        String origin = exchange.getRequest().getHeaders().getOrigin();
        HttpHeaders responseHeaders = exchange.getResponse().getHeaders();
        
        responseHeaders.set("Access-Control-Allow-Origin", origin);
        responseHeaders.set("Access-Control-Allow-Methods", ALLOWED_METHODS);
        responseHeaders.set("Access-Control-Allow-Headers", ALLOWED_HEADERS);
        responseHeaders.set("Access-Control-Expose-Headers", EXPOSED_HEADERS);
        responseHeaders.set("Access-Control-Allow-Credentials", "true");
        responseHeaders.set("Access-Control-Max-Age", "3600");
        
        exchange.getResponse().setStatusCode(HttpStatus.OK);
        
        return exchange.getResponse().setComplete();
    }

    private boolean isAllowedOrigin(String origin) {
        if (origin == null) {
            return false;
        }
        return ALLOWED_ORIGINS.contains(origin);
    }

    @Override
    public int getOrder() {
        // Must execute before CorrelationIdFilter to handle CORS preflight first
        return Ordered.HIGHEST_PRECEDENCE + 1;
    }
}
