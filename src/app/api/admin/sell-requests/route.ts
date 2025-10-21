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

    // Pagination support
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    // Get all sell requests with user information
    const sellRequests = await prisma.sellRequest.findMany({
      select: {
        id: true,
        userId: true,
        fullName: true,
        email: true,
        category: true,
        title: true,
        description: true,
        price: true,
        contactMethod: true,
        contactDetail: true,
        imageUrls: true,
        status: true,
        createdAt: true,
        updatedAt: true,
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
