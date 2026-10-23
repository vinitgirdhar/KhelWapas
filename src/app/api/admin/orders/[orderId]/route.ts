import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { findOrder } from '@/lib/orders';
import { orderView } from '@/lib/order-view';
import { apiError, ApiError } from '@/lib/api';
export async function GET(request: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    await requireUser(request, true);
    const found = await findOrder((await params).orderId);
    if (!found) throw new ApiError(404, 'Order not found');
    const order = await prisma.order.findUniqueOrThrow({ where: { id: found.id }, include: { user: { select: { id: true, fullName: true, email: true, phone: true } }, events: { orderBy: { createdAt: 'asc' } } } });
    return NextResponse.json({ success: true, order: orderView(order) });
  } catch(e) { return apiError(e); }
}
