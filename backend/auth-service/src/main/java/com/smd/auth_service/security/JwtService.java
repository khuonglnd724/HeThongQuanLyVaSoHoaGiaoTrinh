package com.smd.auth_service.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

@Service
public class JwtService {

    private final Key key;
    private final long accessMinutes;
    private final long refreshDays;

    public JwtService(
            @Value("${security.jwt.secret:dev-secret-change-me-dev-secret-change-me}") String secret,
            @Value("${security.jwt.accessTokenMinutes:15}") long accessMinutes,
            @Value("${security.jwt.refreshTokenDays:7}") long refreshDays
    ) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessMinutes = accessMinutes;
        this.refreshDays = refreshDays;
    }

    public String createAccessToken(String userId) {
        Instant now = Instant.now();
        Instant exp = now.plus(Duration.ofMinutes(accessMinutes));
        String jti = UUID.randomUUID().toString();

        return Jwts.builder()
                .setSubject(userId)
                .setId(jti)
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(exp))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public String createRefreshToken(String userId) {
        Instant now = Instant.now();
        Instant exp = now.plus(Duration.ofDays(refreshDays));

        return Jwts.builder()
                .setSubject(userId)
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(exp))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public Jws<Claims> parse(String token) {
        return Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
    }

    public String getUserId(String token) {
        return parse(token).getBody().getSubject();
    }

    public String getJti(String token) {
        return parse(token).getBody().getId();
    }

    public Duration timeToExpiry(String token) {
        Date exp = parse(token).getBody().getExpiration();
        long ms = exp.getTime() - System.currentTimeMillis();
        return Duration.ofMillis(Math.max(0, ms));
    }
}
