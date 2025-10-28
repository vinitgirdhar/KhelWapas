import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

interface RouteParams {
  params: {
    id: string
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    // Check if user is admin
    const currentUser = await getCurrentUser(request)
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      )
    }

  const body = await request.json()
  const { action, reason } = body // 'approve' or 'reject' + optional reason

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { success: false, message: 'Invalid action. Must be "approve" or "reject"' },
        { status: 400 }
      )
    }

    // Get the sell request
    const sellRequest = await prisma.sellRequest.findUnique({
      where: { id: params.id }
    })

    if (!sellRequest) {
      return NextResponse.json(
        { success: false, message: 'Sell request not found' },
        { status: 404 }
      )
    }

    if (action === 'approve') {
      // Create a product from the sell request
      const product = await prisma.product.create({
        data: {
          name: sellRequest.title,
          category: sellRequest.category,
          type: 'preowned', // Assuming sell requests are for preowned items
          price: sellRequest.price,
          grade: 'B', // Default grade, could be customizable
          imageUrls: sellRequest.imageUrls as unknown as any,
          description: sellRequest.description,
          specs: {
            "Contact Method": sellRequest.contactMethod,
            "Contact Detail": sellRequest.contactDetail || 'N/A'
          },
          badge: 'From Seller',
          isAvailable: true
        }
      })

      // Update sell request status to approved
      await prisma.sellRequest.update({
        where: { id: params.id },
        data: { status: 'Approved' }
      })

      return NextResponse.json({
        success: true,
        message: 'Sell request approved and product created',
        product: {
          id: product.id,
          name: product.name
        }
      })
    } else {
      // Reject the sell request
      await prisma.sellRequest.update({
        where: { id: params.id },
        data: { status: 'Rejected' }
      })

      return NextResponse.json({
        success: true,
        message: 'Sell request rejected'
      })
    }
  } catch (error) {
    console.error('Update sell request error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const currentUser = await getCurrentUser(request)
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      )
    }

    const sellRequest = await prisma.sellRequest.findUnique({
      where: { id: params.id },
      include: {
        user: { select: { id: true, fullName: true, email: true } }
      }
    })

    if (!sellRequest) {
      return NextResponse.json(
        { success: false, message: 'Sell request not found' },
        { status: 404 }
      )
    }

    // Transform the data to parse JSON fields
    const transformedRequest = {
      ...sellRequest,
      imageUrls: typeof sellRequest.imageUrls === 'string' 
        ? JSON.parse(sellRequest.imageUrls) 
        : sellRequest.imageUrls,
      price: Number(sellRequest.price),
      createdAt: sellRequest.createdAt.toISOString(),
      updatedAt: sellRequest.updatedAt.toISOString()
    }

    return NextResponse.json({ success: true, sellRequest: transformedRequest })
  } catch (error) {
    console.error('Get sell request error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
