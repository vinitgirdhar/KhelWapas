import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/server/db';
import { requireUser } from '@/server/auth';
import { apiError, ApiError } from '@/server/api';
import { emailSchema } from '@/lib/validation';
const select = { id: true, fullName: true, email: true, phone: true, role: true, status: true, createdAt: true, updatedAt: true, _count: { select: { orders: true, sellRequests: true } } };
type Context = { params: Promise<{ id: string }> };
export async function GET(request: NextRequest, { params }: Context) {
  try { await requireUser(request, true); const user = await prisma.user.findUnique({ where: { id: (await params).id }, select }); if (!user) throw new ApiError(404, 'User not found'); return NextResponse.json({ success: true, user }); } catch(e) { return apiError(e); }
}
export async function PATCH(request: NextRequest, { params }: Context) {
  try {
    const admin = await requireUser(request, true), { id } = await params;
    const data = z.object({ fullName: z.string().trim().min(2).max(100).optional(), email: emailSchema.optional(), phone: z.string().max(20).optional(), role: z.enum(['user','admin']).optional(), status: z.enum(['Active','Blocked','Pending']).optional() }).parse(await request.json());
    if (admin.userId === id && (data.role === 'user' || (data.status && data.status !== 'Active'))) throw new ApiError(400, 'You cannot remove your own admin access');
    const user = await prisma.$transaction(async tx => {
      const previous = await tx.user.findUniqueOrThrow({ where: { id } });
      if (previous.role === 'admin' && (data.role === 'user' || (data.status && data.status !== 'Active')) && await tx.user.count({ where: { role: 'admin', status: 'Active' } }) <= 1) throw new ApiError(409, 'At least one active admin must remain');
      return tx.user.update({ where: { id }, data: { ...data, ...(((data.role && data.role !== previous.role) || (data.status && data.status !== previous.status)) ? { sessionVersion: { increment: 1 } } : {}) }, select });
    });
    return NextResponse.json({ success: true, user });
  } catch(e) { return apiError(e); }
}
