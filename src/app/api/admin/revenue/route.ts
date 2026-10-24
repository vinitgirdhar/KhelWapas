import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { apiError } from '@/lib/api';

type SnapshotItem = { type?: string; quantity?: number };
function itemsFromSnapshot(snapshot: Prisma.JsonValue): SnapshotItem[] {
  try {
    const value = typeof snapshot === 'string' ? JSON.parse(snapshot) : snapshot;
    return Array.isArray(value) ? value.filter(item => item && typeof item === 'object') : [];
  } catch { return []; }
}
function productType(item: SnapshotItem) {
  if (item.type === 'preowned') return 'Pre-Owned';
  if (item.type === 'new') return 'New Gear';
  return 'Other / legacy';
}

export async function GET(request: NextRequest) {
  try {
    await requireUser(request, true);
    const now = new Date();
    const monthStart = (offset: number) => new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + offset, 1));
    const revenueData = await Promise.all(Array.from({ length: 6 }, async (_, index) => {
      const start = monthStart(index - 5), end = monthStart(index - 4);
      const revenue = await prisma.order.aggregate({
        _sum: { totalPrice: true },
        where: { paymentStatus: 'paid', createdAt: { gte: start, lt: end } },
      });
      return { month: start.toLocaleString('en-IN', { month: 'short', timeZone: 'UTC' }), revenue: Number(revenue._sum.totalPrice || 0) };
    }));
    const [totals, newCustomers, recentOrders] = await Promise.all([
      prisma.order.aggregate({ where: { paymentStatus: 'paid' }, _sum: { totalPrice: true }, _count: true }),
      prisma.user.count({ where: { role: 'user', createdAt: { gte: monthStart(0) } } }),
      prisma.order.findMany({
        where: { paymentStatus: 'paid' }, take: 5, orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
        select: { id: true, items: true, totalPrice: true, createdAt: true, user: { select: { fullName: true } } },
      }),
    ]);
    // Process every paid order in bounded batches. The previous 1,000-order cap
    // silently made the all-time item total and type breakdown disagree with sales.
    const counts: Record<string, number> = { 'Pre-Owned': 0, 'New Gear': 0, 'Other / legacy': 0 };
    let cursor: string | undefined;
    while (true) {
      const batch: { id: string; items: Prisma.JsonValue }[] = await prisma.order.findMany({
        where: { paymentStatus: 'paid' }, select: { id: true, items: true }, orderBy: { id: 'asc' }, take: 1000,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      });
      for (const order of batch) for (const item of itemsFromSnapshot(order.items)) {
        if (Number.isInteger(item.quantity) && item.quantity! > 0) counts[productType(item)] += item.quantity!;
      }
      if (batch.length < 1000) break;
      cursor = batch[batch.length - 1].id;
    }
    const colors: Record<string, string> = { 'Pre-Owned': '#1E3A8A', 'New Gear': '#F97316', 'Other / legacy': '#737373' };
    const salesTypeData = Object.entries(counts).map(([name, value]) => ({ name, value, color: colors[name] })).filter(item => item.value > 0);
    const recentSales = recentOrders.map(order => {
      const types = new Set(itemsFromSnapshot(order.items).map(productType));
      return {
        id: `ORD-${order.id.slice(0, 8).toUpperCase()}`, customer: order.user.fullName,
        type: types.size > 1 ? 'Mixed gear' : [...types][0] || 'Other / legacy', status: 'Paid',
        date: order.createdAt.toISOString().split('T')[0], amount: Number(order.totalPrice),
      };
    });
    return NextResponse.json({ success: true, data: {
      revenueData, salesTypeData, recentSales,
      summary: { totalRevenue: Number(totals._sum.totalPrice || 0), totalSales: totals._count, newCustomers, itemsSold: Object.values(counts).reduce((sum, value) => sum + value, 0) },
    } });
  } catch (error) { return apiError(error); }
}
