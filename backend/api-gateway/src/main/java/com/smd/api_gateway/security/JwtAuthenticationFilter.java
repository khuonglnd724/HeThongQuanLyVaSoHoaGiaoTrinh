package com.smd.api_gateway.security;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import javax.crypto.SecretKey;

import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.server.ServerWebExchange;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import reactor.core.publisher.Mono;

@Component
public class JwtAuthenticationFilter implements GlobalFilter, Ordered {

    private final JwtProperties properties;
    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    public JwtAuthenticationFilter(JwtProperties properties) {
        this.properties = properties;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        if (!properties.isEnabled()) {
            return chain.filter(exchange);
        }

        String path = exchange.getRequest().getPath().value();
        if (isWhitelisted(path, properties.getWhitelist())) {
            return chain.filter(exchange);
        }

        String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return unauthorized(exchange, "Missing or invalid Authorization header");
        }

        String token = authHeader.substring(7);
        try {
            String secret = properties.getSecret();
            if (secret == null || secret.isEmpty()) {
                return unauthorized(exchange, "JWT secret not configured");
            }

            SecretKey key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            // propagate basic claims
            String subject = claims.getSubject();
            Object rolesObj = claims.get("roles");

            final String rolesHeader = extractRolesHeader(rolesObj);
            final String subjectHeader = subject != null ? subject : "";

            ServerWebExchange mutated = exchange.mutate()
                    .request(builder -> builder
                            .header("X-User-Id", subjectHeader)
                            .header("X-User-Roles", rolesHeader)
                    )
                    .build();
            return chain.filter(mutated);
        } catch (Exception ex) {
            return unauthorized(exchange, "Invalid or expired token");
        }
    }

    private String extractRolesHeader(Object rolesObj) {
        if (rolesObj instanceof List<?>) {
            List<?> rolesList = (List<?>) rolesObj;
            return rolesList.stream()
                    .map(role -> {
                        if (role instanceof Map) {
                            return ((Map<?, ?>) role).get("authority");
                        } else if (role instanceof String) {
                            return role;
                        }
                        return null;
                    })
                    .filter(r -> r != null)
                    .map(String::valueOf)
                    .collect(Collectors.joining(","));
        } else if (rolesObj != null) {
            return String.valueOf(rolesObj);
        }
        return "";
    }

    private boolean isWhitelisted(String path, List<String> whitelist) {
        if (whitelist == null) return false;
        for (String pattern : whitelist) {
            if (pathMatcher.match(pattern, path)) {
                return true;
            }
        }
        return false;
    }

    private Mono<Void> unauthorized(ServerWebExchange exchange, String message) {
        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
        exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);
        byte[] bytes = ("{\"error\":\"" + message + "\"}").getBytes(StandardCharsets.UTF_8);
        var buffer = exchange.getResponse().bufferFactory().wrap(bytes);
        return exchange.getResponse().writeWith(Mono.just(buffer));
    }

    @Override
    public int getOrder() {
        return -1; // run early
    }
}
