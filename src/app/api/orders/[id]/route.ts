import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { apiError, ApiError } from '@/lib/api';
import { orderView } from '@/lib/order-view';
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser(request);
    const order = await prisma.order.findFirst({ where: { id: (await params).id, ...(user.role === 'admin' ? {} : { userId: user.userId }) }, include: { user: { select: { id: true, fullName: true, email: true, phone: true } }, events: { orderBy: { createdAt: 'asc' } } } });
    if (!order) throw new ApiError(404, 'Order not found');
    const view = orderView(order);
    if (user.role !== 'admin') view.adminNotes = null;
    return NextResponse.json({ success: true, order: view });
  } catch(e) { return apiError(e); }
}
