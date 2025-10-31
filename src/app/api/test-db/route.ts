import { NextResponse } from 'next/server'
import { userDAL, productDAL, orderDAL, sellRequestDAL } from '@/lib/dal'

export async function GET() {
  try {
    // Test database connection by counting records
    const userCount = userDAL.count()
    const productCount = productDAL.count()
    const orderCount = orderDAL.count()
    const sellRequestCount = sellRequestDAL.count()

    // Get sample data to verify structure
    const users = userDAL.findMany({ take: 1 })
    const sampleUser = users[0] ? { id: users[0].id, fullName: users[0].fullName, email: users[0].email, role: users[0].role } : null
    const products = productDAL.findMany({ take: 1 })
    const sampleProduct = products[0] ? { id: products[0].id, name: products[0].name, category: products[0].category, price: products[0].price, isAvailable: products[0].isAvailable } : null

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
