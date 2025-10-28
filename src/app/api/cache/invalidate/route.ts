import { NextRequest, NextResponse } from 'next/server'
import { cache } from '@/lib/cache'

/**
 * Cache invalidation endpoint
 * POST /api/cache/invalidate
 * 
 * Body options:
 * - { pattern: "products" } - Invalidate all product caches
 * - { pattern: "products:category:sports" } - Invalidate specific pattern
 * - { all: true } - Clear entire cache
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (body.all === true) {
      cache.clear()
      return NextResponse.json({ 
        success: true, 
        message: 'All cache cleared' 
      })
    }

    if (body.pattern) {
      cache.invalidatePattern(body.pattern)
      return NextResponse.json({ 
        success: true, 
        message: `Cache invalidated for pattern: ${body.pattern}` 
      })
    }

    return NextResponse.json({ 
      success: false, 
      message: 'Invalid request. Provide "pattern" or "all: true"' 
    }, { status: 400 })

  } catch (error) {
    console.error('Cache invalidation error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Get cache stats
export async function GET(request: NextRequest) {
  try {
    const stats = cache.getStats()
    return NextResponse.json({ 
      success: true, 
      ...stats 
    })
  } catch (error) {
    console.error('Cache stats error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
