import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { apiError, ApiError } from '@/lib/api';
import { addressSchema } from '@/lib/validation';
export async function GET(request: NextRequest) {
  try { const user = await requireUser(request); return NextResponse.json(await prisma.address.findMany({ where: { userId: user.userId }, orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }], take: 20 })); } catch (e) { return apiError(e); }
}
export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request), data = addressSchema.parse(await request.json());
    const address = await prisma.$transaction(async tx => {
      if (await tx.address.count({ where: { userId: user.userId } }) >= 20) throw new ApiError(400, 'Maximum 20 addresses');
      if (data.isDefault) await tx.address.updateMany({ where: { userId: user.userId }, data: { isDefault: false } });
      return tx.address.create({ data: { ...data, userId: user.userId } });
    });
    return NextResponse.json(address, { status: 201 });
  } catch (e) { return apiError(e); }
}
