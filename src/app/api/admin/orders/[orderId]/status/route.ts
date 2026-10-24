import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUser } from '@/server/auth';
import { findOrder, changeOrderStatus } from '@/server/marketplace/orders';
import { apiError, ApiError } from '@/server/api';
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    await requireUser(request, true);
    const order = await findOrder((await params).orderId);
    if (!order) throw new ApiError(404, 'Order not found');
    const { status } = z.object({ status: z.string().max(30) }).parse(await request.json());
    const updated = await changeOrderStatus(order.id, status);
    return NextResponse.json({ success: true, order: updated, message: 'Order updated' });
  } catch (e) { return apiError(e); }
}
