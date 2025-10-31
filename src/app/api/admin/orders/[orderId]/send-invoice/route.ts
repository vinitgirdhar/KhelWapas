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

    // Extract the UUID prefix from the short orderId format
    const idPrefix = orderId.replace('ORD-', '').toLowerCase()
    
    // Find order by the UUID prefix (include user for email)
    const order = orderDAL
      .findMany({ include: { user: true } })
      .find(o => o.id.toLowerCase().startsWith(idPrefix))

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      )
    }

    // In a real app, you would:
    // - Generate invoice PDF
    // - Send email with invoice attachment
    // - Log the action
    
    // For now, just simulate success
  console.log(`Invoice sent to ${order.user.email} for order ${orderId}`)

    return NextResponse.json({
      success: true,
  message: `Invoice sent to ${order.user.email}`
    })
  } catch (error) {
    console.error('Send invoice error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
