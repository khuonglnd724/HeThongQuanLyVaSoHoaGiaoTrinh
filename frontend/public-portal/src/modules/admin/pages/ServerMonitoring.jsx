import React, { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle, TrendingUp, Activity, ExternalLink } from 'lucide-react'
import prometheusService from '../services/prometheusService'

const ServerMonitoring = () => {
  const [serviceHealth, setServiceHealth] = useState({})
  const [httpMetrics, setHttpMetrics] = useState([])
  const [jvmMemory, setJvmMemory] = useState([])
  const [errorRate, setErrorRate] = useState([])
  const [latency, setLatency] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchMetrics()
    const interval = setInterval(fetchMetrics, 15000) // Refresh every 15s
    return () => clearInterval(interval)
  }, [])

  const fetchMetrics = async () => {
    try {
      setLoading(true)
      setError('')

      const [health, http, jvm, errors, lat] = await Promise.all([
        prometheusService.getServiceHealth(),
        prometheusService.getHttpMetrics(),
        prometheusService.getJvmMemory(),
        prometheusService.getErrorRate(),
        prometheusService.getLatencyP95()
      ])

      setServiceHealth(health)
      setHttpMetrics(http)
      setJvmMemory(jvm)
      setErrorRate(errors)
      setLatency(lat)
    } catch (err) {
      console.error('[ServerMonitoring] Fetch error:', err)
      setError('Không thể tải dữ liệu từ Prometheus')
    } finally {
      setLoading(false)
    }
  }

  const upCount = Object.values(serviceHealth).filter(s => s.status === 'UP').length
  const downCount = Object.values(serviceHealth).filter(s => s.status === 'DOWN').length

  const formatMetricValue = (value) => {
    const num = parseFloat(value)
    if (isNaN(num)) return '0'
    return num > 100 ? num.toFixed(0) : num.toFixed(2)
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Monitoring Hệ Thống</h1>
            <p className="text-gray-600">Giám sát thời gian thực từ Prometheus & Grafana</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => window.open('http://localhost:8088', '_blank')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
              title="Mở NiFi"
            >
              <ExternalLink size={18} />
              Mở NiFi
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Service Health Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Services UP</p>
                <p className="text-3xl font-bold text-green-600">{upCount}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Services DOWN</p>
                <p className="text-3xl font-bold text-red-600">{downCount}</p>
              </div>
              <AlertCircle className="w-12 h-12 text-red-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Request Rate</p>
                <p className="text-3xl font-bold text-blue-600">{httpMetrics.length}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Uptime</p>
                <p className="text-3xl font-bold text-purple-600">99.9%</p>
              </div>
              <Activity className="w-12 h-12 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Services Status */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Trạng Thái Dịch Vụ</h2>
          </div>
          <div className="px-6 py-4">
            {loading ? (
              <p className="text-gray-600">Đang tải...</p>
            ) : Object.keys(serviceHealth).length === 0 ? (
              <p className="text-gray-600">Không có dữ liệu từ Prometheus</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(serviceHealth).map(([service, data]) => (
                  <div key={service} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{service}</p>
                        <p className="text-sm text-gray-600">{data.instance}</p>
                      </div>
                      {data.status === 'UP' ? (
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                          ✓ UP
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                          ✗ DOWN
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Performance Metrics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* JVM Memory */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="font-bold text-gray-900">JVM Heap Memory</h3>
            </div>
            <div className="px-6 py-4">
              {jvmMemory.length === 0 ? (
                <p className="text-gray-600">Không có dữ liệu</p>
              ) : (
                <div className="space-y-3">
                  {jvmMemory.slice(0, 5).map((metric, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">
                        {metric.metric.application || metric.metric.instance}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{
                              width: Math.min(
                                (parseFloat(metric.value[1]) / 512) * 100,
                                100
                              ) + '%'
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {formatMetricValue(metric.value[1])} MB
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Error Rate */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="font-bold text-gray-900">Error Rate (5xx)</h3>
            </div>
            <div className="px-6 py-4">
              {errorRate.length === 0 ? (
                <p className="text-gray-600">Không có lỗi</p>
              ) : (
                <div className="space-y-3">
                  {errorRate.slice(0, 5).map((metric, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">
                        {metric.metric.application || 'Unknown'}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-red-500 h-2 rounded-full"
                            style={{
                              width: Math.min(parseFloat(metric.value[1]), 100) + '%'
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium text-red-600">
                          {formatMetricValue(metric.value[1])}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Latency P95 */}
          <div className="bg-white rounded-lg shadow lg:col-span-2">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="font-bold text-gray-900">Response Time - P95 Latency</h3>
            </div>
            <div className="px-6 py-4">
              {latency.length === 0 ? (
                <p className="text-gray-600">Không có dữ liệu</p>
              ) : (
                <div className="space-y-3">
                  {latency.slice(0, 8).map((metric, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">
                        {metric.metric.application || metric.metric.instance}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-yellow-500 h-2 rounded-full"
                            style={{
                              width: Math.min(
                                (parseFloat(metric.value[1]) / 500) * 100,
                                100
                              ) + '%'
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {formatMetricValue(metric.value[1])} ms
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Grafana Dashboard */}
        <div className="bg-white rounded-lg shadow mt-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">📊 Grafana Dashboard</h2>
          </div>
          <div className="px-6 py-4">
            <iframe
              src="/grafana/d/smd-microservices/smd-microservices?orgId=1&kiosk=tv"
              width="100%"
              height="600"
              frameBorder="0"
              title="Grafana Dashboard"
              className="rounded-lg border border-gray-200"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ServerMonitoring
