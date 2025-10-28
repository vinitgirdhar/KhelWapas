/**
 * Performance Testing Script for Product API
 * Run with: npx tsx test-product-performance.ts
 */

const API_BASE = 'http://localhost:9002'

interface TestResult {
  testName: string
  responseTime: number
  cacheStatus: string
  productCount: number
}

async function testEndpoint(url: string, testName: string): Promise<TestResult> {
  const start = performance.now()
  const response = await fetch(url)
  const end = performance.now()
  
  const data = await response.json()
  const cacheStatus = response.headers.get('X-Cache') || 'N/A'
  const serverTime = response.headers.get('X-Response-Time') || 'N/A'
  
  console.log(`\n📊 ${testName}`)
  console.log(`   Server Time: ${serverTime}`)
  console.log(`   Cache Status: ${cacheStatus}`)
  console.log(`   Products: ${data.products?.length || 0}`)
  console.log(`   Total Time: ${(end - start).toFixed(2)}ms`)
  
  return {
    testName,
    responseTime: end - start,
    cacheStatus,
    productCount: data.products?.length || 0
  }
}

async function clearCache() {
  await fetch(`${API_BASE}/api/cache/invalidate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ all: true })
  })
  console.log('🗑️  Cache cleared')
}

async function getCacheStats() {
  const response = await fetch(`${API_BASE}/api/cache/invalidate`)
  const data = await response.json()
  return data
}

async function runTests() {
  console.log('🚀 Product API Performance Tests\n')
  console.log('=' .repeat(50))
  
  const results: TestResult[] = []
  
  // Test 1: First request (uncached)
  await clearCache()
  results.push(await testEndpoint(`${API_BASE}/api/products?available=true`, 'Test 1: Uncached Request'))
  
  // Test 2: Second request (cached)
  results.push(await testEndpoint(`${API_BASE}/api/products?available=true`, 'Test 2: Cached Request'))
  
  // Test 3: Third request (still cached)
  results.push(await testEndpoint(`${API_BASE}/api/products?available=true`, 'Test 3: Cached Request #2'))
  
  // Test 4: Different params (new cache entry)
  results.push(await testEndpoint(`${API_BASE}/api/products?category=Cricket`, 'Test 4: Different Query (uncached)'))
  
  // Test 5: Same params (cached)
  results.push(await testEndpoint(`${API_BASE}/api/products?category=Cricket`, 'Test 5: Same Query (cached)'))
  
  // Check cache stats
  console.log('\n📈 Cache Statistics')
  console.log('=' .repeat(50))
  const stats = await getCacheStats()
  console.log(`   Cached Entries: ${stats.size}`)
  console.log(`   Keys:`)
  stats.entries.forEach((entry: string) => {
    console.log(`     - ${entry}`)
  })
  
  // Summary
  console.log('\n📊 Performance Summary')
  console.log('=' .repeat(50))
  
  const uncached = results.filter(r => r.cacheStatus === 'MISS')
  const cached = results.filter(r => r.cacheStatus === 'HIT')
  
  if (uncached.length > 0) {
    const avgUncached = uncached.reduce((sum, r) => sum + r.responseTime, 0) / uncached.length
    console.log(`   Avg Uncached Response: ${avgUncached.toFixed(2)}ms`)
  }
  
  if (cached.length > 0) {
    const avgCached = cached.reduce((sum, r) => sum + r.responseTime, 0) / cached.length
    console.log(`   Avg Cached Response: ${avgCached.toFixed(2)}ms`)
    
    if (uncached.length > 0) {
      const improvement = (uncached[0].responseTime / avgCached).toFixed(1)
      console.log(`   🚀 Cache Speedup: ${improvement}x faster`)
    }
  }
  
  console.log('\n✅ Tests Complete!\n')
}

// Run tests
runTests().catch(console.error)
