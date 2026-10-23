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
      orderBy: { createdAt: 'desc' },
      take: 100 // Limit to most recent 100 requests
    })

    const products = await prisma.product.findMany({ where: { sellerId: currentUser.userId }, select: { id: true, sourceRequestId: true, isAvailable: true, stock: true } });
    return NextResponse.json({ success: true, sellRequests: sellRequests.map(r => ({ ...r, price: Number(r.price), product: products.find(p => p.sourceRequestId === r.id) || null })) })
  } catch (error) {
    console.error('List user sell requests error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
