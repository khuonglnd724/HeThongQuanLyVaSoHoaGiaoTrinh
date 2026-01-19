# Public Service - Developer Quick Reference

## Project Structure
```
backend/public-service/
├── src/main/java/com/smd/public_service/
│   ├── config/
│   │   ├── CacheConfiguration.java      - Redis cache setup with TTL strategies
│   │   └── QueryOptimizationConfig.java - Database optimization settings
│   ├── controller/
│   │   ├── SyllabusSearchController.java  - Search functionality
│   │   └── SyllabusDetailController.java  - NEW: Detail endpoints (6 endpoints)
│   ├── service/
│   │   ├── SyllabusSearchService.java    - Enhanced with getSyllabusById()
│   │   ├── TreeViewService.java          - Subject hierarchy
│   │   ├── SyllabusDiffService.java      - Version comparison
│   │   ├── FollowService.java            - Subscribe management
│   │   ├── FeedbackService.java          - Feedback handling
│   │   └── PdfExportService.java         - NEW: PDF generation
│   ├── dto/
│   │   ├── TreeNodeDto.java              - NEW: Tree structure
│   │   ├── DiffDto.java                  - NEW: Comparison data
│   │   ├── FollowResponseDto.java        - NEW: Follow status
│   │   ├── FeedbackRequestDto.java       - NEW: Feedback input
│   │   ├── FeedbackResponseDto.java      - NEW: Feedback confirmation
│   │   └── SyllabusDetailDto.java        - Detailed syllabus
│   ├── model/entity/
│   │   ├── Syllabus.java
│   │   ├── Subject.java
│   │   ├── SyllabusFollow.java
│   │   └── SyllabusFeedback.java
│   └── repository/
│       ├── SyllabusRepository.java        - Enhanced with more methods
│       ├── SyllabusFollowRepository.java  - Added countBySyllabusId()
│       └── SyllabusFeedbackRepository.java
├── src/main/resources/
│   └── application.yml                    - Enhanced with cache config
├── docs/
│   └── API.md                             - Comprehensive API documentation
├── pom.xml                                - Added iText, Jackson, Jedis
└── IMPLEMENTATION_SUMMARY.md              - Implementation details
```

---

## Key Classes Reference

### Controllers
```java
@RestController
@RequestMapping("/api/public/syllabi")
public class SyllabusDetailController {
    // GET /{id} - Syllabus detail
    // GET /{id}/tree - Subject tree
    // GET /{id}/diff - Version comparison
    // POST /{id}/follow - Subscribe
    // DELETE /{id}/follow - Unsubscribe
    // POST /feedback - Submit feedback
    // GET /{id}/export-pdf - Export PDF
}
```

### Services
```java
// PDF Generation
PdfExportService pdfExportService.exportSyllabusToPdf(syllabusId);

// Subject Tree
TreeViewService.SubjectTreeNode tree = 
    treeViewService.buildTree(subjectId);

// Version Comparison
DiffResult diff = diffService.compareSyllabi(subjectId, v1, v2);

// Follow Management
FollowResponse follow = followService.followSyllabus(id, userId, email);

// Feedback Handling
FeedbackResponse fb = feedbackService.createFeedback(request);
```

---

## Caching Guide

### Cache Names
```java
SYLLABI_CACHE = "syllabi"        // 6 hours - Detailed syllabus info
SUBJECT_CACHE = "subjects"       // 24 hours - Subject lists
TREE_VIEW_CACHE = "treeView"     // 12 hours - Subject hierarchies
DIFF_CACHE = "diff"              // 2 hours - Version comparisons
```

### Usage
```java
@Cacheable(value = "syllabi", key = "#id")
public SyllabusDetailDto getSyllabusDetail(Long id) { }

@Cacheable(value = "treeView", key = "#id")
public ResponseEntity<?> getSubjectTree(Long id) { }
```

