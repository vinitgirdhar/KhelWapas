import { NextRequest, NextResponse } from 'next/server'
import { userDAL, productDAL, orderDAL } from '@/lib/dal'
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

    // Fetch all necessary data
    // Current month revenue
    const currentMonthOrders = orderDAL.findMany({
      where: {
        paymentStatus: 'paid'
      }
    }).filter(o => new Date(o.createdAt) >= currentMonthStart);
    const totalRevenue = currentMonthOrders.reduce((sum, o) => sum + Number(o.totalPrice), 0);

    // Last month revenue
    const lastMonthOrdersData = orderDAL.findMany({
      where: {
        paymentStatus: 'paid'
      }
    }).filter(o => {
      const date = new Date(o.createdAt);
      return date >= lastMonthStart && date <= lastMonthEnd;
    });
    const lastMonthRevenue = lastMonthOrdersData.reduce((sum, o) => sum + Number(o.totalPrice), 0);

    // Current month orders
    const totalOrders = orderDAL.findMany().filter(o => new Date(o.createdAt) >= currentMonthStart).length;

    // Last month orders
    const lastMonthOrders = orderDAL.findMany().filter(o => {
      const date = new Date(o.createdAt);
      return date >= lastMonthStart && date <= lastMonthEnd;
    }).length;

    // Current month users
    const totalUsers = userDAL.findMany({ where: { role: 'user' } }).filter(u => new Date(u.createdAt) >= currentMonthStart).length;

    // Last month users
    const lastMonthUsers = userDAL.findMany({ where: { role: 'user' } }).filter(u => {
      const date = new Date(u.createdAt);
      return date >= lastMonthStart && date <= lastMonthEnd;
    }).length;

    // Total products
  const totalProducts = productDAL.count({ isAvailable: 1 })

    // Calculate percentages
    const revenueChange = lastMonthRevenue
      ? ((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
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
          total: totalRevenue,
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
