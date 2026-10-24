import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/server/db';
import { requireUser } from '@/server/auth';
import { apiError, ApiError } from '@/server/api';
type Context = { params: Promise<{ id: string }> };
export async function PATCH(request: NextRequest, { params }: Context) {
  try {
    await requireUser(request, true);
    const { id } = await params;
    const data = z.object({ action: z.enum(['approve','reject']), reason: z.string().trim().max(1000).optional(), grade: z.enum(['A','B','C','D']).default('B') }).parse(await request.json());
    const result = await prisma.$transaction(async tx => {
      const listing = await tx.sellRequest.findUnique({ where: { id } });
      if (!listing) throw new ApiError(404, 'Listing not found');
      if (listing.status !== 'Pending') throw new ApiError(409, 'This listing has already been reviewed');
      const result = await tx.sellRequest.updateMany({ where: { id, status: 'Pending' }, data: { status: data.action === 'approve' ? 'Approved' : 'Rejected', reviewReason: data.reason || null } });
      if (!result.count) throw new ApiError(409, 'This listing was just reviewed');
      if (data.action === 'reject') return null;
      return tx.product.create({ data: { name: listing.title, category: listing.category, type: 'preowned', price: listing.price, grade: data.grade, imageUrls: listing.imageUrls!, description: listing.description, sellerId: listing.userId, sourceRequestId: listing.id, stock: 1, badge: 'Reviewed', isAvailable: true } });
    });
    return NextResponse.json({ success: true, message: data.action === 'approve' ? 'Listing approved and published' : 'Listing rejected', product: result && { id: result.id, name: result.name } });
  } catch (e) { return apiError(e); }
}
export async function GET(request: NextRequest, { params }: Context) {
  try {
    await requireUser(request, true);
    const listing = await prisma.sellRequest.findUnique({ where: { id: (await params).id }, include: { user: { select: { id: true, fullName: true, email: true } } } });
    if (!listing) throw new ApiError(404, 'Listing not found');
    return NextResponse.json({ success: true, sellRequest: { ...listing, price: Number(listing.price) } });
  } catch (e) { return apiError(e); }
}
