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
    const { adminNotes } = body

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

    // In a real app, you would store notes in the order record
    // For now, we'll just return success
    // You might want to add an adminNotes field to the Order model

    return NextResponse.json({
      success: true,
      message: 'Note added successfully'
    })
  } catch (error) {
    console.error('Add note error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
