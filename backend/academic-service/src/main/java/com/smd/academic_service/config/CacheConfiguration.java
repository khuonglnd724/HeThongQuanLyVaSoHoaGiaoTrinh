package com.smd.academic_service.config;

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
    
    // Cache names
    public static final String PROGRAMS_CACHE = "programs";
    public static final String SUBJECTS_CACHE = "subjects";
    public static final String SYLLABI_CACHE = "syllabi";
    public static final String CLOS_CACHE = "clos";
    public static final String PLOS_CACHE = "plos";
    public static final String PROGRAM_STATS_CACHE = "programStats";
    public static final String SUBJECT_STATS_CACHE = "subjectStats";
    public static final String DEPARTMENT_STATS_CACHE = "departmentStats";
    
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
        
        // Programs cache: 12 hours TTL (rarely changes)
        cacheConfigurations.put(PROGRAMS_CACHE, defaultConfig.entryTtl(Duration.ofHours(12)));
        
        // Subjects cache: 6 hours TTL (changes moderately)
        cacheConfigurations.put(SUBJECTS_CACHE, defaultConfig.entryTtl(Duration.ofHours(6)));
        
        // Syllabi cache: 2 hours TTL (changes frequently - approval workflow)
        cacheConfigurations.put(SYLLABI_CACHE, defaultConfig.entryTtl(Duration.ofHours(2)));
        
        // CLOs cache: 4 hours TTL
        cacheConfigurations.put(CLOS_CACHE, defaultConfig.entryTtl(Duration.ofHours(4)));
        
        // PLOs cache: 6 hours TTL
        cacheConfigurations.put(PLOS_CACHE, defaultConfig.entryTtl(Duration.ofHours(6)));
        
        // Statistics caches: 30 minutes TTL (need fresh data for dashboards)
        cacheConfigurations.put(PROGRAM_STATS_CACHE, defaultConfig.entryTtl(Duration.ofMinutes(30)));
        cacheConfigurations.put(SUBJECT_STATS_CACHE, defaultConfig.entryTtl(Duration.ofMinutes(30)));
        cacheConfigurations.put(DEPARTMENT_STATS_CACHE, defaultConfig.entryTtl(Duration.ofMinutes(30)));
        
        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(defaultConfig)
                .withInitialCacheConfigurations(cacheConfigurations)
                .build();
    }
}
