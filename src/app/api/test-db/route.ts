import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Test database connection by counting records
    const userCount = await prisma.user.count()
    const productCount = await prisma.product.count()
    const orderCount = await prisma.order.count()
    const sellRequestCount = await prisma.sellRequest.count()

    // Get sample data to verify structure
    const sampleUser = await prisma.user.findFirst({
      select: { id: true, fullName: true, email: true, role: true }
    })
    const sampleProduct = await prisma.product.findFirst({
      select: { id: true, name: true, category: true, price: true, isAvailable: true }
    })

    return NextResponse.json({
      success: true,
      message: 'Database connection successful - New Schema Active',
      data: {
        users: userCount,
        products: productCount,
        orders: orderCount,
        sellRequests: sellRequestCount
      },
      samples: {
        user: sampleUser,
        product: sampleProduct
      },
      schema: 'Updated with authentication and proper relationships'
    })
  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json({
      success: false,
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
