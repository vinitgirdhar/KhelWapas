import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { requireUser } from '@/server/auth';
import { productUpdateSchema } from '@/lib/validation';
import { serializeProduct } from '@/server/marketplace/products';
import { apiError, ApiError } from '@/server/api';
type Context = { params: Promise<{ id: string }> };
export async function GET(_: NextRequest, { params }: Context) {
  try {
    const product = await prisma.product.findUnique({ where: { id: (await params).id } });
    if (!product) throw new ApiError(404, 'Product not found');
    return NextResponse.json({ success: true, product: serializeProduct(product) });
  } catch(e) { return apiError(e); }
}
export async function PATCH(request: NextRequest, { params }: Context) {
  try {
    await requireUser(request, true);
    const data = productUpdateSchema.parse(await request.json());
    const product = await prisma.product.update({ where: { id: (await params).id }, data });
    return NextResponse.json({ success: true, product: serializeProduct(product) });
  } catch(e) { return apiError(e); }
}