### Manual Cache Control
```java
// Invalidate cache after update
@CacheEvict(value = "syllabi", key = "#id")
public void updateSyllabus(Long id, SyllabusData data) { }

// Clear all cache for a type
@CacheEvict(value = "syllabi", allEntries = true)
public void clearSyllabusCache() { }
```

---

## Database Queries

### Optimized Queries
```java
// Find syllabus with lazy loading
Syllabus s = syllabusRepository.findById(id).orElseThrow();

// Full-text search (PostgreSQL)
Page<Syllabus> results = 
    syllabusRepository.fullTextSearch("query", pageable);

// Get prerequisites
List<Subject> prereqs = 
    subjectRepository.findPrerequisites(subjectId);

// Get followers for notification
List<SyllabusFollow> followers = 
    followRepository.findFollowersToNotify(syllabusId);
```

### Index Strategy
```sql
-- For fast lookup
CREATE INDEX idx_syllabus_id ON syllabus(id);
CREATE INDEX idx_subject_code ON subject(subject_code);

-- For filtering
CREATE INDEX idx_syllabus_status ON syllabus(status);
CREATE INDEX idx_feedback_status ON syllabus_feedback(status);

-- For joining
CREATE INDEX idx_follow_user_id ON syllabus_follow(user_id);
CREATE INDEX idx_feedback_syllabus_id ON syllabus_feedback(syllabus_id);
```

---

## API Endpoint Cheatsheet

### Retrieval (GET)
```bash
# Syllabus detail (cached 6h)
GET /api/public/syllabi/1

# Subject tree (cached 12h)
GET /api/public/syllabi/1/tree

# Version comparison (cached 2h)
GET /api/public/syllabi/1/diff?targetVersion=1

# Export PDF
GET /api/public/syllabi/1/export-pdf → CS101_v1.pdf
```

### Actions (POST/DELETE)
```bash
# Subscribe to syllabus
POST /api/public/syllabi/1/follow?userId=123&email=user@example.com

# Unsubscribe
DELETE /api/public/syllabi/1/follow?userId=123

# Send feedback
POST /api/public/feedback
{
  "syllabusId": 1,
  "userId": 123,
  "userEmail": "user@example.com",
  "feedbackType": "ERROR",
  "title": "...",
  "message": "..."
}
```

---

## Configuration Checklist

### application.yml
```yaml
✓ Database: PostgreSQL jdbc:postgresql://postgres:5432/public_db
✓ Redis: redis:6379
✓ Port: 8083
✓ Service name: public-service
✓ Eureka: http://discovery-server:8761/eureka
✓ Caching enabled: spring.cache.type=redis
✓ JPA optimization: batch_size=20, fetch_size=50
```

### pom.xml
```xml
✓ Spring Boot 3.2.0
✓ PostgreSQL driver
✓ Spring Data JPA
✓ Spring Data Redis
✓ iText PDF 7.2.5
✓ Jackson 2.x
✓ Jedis client
✓ Lombok
```

---

## Common Development Tasks

### Add New Cached Endpoint
```java
@GetMapping("/new-endpoint")
@Cacheable(value = "newCache", key = "#id")
public ResponseEntity<?> newEndpoint(@PathVariable Long id) {
    // Add TTL in CacheConfiguration.java
    return ResponseEntity.ok(data);
}
```

### Enable Cache Invalidation
```java
@PostMapping("/{id}")
@CacheEvict(value = "syllabi", key = "#id")
public ResponseEntity<?> updateSyllabus(
    @PathVariable Long id, 
    @RequestBody SyllabusUpdateDto dto) {
    // Update logic
    return ResponseEntity.ok("Updated");
}
```

### Query Performance Improvement
```java
// BAD: N+1 problem
List<Syllabus> syllabi = repository.findAll();
for (Syllabus s : syllabi) {
    s.getSubject().getName(); // Extra query per row
}

// GOOD: Join fetch
@Query("SELECT s FROM Syllabus s LEFT JOIN FETCH s.subject")
List<Syllabus> findAllWithSubject();
```

