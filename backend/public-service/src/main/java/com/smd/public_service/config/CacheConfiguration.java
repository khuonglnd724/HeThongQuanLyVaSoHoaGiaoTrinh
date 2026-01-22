package com.smd.public_service.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@Configuration
@EnableCaching
@ConditionalOnProperty(name = "spring.cache.type", havingValue = "redis", matchIfMissing = false)
public class CacheConfiguration {
    
    // Cache TTL constants
    public static final String SYLLABI_CACHE = "syllabi";
    public static final String SUBJECT_CACHE = "subjects";
    public static final String TREE_VIEW_CACHE = "treeView";
    public static final String DIFF_CACHE = "diff";
    
    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        // Default cache configuration
        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofHours(1))
                .serializeKeysWith(
                        RedisSerializationContext.SerializationPair
                                .fromSerializer(new StringRedisSerializer())
                )
                .serializeValuesWith(
                        RedisSerializationContext.SerializationPair
                                .fromSerializer(new GenericJackson2JsonRedisSerializer())
                )
                .disableCachingNullValues();
        
        // Specific cache configurations
        Map<String, RedisCacheConfiguration> cacheConfigurations = new HashMap<>();
        
        // Syllabus detail cache: 6 hours TTL
        cacheConfigurations.put(SYLLABI_CACHE, defaultConfig.entryTtl(Duration.ofHours(6)));
        
        // Subject list cache: 24 hours TTL (rarely changes)
        cacheConfigurations.put(SUBJECT_CACHE, defaultConfig.entryTtl(Duration.ofHours(24)));
        
        // Tree view cache: 12 hours TTL
        cacheConfigurations.put(TREE_VIEW_CACHE, defaultConfig.entryTtl(Duration.ofHours(12)));
        
        // Diff cache: 2 hours TTL (used for comparison)
        cacheConfigurations.put(DIFF_CACHE, defaultConfig.entryTtl(Duration.ofHours(2)));
        
        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(defaultConfig)
                .withInitialCacheConfigurations(cacheConfigurations)
                .build();
    }
}
