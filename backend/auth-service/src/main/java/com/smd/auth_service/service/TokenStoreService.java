package com.smd.auth_service.service;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.concurrent.TimeUnit;

@Service
public class TokenStoreService {

    private final StringRedisTemplate redis;

    public TokenStoreService(StringRedisTemplate redis) {
        this.redis = redis;
    }

    private String refreshKey(String userId) {
        return "auth:refresh:" + userId;
    }

    private String blacklistKey(String jti) {
        return "auth:blacklist:" + jti;
    }

    public void saveRefreshToken(String userId, String refreshToken, Duration ttl) {
        redis.opsForValue().set(refreshKey(userId), refreshToken, ttl.toSeconds(), TimeUnit.SECONDS);
    }

    public String getRefreshToken(String userId) {
        return redis.opsForValue().get(refreshKey(userId));
    }

    public void deleteRefreshToken(String userId) {
        redis.delete(refreshKey(userId));
    }

    public void blacklistAccessTokenJti(String jti, Duration ttl) {
        redis.opsForValue().set(blacklistKey(jti), "1", ttl.toSeconds(), TimeUnit.SECONDS);
    }

    public boolean isBlacklisted(String jti) {
        return Boolean.TRUE.equals(redis.hasKey(blacklistKey(jti)));
    }
}
