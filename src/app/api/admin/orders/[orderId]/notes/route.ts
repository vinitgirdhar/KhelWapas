import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { findOrder, changeOrderStatus } from '@/lib/orders';
import { apiError, ApiError } from '@/lib/api';
export async function POST(request: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    await requireUser(request, true);
    const order = await findOrder((await params).orderId);
    if (!order) throw new ApiError(404, 'Order not found');
    const { adminNotes } = z.object({ adminNotes: z.string().max(5000) }).parse(await request.json());
    const updated = await prisma.order.update({ where: { id: order.id }, data: { adminNotes } });
    return NextResponse.json({ success: true, order: updated, message: 'Order updated' });
  } catch (e) { return apiError(e); }
}
