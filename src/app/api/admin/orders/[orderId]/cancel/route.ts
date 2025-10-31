import { NextRequest, NextResponse } from 'next/server'
import { orderDAL } from '@/lib/dal'
import { getCurrentUser } from '@/lib/auth'

export async function POST(
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
    const body = await request.json()
    const { reason } = body

    // Extract the UUID prefix from the short orderId format
    const idPrefix = orderId.replace('ORD-', '').toLowerCase()
    
    // Find order by the UUID prefix (DAL supports equality only, so filter in memory)
    const order = orderDAL
      .findMany()
      .find(o => o.id.toLowerCase().startsWith(idPrefix))

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      )
    }

    // Check if order can be cancelled
    if (order.fulfillmentStatus === 'Delivered' || order.fulfillmentStatus === 'Cancelled') {
      return NextResponse.json(
        { success: false, message: 'Order cannot be cancelled' },
        { status: 400 }
      )
    }

    // Update order status (updatedAt handled by DAL)
    orderDAL.update(
      { id: order.id },
      {
        fulfillmentStatus: 'Cancelled',
      }
    );

    // In a real app, you would:
    // - Send email notification to customer
    // - Process refund if payment was made
    // - Update inventory
    // - Log the cancellation reason

    return NextResponse.json({
      success: true,
      message: 'Order cancelled successfully'
    })
  } catch (error) {
    console.error('Cancel order error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
