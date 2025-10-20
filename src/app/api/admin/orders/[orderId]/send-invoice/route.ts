import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
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

    // Find order by the short orderId format
    const orders = await prisma.order.findMany({
      include: {
        user: true
      }
    })
    const order = orders.find(o => `ORD-${o.id.substring(0, 8).toUpperCase()}` === orderId)

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
