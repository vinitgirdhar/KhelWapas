import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request)
    if (!currentUser) {
      return NextResponse.json({ success: false, message: 'Auth required' }, { status: 401 })
    }

    const sellRequests = await prisma.sellRequest.findMany({
      where: { userId: currentUser.userId },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ success: true, sellRequests })
  } catch (error) {
    console.error('List user sell requests error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