### Error Handling
```java
try {
    Syllabus s = searchService.getSyllabusById(id);
    return ResponseEntity.ok(convertToDto(s));
} catch (RuntimeException e) {
    log.error("Error fetching syllabus: {}", e.getMessage());
    return ResponseEntity.notFound().build();
}
```

---

## Performance Tips

### ✓ DO
- Use `@Cacheable` for read-heavy operations
- Use pagination for large result sets
- Use lazy loading for relationships
- Use `@Transactional(readOnly = true)`
- Index frequently searched columns
- Use full-text search for text queries

### ✗ DON'T
- Use eager loading for large collections
- Fetch entire result sets without pagination
- Create unnecessary database queries
- Ignore N+1 problems
- Use wildcard at start of LIKE queries
- Cache frequently changing data

---

## Testing

### Unit Test Template
```java
@SpringBootTest
class SyllabusDetailControllerTest {
    
    @MockBean
    private SyllabusSearchService service;
    
    @Autowired
    private MockMvc mockMvc;
    
    @Test
    void testGetSyllabusDetail() throws Exception {
        // Given
        Long id = 1L;
        SyllabusDetailDto dto = new SyllabusDetailDto();
        
        // When
        when(service.getSyllabusById(id))
            .thenReturn(new Syllabus());
        
        // Then
        mockMvc.perform(get("/api/public/syllabi/" + id))
            .andExpect(status().isOk());
    }
}
```

### Integration Test
```java
@SpringBootTest
@AutoConfigureMockMvc
class PublicServiceIntegrationTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @Test
    void testFullWorkflow() throws Exception {
        // 1. Get syllabus
        // 2. Get tree
        // 3. Follow syllabus
        // 4. Export PDF
    }
}
```

---

## Monitoring & Debugging

### Health Check
```bash
curl http://localhost:8083/actuator/health
```

### Metrics
```bash
curl http://localhost:8083/actuator/metrics
```

### Logging
```yaml
logging:
  level:
    root: INFO
    com.smd.public_service: DEBUG
    org.springframework.cache: DEBUG
    org.hibernate.SQL: DEBUG
```

### Cache Statistics
```bash
# Redis CLI
redis-cli
> KEYS public-service:*
> GET public-service:syllabi::1
> TTL public-service:syllabi::1
```

---

## Troubleshooting

### Cache Not Working
- Check Redis is running: `redis-cli ping`
- Check cache name matches: `@Cacheable("syllabi")`
- Check TTL configuration in CacheConfiguration
- Monitor: `redis-cli MONITOR`

### Slow Queries
- Check indexes exist: `EXPLAIN ANALYZE SELECT ...`
- Check connection pool: `jedis.pool.max-active`
- Use pagination: `Page<T> findAll(Pageable)`
- Monitor slow queries in logs

### Memory Issues
- Reduce cache TTL
- Enable pagination
- Use lazy loading
- Monitor Redis: `INFO memory`

### Null Pointer Exceptions
- Always check optional results
- Validate input parameters
- Handle missing entities
- Use proper error handling

---

## Release Checklist

- [ ] All tests passing
- [ ] No compilation errors
- [ ] Cache configuration verified
- [ ] Database indexes created
- [ ] Redis running
- [ ] PostgreSQL database ready
- [ ] API documentation updated
- [ ] Performance tested
- [ ] Error handling verified
- [ ] Security review complete

---

## Links & Resources

- API Documentation: `/docs/API.md`
- Implementation Summary: `/IMPLEMENTATION_SUMMARY.md`
- Spring Data JPA Docs: https://docs.spring.io/spring-data/jpa/
- Redis Docs: https://redis.io/documentation
- iText PDF: https://itextpdf.com/
- Hibernate Docs: https://hibernate.org/

---

## Contact & Support

For issues or questions:
1. Check API documentation
2. Review implementation summary
3. Check logs: `tail -f logs/public-service.log`
4. Contact: development team

---

**Last Updated**: January 15, 2024
**Version**: 1.0.0
**Status**: Production Ready ✅
