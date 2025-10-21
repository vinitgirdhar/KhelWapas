import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request)
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get orders for current user or all orders if admin
    const where = currentUser.role === 'admin' ? {} : { userId: currentUser.userId }

    // Pagination support
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const orders = await prisma.order.findMany({
      where,
      select: {
        id: true,
        userId: true,
        items: true,
        totalPrice: true,
        fulfillmentStatus: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: skip
    })

    // Transform orders to match the frontend Order type
    const transformedOrders = orders.map((order) => {
      const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items
      const firstItem = Array.isArray(items) && items.length > 0 ? items[0] : {}

      return {
        id: order.id,
        orderId: `ORD-${order.id.substring(0, 8).toUpperCase()}`,
        customer: {
          id: order.user.id,
          name: order.user.fullName,
          email: order.user.email,
        },
        product: {
          id: firstItem.productId || order.id,
          name: firstItem.productName || 'Unknown Product',
          image: firstItem.image || '/images/products/background.jpg',
        },
        amount: Number(order.totalPrice),
        orderStatus: order.fulfillmentStatus,
        pickupStatus: getPickupStatus(order.fulfillmentStatus),
        orderDate: order.createdAt.toISOString(),
        items: items,
      }
    })

    return NextResponse.json({
      success: true,
      orders: transformedOrders
    })
  } catch (error) {
    console.error('Get orders error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to determine pickup status based on order status
function getPickupStatus(orderStatus: string): string {
  switch (orderStatus) {
    case 'Pending':
      return 'Pending'
    case 'Confirmed':
      return 'Scheduled'
    case 'Shipped':
      return 'In Progress'
    case 'Delivered':
      return 'Completed'
    case 'Cancelled':
      return 'Pending'
    default:
      return 'Pending'
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request)
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { items, paymentMethod, fulfillmentStatus = 'pending' } = body

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Order items are required' },
        { status: 400 }
      )
    }

    // Calculate total price
    let totalPrice = 0
    for (const item of items) {
      if (!item.productId || !item.quantity || !item.price) {
        return NextResponse.json(
          { success: false, message: 'Each item must have productId, quantity, and price' },
          { status: 400 }
        )
      }
      totalPrice += item.price * item.quantity
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        userId: currentUser.userId,
        items: items,
        totalPrice,
        paymentStatus: 'pending',
        fulfillmentStatus
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Order created successfully',
      order
    })
  } catch (error) {
    console.error('Create order error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
