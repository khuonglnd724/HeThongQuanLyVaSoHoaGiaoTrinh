import apiClient from '../../../services/api/apiClient'

const PROMETHEUS_URL = 'http://localhost:9090/prometheus'

/**
 * Prometheus Service - Fetch metrics from Prometheus directly
 */
const prometheusService = {
  /**
   * Query Prometheus for metrics
   * @param {string} query - PromQL query
   * @param {number} time - Unix timestamp (optional, defaults to now)
   */
  async queryInstant(query, time = null) {
    try {
      const url = new URL(`${PROMETHEUS_URL}/api/v1/query`)
      url.searchParams.append('query', query)
      if (time) url.searchParams.append('time', time)

      const response = await fetch(url.toString())
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return await response.json()
    } catch (error) {
      console.error('[PrometheusService] Query error:', error)
      throw error
    }
  },

  /**
   * Query Prometheus with range (time series)
   * @param {string} query - PromQL query
   * @param {number} start - Start time (Unix timestamp)
   * @param {number} end - End time (Unix timestamp)
   * @param {string} step - Query resolution (default: 15s)
   */
  async queryRange(query, start, end, step = '15s') {
    try {
      const url = new URL(`${PROMETHEUS_URL}/api/v1/query_range`)
      url.searchParams.append('query', query)
      url.searchParams.append('start', start)
      url.searchParams.append('end', end)
      url.searchParams.append('step', step)

      const response = await fetch(url.toString())
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return await response.json()
    } catch (error) {
      console.error('[PrometheusService] Range query error:', error)
      throw error
    }
  },

  /**
   * Get all Prometheus targets
   */
  async getTargets() {
    try {
      const response = await fetch(`${PROMETHEUS_URL}/api/v1/targets`)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return await response.json()
    } catch (error) {
      console.error('[PrometheusService] Targets error:', error)
      throw error
    }
  },

  /**
   * Get service health status from Prometheus "up" metric
   */
  async getServiceHealth() {
    try {
      const response = await this.queryInstant('up')
      const services = {}
      
      if (response.data && response.data.result) {
        response.data.result.forEach(item => {
          const application = item.metric.application || item.metric.instance || 'unknown'
          services[application] = {
            status: item.value[1] === '1' ? 'UP' : 'DOWN',
            instance: item.metric.instance,
            job: item.metric.job
          }
        })
      }
      
      return services
    } catch (error) {
      console.error('[PrometheusService] Health check error:', error)
      return {}
    }
  },

  /**
   * Get HTTP request metrics
   */
  async getHttpMetrics() {
    try {
      const response = await this.queryInstant('rate(http_server_requests_seconds_count[1m])')
      return response.data?.result || []
    } catch (error) {
      console.error('[PrometheusService] HTTP metrics error:', error)
      return []
    }
  },

  /**
   * Get JVM memory metrics
   */
  async getJvmMemory() {
    try {
      const response = await this.queryInstant('jvm_memory_used_bytes{area="heap"} / 1024 / 1024')
      return response.data?.result || []
    } catch (error) {
      console.error('[PrometheusService] JVM memory error:', error)
      return []
    }
  },

  /**
   * Get error rate (5xx)
   */
  async getErrorRate() {
    try {
      const response = await this.queryInstant(
        '(sum(rate(http_server_requests_seconds_count{status=~"5.."}[5m])) by (application)) / (sum(rate(http_server_requests_seconds_count[5m])) by (application)) * 100'
      )
      return response.data?.result || []
    } catch (error) {
      console.error('[PrometheusService] Error rate error:', error)
      return []
    }
  },

  /**
   * Get latency metrics (p95)
   */
  async getLatencyP95() {
    try {
      const response = await this.queryInstant(
        'histogram_quantile(0.95, rate(http_server_requests_seconds_bucket[5m])) * 1000'
      )
      return response.data?.result || []
    } catch (error) {
      console.error('[PrometheusService] Latency error:', error)
      return []
    }
  },

  /**
   * Get all services list from metrics
   */
  async getServices() {
    try {
      const response = await this.queryInstant('count(up) by (application)')
      const services = []
      
      if (response.data && response.data.result) {
        response.data.result.forEach(item => {
          services.push(item.metric.application)
        })
      }
      
      return services
    } catch (error) {
      console.error('[PrometheusService] Services list error:', error)
      return []
    }
  }
}

export default prometheusService
