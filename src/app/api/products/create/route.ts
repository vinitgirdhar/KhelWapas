import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { requireUser } from '@/server/auth';
import { productSchema } from '@/lib/validation';
import { serializeProduct } from '@/server/marketplace/products';
import { apiError } from '@/server/api';
export async function POST(request: NextRequest) {
  try {
    await requireUser(request, true);
    const data = productSchema.parse(await request.json());
    const product = await prisma.product.create({ data });
    return NextResponse.json({ success: true, product: serializeProduct(product) }, { status: 201 });
  } catch(e) { return apiError(e); }
}
