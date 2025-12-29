"""Prometheus metrics for AI Service monitoring"""
import logging
from prometheus_client import Counter, Histogram, Gauge
import time

logger = logging.getLogger(__name__)

# Task metrics
task_counter = Counter(
    'ai_task_total',
    'Total AI tasks processed',
    ['task_type', 'status']
)

task_duration = Histogram(
    'ai_task_duration_seconds',
    'Time spent processing AI task',
    ['task_type'],
    buckets=(1, 5, 10, 30, 60, 300)
)

# API metrics
api_requests = Counter(
    'ai_api_requests_total',
    'Total API requests',
    ['endpoint', 'method', 'status']
)

api_duration = Histogram(
    'ai_api_duration_seconds',
    'API response time',
    ['endpoint'],
    buckets=(0.1, 0.5, 1, 2, 5)
)

# Groq API metrics
groq_calls = Counter(
    'groq_api_calls_total',
    'Total Groq API calls',
    ['status']
)

groq_tokens = Counter(
    'groq_tokens_total',
    'Total tokens used in Groq API',
    ['type'],  # prompt, completion, total
)

groq_duration = Histogram(
    'groq_api_duration_seconds',
    'Time to complete Groq API call',
    buckets=(1, 2, 5, 10, 30)
)

# Database metrics
db_queries = Counter(
    'db_queries_total',
    'Total database queries',
    ['operation', 'table']
)

db_duration = Histogram(
    'db_query_duration_seconds',
    'Database query duration',
    ['operation'],
    buckets=(0.01, 0.05, 0.1, 0.5, 1)
)

# Cache metrics
cache_hits = Counter(
    'cache_hits_total',
    'Cache hits',
    ['cache_type']
)

cache_misses = Counter(
    'cache_misses_total',
    'Cache misses',
    ['cache_type']
)

# Job queue metrics
job_queue_size = Gauge(
    'job_queue_size',
    'Current size of job queue'
)

job_in_progress = Gauge(
    'job_in_progress',
    'Jobs currently being processed',
    ['task_type']
)

# Error metrics
errors_total = Counter(
    'errors_total',
    'Total errors',
    ['error_type', 'task_type']
)

# WebSocket metrics
websocket_connections = Gauge(
    'websocket_connections',
    'Active WebSocket connections'
)

websocket_messages = Counter(
    'websocket_messages_total',
    'Total WebSocket messages sent',
    ['message_type']
)


class MetricsTracker:
    """Helper class for tracking metrics"""
    
    @staticmethod
    def record_task_start(task_type: str):
        """Record task start"""
        return time.time()
    
    @staticmethod
    def record_task_end(task_type: str, start_time: float, status: str):
        """Record task completion"""
        duration = time.time() - start_time
        task_counter.labels(task_type=task_type, status=status).inc()
        task_duration.labels(task_type=task_type).observe(duration)
    
    @staticmethod
    def record_groq_call(total_tokens: int, prompt_tokens: int, completion_tokens: int, success: bool = True):
        """Record Groq API call metrics"""
        status = "success" if success else "failure"
        groq_calls.labels(status=status).inc()
        
        groq_tokens.labels(type="prompt").inc(prompt_tokens)
        groq_tokens.labels(type="completion").inc(completion_tokens)
        groq_tokens.labels(type="total").inc(total_tokens)
    
    @staticmethod
    def record_api_request(endpoint: str, method: str, status_code: int, duration: float):
        """Record API request"""
        api_requests.labels(endpoint=endpoint, method=method, status=status_code).inc()
        api_duration.labels(endpoint=endpoint).observe(duration)
    
    @staticmethod
    def record_db_query(operation: str, table: str, duration: float):
        """Record database query"""
        db_queries.labels(operation=operation, table=table).inc()
        db_duration.labels(operation=operation).observe(duration)
    
    @staticmethod
    def record_error(error_type: str, task_type: str = "unknown"):
        """Record error"""
        errors_total.labels(error_type=error_type, task_type=task_type).inc()
    
    @staticmethod
    def set_queue_size(size: int):
        """Set job queue size"""
        job_queue_size.set(size)
    
    @staticmethod
    def update_in_progress(task_type: str, delta: int):
        """Update in-progress count"""
        job_in_progress.labels(task_type=task_type)._value._value += delta


# Health check function
def get_health_status():
    """Get service health status"""
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "metrics": {
            "total_tasks": task_counter._metrics if hasattr(task_counter, '_metrics') else {},
            "queue_size": job_queue_size._value._value if hasattr(job_queue_size, '_value') else 0,
        }
    }
