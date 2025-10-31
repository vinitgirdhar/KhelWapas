import { NextRequest, NextResponse } from 'next/server'
import { userDAL, orderDAL } from '@/lib/dal'
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

    // Get last 6 months of revenue data
    const now = new Date()
    const monthsData = []
    
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59)
      
      const monthOrders = orderDAL.findMany({
        where: { paymentStatus: 'paid' }
      }).filter(o => {
        const date = new Date(o.createdAt);
        return date >= monthStart && date <= monthEnd;
      });
      
      const revenue = monthOrders.reduce((sum, o) => sum + Number(o.totalPrice), 0);
      
      monthsData.push({
        month: monthStart.toLocaleString('en-US', { month: 'short' }),
        revenue: revenue,
      })
    }

    // Get sales by product type (from orders' items) - limit to recent orders for performance
    const allOrders = orderDAL.findMany({
      where: { paymentStatus: 'paid' },
      take: 1000, // Limit to last 1000 paid orders for performance
      orderBy: { createdAt: 'desc' }
    })

    const productTypeCounts = {
      'Pre-Owned': 0,
      'New Gear': 0,
      'Refurbished': 0,
    }

    // Count product types from order items
    for (const order of allOrders) {
      const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items
      if (Array.isArray(items)) {
        for (const item of items) {
          // This is a simplification - you might want to fetch actual product type from products table
          if (item.productName && item.productName.toLowerCase().includes('pre-owned')) {
            productTypeCounts['Pre-Owned'] += item.quantity || 1
          } else if (item.productName && item.productName.toLowerCase().includes('refurbished')) {
            productTypeCounts['Refurbished'] += item.quantity || 1
          } else {
            productTypeCounts['New Gear'] += item.quantity || 1
          }
        }
      }
    }

    const salesTypeData = [
      { name: 'Pre-Owned', value: productTypeCounts['Pre-Owned'], color: '#1E3A8A' },
      { name: 'New Gear', value: productTypeCounts['New Gear'], color: '#F97316' },
      { name: 'Refurbished', value: productTypeCounts['Refurbished'], color: '#10B981' },
    ]

    // Get recent sales (last 5 orders)
    const recentOrders = orderDAL.findMany({
      where: { paymentStatus: 'paid' },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: true }
    })

    const recentSales = recentOrders.map(order => {
      const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items
      const firstItem = Array.isArray(items) && items.length > 0 ? items[0] : {}
      
      return {
        id: `ORD-${order.id.substring(0, 3).toUpperCase()}`,
        customer: order.user.fullName,
        type: firstItem.productName?.toLowerCase().includes('pre-owned') ? 'Pre-Owned' : 'New Gear',
        status: order.paymentStatus === 'paid' ? 'Paid' : 'Pending',
        date: order.createdAt.split('T')[0],
        amount: Number(order.totalPrice),
      }
    })

    // Calculate summary stats
    const paidOrders = orderDAL.findMany({ where: { paymentStatus: 'paid' } });
    const totalRevenue = paidOrders.reduce((sum, o) => sum + Number(o.totalPrice), 0);

    const totalSales = orderDAL.count({ paymentStatus: 'paid' });

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const newCustomers = userDAL.findMany({ where: { role: 'user' } })
      .filter(u => new Date(u.createdAt) >= monthStart).length

    const itemsSold = allOrders.reduce((sum, order) => {
      const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items
      return sum + (Array.isArray(items) ? items.reduce((s, i) => s + (i.quantity || 1), 0) : 0)
    }, 0)

    return NextResponse.json({
      success: true,
      data: {
        revenueData: monthsData,
        salesTypeData,
        recentSales,
        summary: {
          totalRevenue: totalRevenue,
          totalSales,
          newCustomers,
          itemsSold,
        },
      },
    })
  } catch (error) {
    console.error('Error fetching revenue data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch revenue data' },
      { status: 500 }
    )
  }
}
