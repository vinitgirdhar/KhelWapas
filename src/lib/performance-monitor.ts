/**
 * Performance monitoring middleware for tracking slow queries and API endpoints
 */

export interface PerformanceMetrics {
  endpoint: string
  method: string
  duration: number
  timestamp: Date
  userId?: string
  statusCode?: number
}

const performanceLog: PerformanceMetrics[] = []
const MAX_LOG_SIZE = 1000
const SLOW_THRESHOLD_MS = 500

export function logPerformance(metrics: PerformanceMetrics) {
  if (process.env.NODE_ENV === 'development') {
    performanceLog.push(metrics)
    
    // Keep log size manageable
    if (performanceLog.length > MAX_LOG_SIZE) {
      performanceLog.shift()
    }

    // Log slow requests
    if (metrics.duration > SLOW_THRESHOLD_MS) {
      console.warn(
        `🐌 SLOW REQUEST: ${metrics.method} ${metrics.endpoint} took ${metrics.duration}ms`
      )
    }
  }
}

export function getPerformanceStats() {
  if (performanceLog.length === 0) {
    return {
      totalRequests: 0,
      avgDuration: 0,
      slowRequests: 0,
      endpoints: {}
    }
  }

  const slowRequests = performanceLog.filter(m => m.duration > SLOW_THRESHOLD_MS)
  const avgDuration = performanceLog.reduce((sum, m) => sum + m.duration, 0) / performanceLog.length

  // Group by endpoint
  const endpoints: Record<string, { count: number; avgDuration: number; maxDuration: number }> = {}
  
  performanceLog.forEach(metric => {
    const key = `${metric.method} ${metric.endpoint}`
    if (!endpoints[key]) {
      endpoints[key] = { count: 0, avgDuration: 0, maxDuration: 0 }
    }
    endpoints[key].count++
    endpoints[key].avgDuration = 
      (endpoints[key].avgDuration * (endpoints[key].count - 1) + metric.duration) / endpoints[key].count
    endpoints[key].maxDuration = Math.max(endpoints[key].maxDuration, metric.duration)
  })

  return {
    totalRequests: performanceLog.length,
    avgDuration: Math.round(avgDuration),
    slowRequests: slowRequests.length,
    slowPercentage: Math.round((slowRequests.length / performanceLog.length) * 100),
    endpoints
  }
}

export function clearPerformanceLog() {
  performanceLog.length = 0
}

/**
 * Middleware wrapper for Next.js API routes
 */
export function withPerformanceMonitoring<T extends (...args: any[]) => Promise<Response>>(
  handler: T,
  endpoint: string
): T {
  return (async (...args: any[]) => {
    const start = Date.now()
    const request = args[0] as Request
    const method = request.method

    try {
      const response = await handler(...args)
      const duration = Date.now() - start

      logPerformance({
        endpoint,
        method,
        duration,
        timestamp: new Date(),
        statusCode: response.status
      })

      return response
    } catch (error) {
      const duration = Date.now() - start
      
      logPerformance({
        endpoint,
        method,
        duration,
        timestamp: new Date(),
        statusCode: 500
      })

      throw error
    }
  }) as T
}

/**
 * Simple timer utility for measuring code blocks
 */
export class PerformanceTimer {
  private startTime: number
  private label: string

  constructor(label: string) {
    this.label = label
    this.startTime = Date.now()
  }

  end() {
    const duration = Date.now() - this.startTime
    if (process.env.NODE_ENV === 'development') {
      if (duration > 100) {
        console.log(`⏱️  ${this.label}: ${duration}ms`)
      }
    }
    return duration
  }
}
