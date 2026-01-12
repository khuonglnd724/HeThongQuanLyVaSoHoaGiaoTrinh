package com.smd.academic_service.service;

import com.smd.academic_service.model.dto.StatisticsDto;
import com.smd.academic_service.model.entity.*;
import com.smd.academic_service.repository.SyllabusRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

/**
 * Service để caching các dữ liệu thường xuyên được truy cập
 * - Statistics (độ phủ CLO-PLO) - TTL: 1 giờ
 * - Prerequisite chains - TTL: 24 giờ
 * - Curriculum structure - TTL: 24 giờ
 * - Search results - TTL: 30 phút
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class CacheService {
    
    private final StatisticsService statisticsService;
    private final PrerequisiteValidatorService prerequisiteValidatorService;
    private final SyllabusRepository syllabusRepository;
    
    // Local cache with TTL
    private final Cache<String, StatisticsDto.ProgramStatistics> programStatsCache = new Cache<>(1, TimeUnit.HOURS);
    private final Cache<String, StatisticsDto.SubjectStatistics> subjectStatsCache = new Cache<>(1, TimeUnit.HOURS);
    private final Cache<String, StatisticsDto.DepartmentStatistics> deptStatsCache = new Cache<>(1, TimeUnit.HOURS);
    private final Cache<String, List<Syllabus>> searchResultsCache = new Cache<>(30, TimeUnit.MINUTES);
    
    /**
     * Get program statistics with cache
     */
    @Cacheable(value = "programStats", key = "#programId")
    public StatisticsDto.ProgramStatistics getProgramStatisticsWithCache(Long programId) {
        log.debug("Fetching program statistics with cache for: {}", programId);
        
        String cacheKey = "program_" + programId;
        return programStatsCache.getOrCompute(cacheKey, 
            () -> statisticsService.getProgramStatistics(programId));
    }
    
    /**
     * Get subject statistics with cache
     */
    @Cacheable(value = "subjectStats", key = "#subjectId")
    public StatisticsDto.SubjectStatistics getSubjectStatisticsWithCache(Long subjectId) {
        log.debug("Fetching subject statistics with cache for: {}", subjectId);
        
        String cacheKey = "subject_" + subjectId;
        return subjectStatsCache.getOrCompute(cacheKey, 
            () -> statisticsService.getSubjectStatistics(subjectId));
    }
    
    /**
     * Get department statistics with cache
     */
    @Cacheable(value = "departmentStats")
    public StatisticsDto.DepartmentStatistics getDepartmentStatisticsWithCache() {
        log.debug("Fetching department statistics with cache");
        
        return deptStatsCache.getOrCompute("department_stats", 
            () -> statisticsService.getDepartmentStatistics());
    }
    
    /**
     * Invalidate program statistics cache
     */
    @CacheEvict(value = "programStats", key = "#programId")
    @Transactional
    public void invalidateProgramStatsCache(Long programId) {
        log.debug("Invalidating program statistics cache for: {}", programId);
        programStatsCache.invalidate("program_" + programId);
    }
    
    /**
     * Invalidate subject statistics cache
     */
    @CacheEvict(value = "subjectStats", key = "#subjectId")
    @Transactional
    public void invalidateSubjectStatsCache(Long subjectId) {
        log.debug("Invalidating subject statistics cache for: {}", subjectId);
        subjectStatsCache.invalidate("subject_" + subjectId);
    }
    
    /**
     * Invalidate department statistics cache
     */
    @CacheEvict(value = "departmentStats")
    @Transactional
    public void invalidateDepartmentStatsCache() {
        log.debug("Invalidating department statistics cache");
        deptStatsCache.invalidate("department_stats");
    }
    
    /**
     * Invalidate all caches
     */
    @CacheEvict(allEntries = true, value = {"programStats", "subjectStats", "departmentStats"})
    @Transactional
    public void invalidateAllCaches() {
        log.info("Invalidating all caches");
        programStatsCache.clear();
        subjectStatsCache.clear();
        deptStatsCache.clear();
        searchResultsCache.clear();
    }
    
    /**
     * Invalidate when syllabus is updated
     */
    @Transactional
    public void onSyllabusUpdated(Syllabus syllabus) {
        log.debug("Invalidating cache for syllabus update: {}", syllabus.getId());
        
        // Invalidate related caches
        invalidateSubjectStatsCache(syllabus.getSubject().getId());
        invalidateProgramStatsCache(syllabus.getSubject().getProgram().getId());
        invalidateDepartmentStatsCache();
    }
    
    /**
     * Invalidate when CLO mapping is updated
     */
    @Transactional
    public void onCloMappingUpdated(Long programId) {
        log.debug("Invalidating cache for CLO mapping update: {}", programId);
        
        invalidateProgramStatsCache(programId);
        invalidateDepartmentStatsCache();
    }
    
    /**
     * Get cache statistics
     */
    public CacheStatistics getCacheStatistics() {
        log.debug("Getting cache statistics");
        
        return CacheStatistics.builder()
            .programStatsCacheSize(programStatsCache.size())
            .subjectStatsCacheSize(subjectStatsCache.size())
            .searchResultsCacheSize(searchResultsCache.size())
            .totalCacheSize(programStatsCache.size() + subjectStatsCache.size() + searchResultsCache.size())
            .build();
    }
    
    /**
     * Warm up cache with frequently accessed data
     */
    @Transactional
    public void warmUpCache() {
        log.info("Warming up cache with frequently accessed data");
        
        // Get all department statistics
        getDepartmentStatisticsWithCache();
        
        log.info("Cache warm-up completed");
    }
    
    /**
     * Simple TTL Cache implementation
     */
    public static class Cache<K, V> {
        private final ConcurrentHashMap<K, CacheEntry<V>> store = new ConcurrentHashMap<>();
        private final long ttlMillis;
        
        public Cache(long ttl, TimeUnit unit) {
            this.ttlMillis = unit.toMillis(ttl);
        }
        
        public V get(K key) {
            CacheEntry<V> entry = store.get(key);
            if (entry == null) {
                return null;
            }
            
            if (System.currentTimeMillis() > entry.expiryTime) {
                store.remove(key);
                return null;
            }
            
            return entry.value;
        }
        
        public V getOrCompute(K key, Supplier<V> supplier) {
            V cached = get(key);
            if (cached != null) {
                return cached;
            }
            
            V value = supplier.get();
            put(key, value);
            return value;
        }
        
        public void put(K key, V value) {
            long expiryTime = System.currentTimeMillis() + ttlMillis;
            store.put(key, new CacheEntry<>(value, expiryTime));
        }
        
        public void invalidate(K key) {
            store.remove(key);
        }
        
        public void clear() {
            store.clear();
        }
        
        public int size() {
            return store.size();
        }
        
        private static class CacheEntry<V> {
            V value;
            long expiryTime;
            
            CacheEntry(V value, long expiryTime) {
                this.value = value;
                this.expiryTime = expiryTime;
            }
        }
    }
    
    /**
     * Functional interface for supplier
     */
    @FunctionalInterface
    public interface Supplier<V> {
        V get();
    }
    
    /**
     * Cache statistics DTO
     */
    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @lombok.Builder
    public static class CacheStatistics {
        private Integer programStatsCacheSize;
        private Integer subjectStatsCacheSize;
        private Integer searchResultsCacheSize;
        private Integer totalCacheSize;
        private Long lastUpdated;
    }
}
