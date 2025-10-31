import { NextRequest, NextResponse } from 'next/server'
import { sellRequestDAL } from '@/lib/dal'
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
    const sellRequests = sellRequestDAL.findMany({
      include: { user: true },
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
      createdAt: new Date(request.createdAt).toISOString(),
      updatedAt: new Date(request.updatedAt).toISOString()
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
