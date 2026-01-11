package com.smd.public_service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import jakarta.persistence.EntityManagerFactory;

/**
 * Query Optimization Configuration
 * Strategies:
 * 1. Lazy loading for relationships
 * 2. Efficient queries with @Query annotations
 * 3. Proper indexing on database tables
 * 4. Caching with Redis for frequently accessed data
 * 5. Pagination for large result sets
 * 6. Full-text search using PostgreSQL capabilities
 */
@Configuration
@EnableTransactionManagement
@EnableJpaRepositories(
    basePackages = "com.smd.public_service.repository",
    entityManagerFactoryRef = "entityManagerFactory",
    transactionManagerRef = "transactionManager"
)
public class QueryOptimizationConfig {
    
    /**
     * Query Optimization Best Practices:
     * 
     * 1. Use @Transactional(readOnly = true) for queries
     *    - Allows Spring to optimize read operations
     *    - Disables unnecessary flush operations
     * 
     * 2. Use Lazy Loading for relationships
     *    - Avoid N+1 query problems
     *    - Load related data only when needed
     * 
     * 3. Use JOIN FETCH in queries for better performance
     *    - Example: SELECT s FROM Syllabus s LEFT JOIN FETCH s.subject
     * 
     * 4. Use pagination with Page<T>
     *    - Prevent loading entire result sets
     *    - Improve memory usage
     * 
     * 5. Use projections for partial data
     *    - SELECT new com.smd.public_service.dto.SyllabusSummary(...)
     * 
     * 6. Use Redis caching with @Cacheable
     *    - Cache frequently accessed entities
     *    - Reduce database queries
     * 
     * 7. Use Full-text Search
     *    - Leverage PostgreSQL tsvector for fast text search
     *    - More efficient than LIKE queries
     * 
     * 8. Create proper database indexes
     *    - Index on frequently searched columns
     *    - Composite indexes for common filter combinations
     * 
     * 9. Use batch operations
     *    - Reduce number of database round trips
     *    - Use spring.jpa.properties.hibernate.jdbc.batch_size
     * 
     * 10. Monitor query performance
     *     - Use Spring Data Query Execution Listener
     *     - Log slow queries
     */
    
    /**
     * Database Index Strategy:
     * 
     * Syllabus table indexes:
     * - subject_id (for filtering by subject)
     * - syllabus_code (for searching by code)
     * - status (for filtering published syllabi)
     * - updated_at (for sorting by recent changes)
     * 
     * Subject table indexes:
     * - subject_code (for unique code lookup)
     * - program_id (for filtering by program)
     * 
     * SyllabusFollow table indexes:
     * - syllabus_id, user_id (unique constraint)
     * - syllabus_id (for getting followers)
     * - user_id (for getting user's follows)
     * 
     * SyllabusFeedback table indexes:
     * - syllabus_id (for getting feedback for a syllabus)
     * - status (for filtering feedback by status)
     */
}
