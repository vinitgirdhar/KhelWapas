import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { apiError } from '@/lib/api';
import { emailSchema, imageUrl } from '@/lib/validation';
const select = { id: true, fullName: true, email: true, phone: true, profilePicture: true, role: true, createdAt: true, updatedAt: true };
export async function GET(request: NextRequest) {
  try { const user = await requireUser(request); return NextResponse.json(await prisma.user.findUniqueOrThrow({ where: { id: user.userId }, select })); } catch (e) { return apiError(e); }
}
export async function PUT(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const data = z.object({ fullName: z.string().trim().min(2).max(100).optional(), email: emailSchema.optional(), phone: z.string().max(20).optional(), profilePicture: imageUrl.optional() }).parse(await request.json());
    return NextResponse.json(await prisma.user.update({ where: { id: user.userId }, data, select }));
  } catch (e) { return apiError(e); }
}
