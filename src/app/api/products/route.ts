import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { normalizeMany } from '@/lib/image'
import { cache, generateCacheKey } from '@/lib/cache'
import { PerformanceTimer } from '@/lib/performance-timer'

// CRITICAL OPTIMIZATION: Disable file existence check for images
// File I/O is EXTREMELY expensive - checking existsSync for every image kills performance
// Instead, serve all normalized URLs and let the client/CDN handle 404s gracefully
const SKIP_FILE_EXISTENCE_CHECK = true

// Cache TTL in seconds
const CACHE_TTL = 300 // 5 minutes

export async function GET(request: NextRequest) {
  const timer = new PerformanceTimer('GET /api/products')
  
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const type = searchParams.get('type')
    const available = searchParams.get('available')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    
    timer.checkpoint('Parse params')

    // Generate cache key
    const cacheKey = generateCacheKey('products', {
      category: category || 'all',
      type: type || 'all',
      available: available || 'all',
      page,
      limit
    })

    // Check cache first
    const cached = cache.get(cacheKey)
    if (cached) {
      timer.checkpoint('Cache hit')
      timer.end()
      return NextResponse.json(cached, {
        headers: {
          'X-Cache': 'HIT',
          'X-Response-Time': `${timer.getTotal().toFixed(2)}ms`
        }
      })
    }

    timer.checkpoint('Cache miss')

    // Build optimized where clause using composite index
    const where: any = {}
    
    if (category) {
      where.category = category
    }
    
    if (type) {
      where.type = type
    }
    
    if (available === 'true') {
      where.isAvailable = true
    }

    const skip = (page - 1) * limit

    // OPTIMIZATION: Use select to fetch only required fields
    // This reduces data transfer and serialization overhead
    const products = await prisma.product.findMany({
      where,
      select: {
        id: true,
        name: true,
        category: true,
        type: true,
        price: true,
        originalPrice: true,
        grade: true,
        imageUrls: true,
        badge: true,
        description: true,
        specs: true,
        isAvailable: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: skip
    })

    timer.checkpoint('Database query')

    // OPTIMIZATION: Batch transform without expensive I/O operations
    const transformedProducts = products.map(product => {
      // Normalize images without file existence checks
      let images = Array.isArray(product.imageUrls) 
        ? normalizeMany(product.imageUrls as any) 
        : []
      
      // REMOVED: File existence check - major performance bottleneck
      // Old code did existsSync for EVERY image - that's 100s of disk I/O calls!
      // Let the browser/CDN handle missing images gracefully
      
      const primary = images[0] || '/images/products/background.jpg'
      
      return {
        id: product.id,
        name: product.name,
        category: product.category,
        type: product.type,
        price: Number(product.price),
        originalPrice: product.originalPrice ? Number(product.originalPrice) : undefined,
        grade: product.grade,
        image: primary,
        images,
        dataAiHint: product.name.toLowerCase().split(' ').slice(0, 2).join(' '),
        badge: product.badge,
        description: product.description,
        specs: product.specs || {},
        status: product.isAvailable ? 'In Stock' : 'Out of Stock',
        listingDate: product.createdAt.toISOString().split('T')[0],
        sku: `KW-${product.category.substring(0, 2).toUpperCase()}-${product.id.substring(0, 3)}`
      }
    })

    timer.checkpoint('Transform data')

    const response = {
      success: true,
      products: transformedProducts,
      pagination: {
        page,
        limit,
        total: transformedProducts.length,
        hasMore: transformedProducts.length === limit
      }
    }

    // Cache the response
    cache.set(cacheKey, response, CACHE_TTL)
    timer.checkpoint('Cache write')

    timer.end()

    return NextResponse.json(response, {
      headers: {
        'X-Cache': 'MISS',
        'X-Response-Time': `${timer.getTotal().toFixed(2)}ms`
      }
    })
  } catch (error) {
    timer.checkpoint('Error occurred')
    timer.end()
    console.error('Get products error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
