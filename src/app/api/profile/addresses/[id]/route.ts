import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { requireUser } from '@/server/auth';
import { apiError, ApiError } from '@/server/api';
import { addressUpdateSchema } from '@/lib/validation';
type Context = { params: Promise<{ id: string }> };
export async function PUT(request: NextRequest, { params }: Context) {
  try {
    const user = await requireUser(request), { id } = await params;
    const data = addressUpdateSchema.parse(await request.json());
    const result = await prisma.$transaction(async tx => {
      if (!await tx.address.findFirst({ where: { id, userId: user.userId } })) throw new ApiError(404, 'Address not found');
      if (data.isDefault) await tx.address.updateMany({ where: { userId: user.userId }, data: { isDefault: false } });
      return tx.address.update({ where: { id }, data });
    });
    return NextResponse.json(result);
  } catch (e) { return apiError(e); }
}
export async function DELETE(request: NextRequest, { params }: Context) {
  try {
    const user = await requireUser(request), { id } = await params;
    const result = await prisma.address.deleteMany({ where: { id, userId: user.userId } });
    if (!result.count) throw new ApiError(404, 'Address not found');
    return NextResponse.json({ success: true });
  } catch (e) { return apiError(e); }
}
