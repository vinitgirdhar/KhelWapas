import { pagination, apiError } from '@/server/api';
import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '@/server/db';
import { requireUser } from '@/server/auth';

export async function GET(request: NextRequest) {
  try {
    await requireUser(request, true);
    const params = request.nextUrl.searchParams;
    const { page, limit, skip } = pagination(params, 20);
    const query = z.string().trim().max(100).parse(params.get('q') || '');
    const role = z.enum(['user', 'admin']).optional().parse(params.get('role') || undefined);
    const where: Prisma.UserWhereInput = { ...(role ? { role } : {}), ...(query ? { OR: [{ fullName: { contains: query } }, { email: { contains: query } }] } : {}) };
    const [users, total] = await prisma.$transaction([
      prisma.user.findMany({ where, select: { id: true, fullName: true, email: true, role: true, status: true, phone: true, rating: true, createdAt: true, updatedAt: true, _count: { select: { orders: true, sellRequests: true } } }, orderBy: [{ createdAt: 'desc' }, { id: 'asc' }], take: limit, skip }),
      prisma.user.count({ where }),
    ]);
    return NextResponse.json({ success: true, users, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) { return apiError(error); }
}
