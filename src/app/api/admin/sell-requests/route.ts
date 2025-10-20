import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    const currentUser = await getCurrentUser(request)
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      )
    }

    // Get all sell requests with user information
    const sellRequests = await prisma.sellRequest.findMany({
      include: {
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
      }
    })

    // Transform the data to parse JSON fields
    const transformedRequests = sellRequests.map(request => ({
      ...request,
      imageUrls: typeof request.imageUrls === 'string' 
        ? JSON.parse(request.imageUrls) 
        : request.imageUrls,
      price: Number(request.price),
      createdAt: request.createdAt.toISOString(),
      updatedAt: request.updatedAt.toISOString()
    }))

    return NextResponse.json({
      success: true,
      sellRequests: transformedRequests
    })
  } catch (error) {
    console.error('Get sell requests error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
