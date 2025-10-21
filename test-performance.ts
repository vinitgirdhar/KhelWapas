/**
 * Performance Testing Script
 * Run with: npx tsx test-performance.ts
 */

import { prisma } from './src/lib/prisma'

interface TestResult {
  test: string
  duration: number
  count: number
  passed: boolean
}

const results: TestResult[] = []
const SLOW_THRESHOLD = 500 // ms

async function measureQuery(name: string, queryFn: () => Promise<any>) {
  const start = Date.now()
  let count = 0
  
  try {
    const result = await queryFn()
    count = Array.isArray(result) ? result.length : 1
    const duration = Date.now() - start
    const passed = duration < SLOW_THRESHOLD
    
    results.push({ test: name, duration, count, passed })
    
    const status = passed ? '✅' : '❌'
    console.log(`${status} ${name}: ${duration}ms (${count} records)`)
    
    return result
  } catch (error) {
    const duration = Date.now() - start
    results.push({ test: name, duration, count: 0, passed: false })
    console.error(`❌ ${name} FAILED: ${error}`)
    throw error
  }
}

async function runPerformanceTests() {
  console.log('🚀 Starting Performance Tests...\n')
  console.log('Target: All queries < 500ms\n')

  try {
    // Test 1: Products list (paginated)
    await measureQuery('Products List (20 items)', async () => {
      return prisma.product.findMany({
        where: { isAvailable: true },
        orderBy: { createdAt: 'desc' },
        take: 20
      })
    })

    // Test 2: Orders list (paginated)
    await measureQuery('Orders List (20 items)', async () => {
      return prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          userId: true,
          totalPrice: true,
          fulfillmentStatus: true,
          createdAt: true,
          user: {
            select: {
              fullName: true,
              email: true
            }
          }
        },
        take: 20
      })
    })

    // Test 3: Find single order
    const orders = await prisma.order.findMany({ take: 1 })
    if (orders.length > 0) {
      const orderId = orders[0].id
      await measureQuery('Single Order Lookup', async () => {
        return prisma.order.findUnique({
          where: { id: orderId },
          select: {
            id: true,
            userId: true,
            items: true,
            totalPrice: true,
            fulfillmentStatus: true,
            user: {
              select: {
                id: true,
                fullName: true,
                email: true
              }
            }
          }
        })
      })
    }

    // Test 4: Users list (admin view)
    await measureQuery('Users List (50 items)', async () => {
      return prisma.user.findMany({
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: 50
      })
    })

    // Test 5: Products filtered by category
    await measureQuery('Products by Category', async () => {
      return prisma.product.findMany({
        where: {
          category: 'Cricket',
          isAvailable: true
        },
        orderBy: { createdAt: 'desc' },
        take: 20
      })
    })

    // Test 6: User addresses
    const users = await prisma.user.findMany({ take: 1 })
    if (users.length > 0) {
      const userId = users[0].id
      await measureQuery('User Addresses', async () => {
        return prisma.address.findMany({
          where: { userId },
          orderBy: { isDefault: 'desc' }
        })
      })
    }

    // Test 7: Sell requests
    await measureQuery('Sell Requests List (50 items)', async () => {
      return prisma.sellRequest.findMany({
        select: {
          id: true,
          userId: true,
          title: true,
          status: true,
          createdAt: true,
          user: {
            select: {
              fullName: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 50
      })
    })

    // Test 8: Revenue calculation (recent orders)
    await measureQuery('Revenue Calculation (1000 orders)', async () => {
      return prisma.order.findMany({
        where: { paymentStatus: 'paid' },
        select: { totalPrice: true, items: true },
        take: 1000,
        orderBy: { createdAt: 'desc' }
      })
    })

    // Test 9: Product reviews
    const products = await prisma.product.findMany({ take: 1 })
    if (products.length > 0) {
      const productId = products[0].id
      await measureQuery('Product Reviews', async () => {
        return prisma.review.findMany({
          where: { productId },
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            user: {
              select: {
                fullName: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 20
        })
      })
    }

    // Test 10: User order count
    if (users.length > 0) {
      const userId = users[0].id
      await measureQuery('User Order Count', async () => {
        return prisma.order.count({
          where: { userId }
        })
      })
    }

    console.log('\n' + '='.repeat(60))
    console.log('📊 Test Summary')
    console.log('='.repeat(60))

    const passed = results.filter(r => r.passed).length
    const failed = results.filter(r => !r.passed).length
    const avgDuration = Math.round(results.reduce((sum, r) => sum + r.duration, 0) / results.length)
    const maxDuration = Math.max(...results.map(r => r.duration))
    const minDuration = Math.min(...results.map(r => r.duration))

    console.log(`Total Tests: ${results.length}`)
    console.log(`Passed: ${passed} ✅`)
    console.log(`Failed: ${failed} ❌`)
    console.log(`Success Rate: ${Math.round((passed / results.length) * 100)}%`)
    console.log(`\nAverage Duration: ${avgDuration}ms`)
    console.log(`Min Duration: ${minDuration}ms`)
    console.log(`Max Duration: ${maxDuration}ms`)
    console.log(`Target: < ${SLOW_THRESHOLD}ms`)

    if (failed > 0) {
      console.log('\n⚠️  Failed Tests:')
      results.filter(r => !r.passed).forEach(r => {
        console.log(`  - ${r.test}: ${r.duration}ms`)
      })
    }

    console.log('\n' + '='.repeat(60))
    
    if (passed === results.length) {
      console.log('🎉 All tests passed! Database is performing well.')
    } else {
      console.log('⚠️  Some tests failed. Consider adding more indexes or optimizing queries.')
    }

  } catch (error) {
    console.error('💥 Error running tests:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run tests
runPerformanceTests()
  .then(() => {
    console.log('\n✅ Performance tests completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error)
    process.exit(1)
  })
