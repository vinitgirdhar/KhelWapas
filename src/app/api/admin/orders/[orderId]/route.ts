import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const currentUser = await getCurrentUser(request)
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { orderId } = params

    // Find order by the short orderId format (ORD-XXXXX)
    const orders = await prisma.order.findMany({
      include: {
        user: true
      },
    })

    const order = orders.find(o => `ORD-${o.id.substring(0, 8).toUpperCase()}` === orderId)

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      )
    }

    // Get total orders for this customer
    const customerOrders = await prisma.order.count({
      where: { userId: order.userId }
    })

    // Get user's addresses
    const addresses = await prisma.address.findMany({
      where: { userId: order.userId },
      orderBy: { isDefault: 'desc' }
    })

    const shippingAddress = addresses[0] // Use first/default address
    const billingAddress = addresses[0]

    // Parse items
    const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items

    // Build timeline
    const timeline = [
      {
        status: 'Order Placed',
        timestamp: order.createdAt.toISOString(),
        description: 'Order was successfully placed'
      }
    ]

    if (order.fulfillmentStatus === 'Confirmed' || order.fulfillmentStatus === 'Shipped' || order.fulfillmentStatus === 'Delivered') {
      timeline.push({
        status: 'Order Confirmed',
        timestamp: order.updatedAt.toISOString(),
        description: 'Order has been confirmed and is being processed'
      })
    }

    if (order.fulfillmentStatus === 'Shipped' || order.fulfillmentStatus === 'Delivered') {
      timeline.push({
        status: 'Shipped',
        timestamp: order.updatedAt.toISOString(),
        description: 'Order has been shipped'
      })
    }

    if (order.fulfillmentStatus === 'Delivered') {
      timeline.push({
        status: 'Delivered',
        timestamp: order.updatedAt.toISOString(),
        description: 'Order has been delivered successfully'
      })
    }

    if (order.fulfillmentStatus === 'Cancelled') {
      timeline.push({
        status: 'Cancelled',
        timestamp: order.updatedAt.toISOString(),
        description: 'Order has been cancelled'
      })
    }

    const orderDetails = {
      id: order.id,
      orderId: `ORD-${order.id.substring(0, 8).toUpperCase()}`,
      customer: {
        id: order.user.id,
        name: order.user.fullName,
        email: order.user.email,
        phone: order.user.phone || undefined,
        profilePicture: order.user.profilePicture || undefined,
        totalOrders: customerOrders,
        status: 'Active', // User status would come from user data
      },
      items: items,
      amount: Number(order.totalPrice),
      orderStatus: order.fulfillmentStatus,
      paymentStatus: order.paymentStatus,
      paymentMethod: 'Credit Card', // This should come from payment data
      orderDate: order.createdAt.toISOString(),
      shippingAddress: shippingAddress ? {
        fullName: shippingAddress.fullName,
        phone: shippingAddress.phone,
        street: shippingAddress.street,
        city: shippingAddress.city,
        state: shippingAddress.state,
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country,
      } : undefined,
      billingAddress: billingAddress ? {
        fullName: billingAddress.fullName,
        phone: billingAddress.phone,
        street: billingAddress.street,
        city: billingAddress.city,
        state: billingAddress.state,
        postalCode: billingAddress.postalCode,
        country: billingAddress.country,
      } : undefined,
      trackingNumber: order.fulfillmentStatus === 'Shipped' || order.fulfillmentStatus === 'Delivered' 
        ? `TRK${order.id.substring(0, 12).toUpperCase()}` 
        : undefined,
      courierName: order.fulfillmentStatus === 'Shipped' || order.fulfillmentStatus === 'Delivered' 
        ? 'Delhivery' 
        : undefined,
      estimatedDelivery: order.fulfillmentStatus === 'Shipped' 
        ? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() 
        : undefined,
      actualDelivery: order.fulfillmentStatus === 'Delivered' 
        ? order.updatedAt.toISOString() 
        : undefined,
      notes: undefined, // Customer notes would come from order data
      adminNotes: undefined, // Admin notes would come from order data
      timeline,
    }

    return NextResponse.json({
      success: true,
      order: orderDetails
    })
  } catch (error) {
    console.error('Get order details error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
