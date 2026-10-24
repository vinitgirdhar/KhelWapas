import { z } from 'zod';
import { checkoutSchema, createDemoOrder } from '@/server/marketplace/orders';
import { requireUser } from '@/server/auth';
import { apiError, pagination } from '@/server/api';
import { rateLimit } from '@/server/rate-limit';
import { NextRequest,NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { getCurrentUser } from '@/server/auth';

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
    const { limit, skip } = pagination(searchParams)

    const orders = await prisma.order.findMany({
      where,
      select: {
        id: true,
        userId: true,
        items: true,
        totalPrice: true,
        paymentStatus: true,
        shippingAddress: true,
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
        total: Number(order.totalPrice),
        paymentStatus: order.paymentStatus,
        shippingAddress: order.shippingAddress,
        status: order.fulfillmentStatus,
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
  } catch (error) { return apiError(error); }
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
    const user = await requireUser(request);
    await rateLimit('checkout', user.userId, 30);
    const key = z.string().uuid('A checkout idempotency key is required').parse(request.headers.get('Idempotency-Key'));
    const input = checkoutSchema.parse(await request.json());
    const order = await createDemoOrder(user.userId, input, key);
    return NextResponse.json({ success: true, demo: true, order }, { status: 201 });
  } catch (error) { return apiError(error); }
}
