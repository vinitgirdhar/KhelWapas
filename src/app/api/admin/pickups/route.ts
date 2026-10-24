import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/server/db';
import { requireUser } from '@/server/auth';
import { apiError, ApiError } from '@/server/api';
export async function GET(request: NextRequest) {
  try { await requireUser(request, true); return NextResponse.json({ success: true, pickups: await prisma.pickup.findMany({ orderBy: { scheduledAt: 'desc' }, take: 100 }) }); } catch(e) { return apiError(e); }
}
export async function POST(request: NextRequest) {
  try {
    await requireUser(request, true);
    const data = z.object({ requestId: z.string().min(1).max(100), assignee: z.string().trim().min(2).max(100), scheduledAt: z.string().datetime().refine(v => new Date(v) > new Date(), 'Choose a future pickup time') }).parse(await request.json());
    if (!await prisma.sellRequest.findFirst({ where: { id: data.requestId, status: { not: 'Rejected' } } })) throw new ApiError(404, 'Active sell request not found');
    const pickup = await prisma.pickup.upsert({ where: { requestId: data.requestId }, create: { ...data, scheduledAt: new Date(data.scheduledAt) }, update: { assignee: data.assignee, scheduledAt: new Date(data.scheduledAt), status: 'Scheduled' } });
    return NextResponse.json({ success: true, pickup, demo: true });
  } catch(e) { return apiError(e); }
}
