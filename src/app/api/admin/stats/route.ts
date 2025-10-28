import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request)
    
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    // Get current month's start date
    const now = new Date()
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

    // Fetch all necessary data in parallel
    const [
      totalRevenue,
      lastMonthRevenue,
      totalOrders,
      lastMonthOrders,
      totalUsers,
      lastMonthUsers,
      totalProducts,
    ] = await Promise.all([
      // Current month revenue
      prisma.order.aggregate({
        _sum: { totalPrice: true },
        where: {
          paymentStatus: 'paid',
          createdAt: { gte: currentMonthStart },
        },
      }),
      // Last month revenue
      prisma.order.aggregate({
        _sum: { totalPrice: true },
        where: {
          paymentStatus: 'paid',
          createdAt: { gte: lastMonthStart, lte: lastMonthEnd },
        },
      }),
      // Current month orders
      prisma.order.count({
        where: { createdAt: { gte: currentMonthStart } },
      }),
      // Last month orders
      prisma.order.count({
        where: { createdAt: { gte: lastMonthStart, lte: lastMonthEnd } },
      }),
      // Current month users
      prisma.user.count({
        where: { 
          role: 'user',
          createdAt: { gte: currentMonthStart }
        },
      }),
      // Last month users
      prisma.user.count({
        where: { 
          role: 'user',
          createdAt: { gte: lastMonthStart, lte: lastMonthEnd }
        },
      }),
      // Total products
      prisma.product.count({
        where: { isAvailable: true },
      }),
    ])

    // Calculate percentages
    const revenueChange = lastMonthRevenue._sum.totalPrice
      ? ((Number(totalRevenue._sum.totalPrice || 0) - Number(lastMonthRevenue._sum.totalPrice)) / 
         Number(lastMonthRevenue._sum.totalPrice)) * 100
      : 0

    const ordersChange = lastMonthOrders
      ? ((totalOrders - lastMonthOrders) / lastMonthOrders) * 100
      : 0

    const usersChange = lastMonthUsers
      ? ((totalUsers - lastMonthUsers) / lastMonthUsers) * 100
      : 0

    const statsResponse = {
      success: true,
      stats: {
        revenue: {
          total: Number(totalRevenue._sum.totalPrice || 0),
          change: Number(revenueChange.toFixed(1)),
        },
        orders: {
          total: totalOrders,
          change: Number(ordersChange.toFixed(1)),
        },
        users: {
          total: totalUsers,
          change: Number(usersChange.toFixed(1)),
        },
        products: {
          total: totalProducts,
        },
      },
    }

    console.log('[Admin Stats] Response:', JSON.stringify(statsResponse, null, 2))
    
    return NextResponse.json(statsResponse)
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}
